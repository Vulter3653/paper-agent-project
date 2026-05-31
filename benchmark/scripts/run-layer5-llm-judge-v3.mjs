import fs from 'node:fs';
import path from 'node:path';

const VALIDATION_DIR = 'benchmark/validation/v3';
const INPUT_JSONL = path.join(VALIDATION_DIR, 'layer5_judge_inputs_top5.jsonl');
const OUTPUT_JSONL = path.join(VALIDATION_DIR, 'layer5_judge_outputs_raw.jsonl');
const MANIFEST_FILE = path.join(VALIDATION_DIR, 'layer5_judge_run_manifest.json');

const PROMPT_FILE = 'benchmark/llm_judge_prompt_v2.md';

async function runJudge() {
  const judgeModel = process.env.BENCHMARK_JUDGE_MODEL;
  const judgeProvider = process.env.BENCHMARK_JUDGE_PROVIDER;
  const apiKey = process.env.BENCHMARK_JUDGE_API_KEY;
  const temperature = parseFloat(process.env.BENCHMARK_JUDGE_TEMPERATURE || '0');
  const topP = parseFloat(process.env.BENCHMARK_JUDGE_TOP_P || '1');

  const manifest = {
    generated_at: new Date().toISOString(),
    judge_model_identifier: judgeModel || 'not_available',
    judge_provider: judgeProvider || 'not_available',
    temperature,
    top_p: topP,
    prompt_file: PROMPT_FILE,
    status: 'pending_llm_judge_execution',
    evaluated_rows: 0,
    failed_rows: 0,
    pending_rows: 0
  };

  if (!fs.existsSync(INPUT_JSONL)) {
    console.error('Judge inputs not found. Run prepare script first.');
    process.exit(1);
  }

  const inputs = fs.readFileSync(INPUT_JSONL, 'utf-8').trim().split('\n').map(line => JSON.parse(line));
  manifest.pending_rows = inputs.length;

  if (!judgeModel || !judgeProvider) {
    console.log('No fixed judge model/provider configuration found. Marking as pending.');
    manifest.reason = 'No BENCHMARK_JUDGE_MODEL or BENCHMARK_JUDGE_PROVIDER environment variables found. Scores were not fabricated.';
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    return;
  }

  if (!apiKey) {
    console.log('Judge API key missing. Marking as pending.');
    manifest.reason = `Judge model ${judgeModel} identified but BENCHMARK_JUDGE_API_KEY is missing. Marking as pending to avoid fabrication.`;
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    return;
  }

  const promptTemplate = fs.readFileSync(PROMPT_FILE, 'utf-8');
  const outputs = [];
  
  console.log(`Starting Layer 5 judge execution: provider=${judgeProvider}, model=${judgeModel}, rows=${inputs.length}`);

  for (const input of inputs) {
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

      outputs.push({
        judge_input_id: input.judge_input_id,
        ...result
      });
      manifest.evaluated_rows++;

      // Basic rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error judging input ${input.judge_input_id}:`, error.message);
      manifest.failed_rows++;
      outputs.push({
        judge_input_id: input.judge_input_id,
        judge_status: 'failed',
        error: error.message
      });
    }
  }

  manifest.status = 'computed';
  manifest.pending_rows = 0;
  fs.writeFileSync(OUTPUT_JSONL, outputs.map(o => JSON.stringify(rowToOutput(o))).join('\n'));
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

  console.log(`Layer 5 judge execution complete. ${manifest.evaluated_rows} evaluated, ${manifest.failed_rows} failed.`);
}

function fillTemplate(template, data) {
  let result = template;
  for (const key in data) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), data[key] || '');
  }
  return result;
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

function rowToOutput(obj) {
    // Add implementation requirement checks
    if (!obj.judge_status && obj.relevance_score_v2 !== undefined) {
        obj.reasoning_validity = (obj.reason && obj.reason.length >= 30) ? "pass" : "fail";
    }
    return obj;
}

runJudge().catch(console.error);
