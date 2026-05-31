import fs from 'fs';
import path from 'path';

const VALIDATION_DIR = 'benchmark/validation/v3';
const FILES_TO_CHECK = [
  'normalized_results_t001_t020.csv',
  'layer1_foundation_metrics.csv',
  'layer2_schema_metrics.csv',
  'layer3_validity_metrics.csv',
  'layer4_retrieval_metrics_by_task.csv',
  'layer4_retrieval_metrics_by_method.csv',
  'layer4_retrieval_metrics_summary.json',
  'layer6_robustness_metrics.csv',
  'layer6_robustness_metrics_summary.json',
  'benchmark_v3_deterministic_metrics_summary.json',
  'reproducibility_manifest_t001_t020.json'
];

async function checkValidation() {
  console.log('Checking v3 deterministic validation outputs...');
  
  for (const file of FILES_TO_CHECK) {
    const filePath = path.join(VALIDATION_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing required output file: ${filePath}`);
      process.exit(1);
    }
  }

  const summaryPath = path.join(VALIDATION_DIR, 'benchmark_v3_deterministic_metrics_summary.json');
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

  const constraints = [
    { field: 'human_evaluation', expected: false },
    { field: 'llm_judge_executed', expected: false },
    { field: 'benchmark_execution_performed', expected: false }
  ];

  for (const c of constraints) {
    if (summary[c.field] !== c.expected) {
      console.error(`Summary constraint violation: ${c.field} should be ${c.expected}`);
      process.exit(1);
    }
  }

  if (!summary.computed_layers.includes('Layer 4: Retrieval Accuracy')) {
    console.error('Summary missing Layer 4 in computed_layers');
    process.exit(1);
  }

  if (!summary.computed_layers.includes('Layer 6: Robustness & Risk')) {
    console.error('Summary missing Layer 6 in computed_layers');
    process.exit(1);
  }

  if (summary.not_computed_layers.includes('Layer 6')) {
    console.error('Summary incorrectly includes Layer 6 in not_computed_layers');
    process.exit(1);
  }

  if (summary.claim_boundary.includes('full benchmark validation')) {
    if (!summary.claim_boundary.includes('not full benchmark validation')) {
       console.error('Summary makes unauthorized full validation claim');
       process.exit(1);
    }
  }

  console.log('v3 deterministic validation check PASS');
}

checkValidation().catch(console.error);
