import fs from 'node:fs';
import path from 'node:path';

const VALIDATION_DIR = 'benchmark/validation/v3';
const INPUT_JSONL = path.join(VALIDATION_DIR, 'layer5_judge_inputs_top5.jsonl');
const OUTPUT_JSONL = path.join(VALIDATION_DIR, 'layer5_judge_outputs_raw.jsonl');
const MANIFEST_FILE = path.join(VALIDATION_DIR, 'layer5_judge_run_manifest.json');
const PROMPT_FILE = 'benchmark/llm_judge_prompt_v2.md';

const RESUME = process.env.BENCHMARK_JUDGE_RESUME !== 'false';
const RETRY_FAILED = process.env.BENCHMARK_JUDGE_RETRY_FAILED !== 'false';
const MAX_RETRIES = parseInt(process.env.BENCHMARK_JUDGE_MAX_RETRIES || '3');
const DEFAULT_DELAY_MS = parseInt(process.env.BENCHMARK_JUDGE_DELAY_MS || '65000');
const BACKOFF_MULTIPLIER = parseFloat(process.env.BENCHMARK_JUDGE_BACKOFF_MULTIPLIER || '1.5');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseRetryTime(errorMessage) {
  const match = errorMessage.match(/Please retry in ([\d.]+)s/);
  if (match) {
    return parseFloat(match[1]) * 1000;
  }
  return null;
}

async function callOpenAI(model, prompt, apiKey, options) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature,
      top_p: options.topP,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

async function callGoogle(model, prompt, apiKey, options) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature,
        topP: options.topP,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  return JSON.parse(content);
}

function fillTemplate(template, data) {
  let result = template;
  for (const key in data) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), data[key] || '');
  }
  return result;
}

function rowToOutput(obj) {
  if (!obj.judge_status && obj.relevance_score_v2 !== undefined) {
    obj.reasoning_validity = (obj.reason && obj.reason.length >= 30) ? "pass" : "fail";
  }
  return obj;
}

async function runRetry() {
  const judgeModel = process.env.BENCHMARK_JUDGE_MODEL;
  const judgeProvider = process.env.BENCHMARK_JUDGE_PROVIDER;
  const apiKey = process.env.BENCHMARK_JUDGE_API_KEY;
  const temperature = parseFloat(process.env.BENCHMARK_JUDGE_TEMPERATURE || '0');
  const topP = parseFloat(process.env.BENCHMARK_JUDGE_TOP_P || '1');

  if (!judgeModel || !judgeProvider || !apiKey) {
    console.error('Judge configuration missing (MODEL, PROVIDER, or API_KEY).');
    process.exit(1);
  }

  if (!fs.existsSync(INPUT_JSONL)) {
    console.error(`Input file not found: ${INPUT_JSONL}`);
    process.exit(1);
  }

  const inputs = fs.readFileSync(INPUT_JSONL, 'utf-8').trim().split('\n').map(line => JSON.parse(line));
  const existingOutputsMap = new Map();

  if (fs.existsSync(OUTPUT_JSONL)) {
    const lines = fs.readFileSync(OUTPUT_JSONL, 'utf-8').trim().split('\n');
    lines.forEach(line => {
      if (!line) return;
      const out = JSON.parse(line);
      // If multiple exists, prefer success
      if (existingOutputsMap.has(out.judge_input_id)) {
        const prev = existingOutputsMap.get(out.judge_input_id);
        if (prev.judge_status === 'failed' && out.judge_status !== 'failed') {
          existingOutputsMap.set(out.judge_input_id, out);
        }
      } else {
        existingOutputsMap.set(out.judge_input_id, out);
      }
    });
  }

  const targets = [];
  const finalOutputs = new Map(existingOutputsMap);
  let skippedCount = 0;

  for (const input of inputs) {
    const existing = existingOutputsMap.get(input.judge_input_id);
    const isFailed = existing && existing.judge_status === 'failed';
    const isMissing = !existing;

    if (RESUME && !isFailed && !isMissing) {
      skippedCount++;
      continue;
    }

    if (RETRY_FAILED && isFailed) {
      targets.push(input);
    } else if (isMissing) {
      targets.push(input);
    } else {
      skippedCount++;
    }
  }

  console.log(`Layer 5 Retry: Total=${inputs.length}, Skipped=${skippedCount}, To Evaluated=${targets.length}`);

  const promptTemplate = fs.readFileSync(PROMPT_FILE, 'utf-8');
  let newlyEvaluated = 0;
  let retryFailedCount = 0;

  for (const input of targets) {
    let attempts = 0;
    let success = false;
    let lastError = null;

    while (attempts < MAX_RETRIES && !success) {
      attempts++;
      try {
        const prompt = fillTemplate(promptTemplate, {
          research_question: input.research_question,
          evaluation_focus: input.evaluation_focus,
          title: input.candidate_title,
          abstract: input.candidate_notes || 'No abstract available.',
          journal: input.candidate_journal,
          year: input.candidate_year,
          doi: input.candidate_doi
        });

        let result;
        if (judgeProvider === 'openai') {
          result = await callOpenAI(judgeModel, prompt, apiKey, { temperature, topP });
        } else if (judgeProvider === 'google') {
          result = await callGoogle(judgeModel, prompt, apiKey, { temperature, topP });
        } else {
          throw new Error(`Unsupported judge provider: ${judgeProvider}`);
        }

        finalOutputs.set(input.judge_input_id, {
          judge_input_id: input.judge_input_id,
          ...result
        });
        success = true;
        newlyEvaluated++;
        console.log(`[SUCCESS] ${input.judge_input_id} (Attempt ${attempts})`);
        // Small delay between successful calls
        await sleep(500);
      } catch (error) {
        lastError = error.message;
        const isQuota = /quota exceeded|rate limit|free_tier_requests|429/i.test(lastError);
        console.error(`[FAILURE] ${input.judge_input_id} (Attempt ${attempts}): ${lastError}`);

        if (isQuota) {
          const waitTime = parseRetryTime(lastError) || DEFAULT_DELAY_MS;
          const totalWait = Math.max(waitTime, DEFAULT_DELAY_MS) * Math.pow(BACKOFF_MULTIPLIER, attempts - 1);
          console.log(`Quota exceeded. Waiting ${Math.round(totalWait/1000)}s before retry...`);
          await sleep(totalWait + 2000); // 2s buffer
        } else {
          // Non-quota error, maybe wait a bit then retry or break
          await sleep(2000);
        }
      }
    }

    if (!success) {
      retryFailedCount++;
      finalOutputs.set(input.judge_input_id, {
        judge_input_id: input.judge_input_id,
        judge_status: 'failed',
        error: lastError
      });
    }
  }

  // Final counts
  let totalSuccessful = 0;
  let totalFailed = 0;
  finalOutputs.forEach(out => {
    if (out.judge_status === 'failed') totalFailed++;
    else totalSuccessful++;
  });

  const status = totalSuccessful === inputs.length ? 'computed' : (totalSuccessful > 0 ? 'partial_computed' : 'failed');

  const manifest = {
    generated_at: new Date().toISOString(),
    judge_model_identifier: judgeModel,
    judge_provider: judgeProvider,
    temperature,
    top_p: topP,
    prompt_file: PROMPT_FILE,
    status,
    total_input_rows: inputs.length,
    successful_rows: totalSuccessful,
    failed_rows: totalFailed,
    pending_rows: inputs.length - (totalSuccessful + totalFailed),
    skipped_already_evaluated_rows: skippedCount,
    newly_evaluated_rows: newlyEvaluated,
    retry_failed_rows: retryFailedCount,
    max_retries: MAX_RETRIES,
    delay_ms: DEFAULT_DELAY_MS,
    scores_fabricated: false,
    api_key_committed: false
  };

  fs.writeFileSync(OUTPUT_JSONL, Array.from(finalOutputs.values()).map(o => JSON.stringify(rowToOutput(o))).join('\n'));
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

  console.log(`Layer 5 Retry Complete.`);
  console.log(`- Success: ${totalSuccessful}/${inputs.length}`);
  console.log(`- Failed: ${totalFailed}`);
  console.log(`- Newly Evaluated: ${newlyEvaluated}`);
}

runRetry().catch(console.error);
