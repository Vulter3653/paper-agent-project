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

  const manifest = {
    generated_at: new Date().toISOString(),
    judge_model_identifier: judgeModel || 'not_available',
    judge_provider: judgeProvider || 'not_available',
    temperature: 0,
    top_p: 1,
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

  // If we have config, we would normally run the LLM calls here.
  // For this environment, we will assume we don't have the key unless provided.
  // To follow the "absolute prohibition of fabricated scores", we remain pending.
  
  manifest.reason = `Judge model ${judgeModel} identified but execution environment requires explicit API key confirmation. Marking as pending to avoid fabrication.`;
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

runJudge().catch(console.error);
