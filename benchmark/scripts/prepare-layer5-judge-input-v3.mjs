import fs from 'node:fs';
import path from 'node:path';

const VALIDATION_DIR = 'benchmark/validation/v3';
const NORMALIZED_FILE = path.join(VALIDATION_DIR, 'normalized_results_t001_t020.csv');
const TASKS_FILE = 'benchmark/tasks.jsonl';
const OUTPUT_JSONL = path.join(VALIDATION_DIR, 'layer5_judge_inputs_top5.jsonl');
const MANIFEST_FILE = path.join(VALIDATION_DIR, 'layer5_judge_input_manifest.json');

function parseCsv(csv) {
  const lines = csv.trim().split("\n");
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });
}

async function prepareInputs() {
  if (!fs.existsSync(NORMALIZED_FILE) || !fs.existsSync(TASKS_FILE)) {
    console.error('Missing required input files.');
    process.exit(1);
  }

  const results = parseCsv(fs.readFileSync(NORMALIZED_FILE, 'utf-8'));
  const tasks = fs.readFileSync(TASKS_FILE, 'utf-8').trim().split('\n').map(line => JSON.parse(line));
  const taskMap = new Map(tasks.map(t => [t.task_id, t]));

  const judgeInputs = [];
  const manifest = {
    generated_at: new Date().toISOString(),
    input_file: NORMALIZED_FILE,
    scope: 'top5_rows_per_method_task',
    total_tasks: tasks.length,
    processed_rows: 0,
    extracted_judge_inputs: 0
  };

  // Group by method and task, then take top 5
  const grouped = {};
  results.forEach(r => {
    const key = `${r.method}|${r.task_id}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  for (const key in grouped) {
    const rows = grouped[key].sort((a, b) => parseInt(a.result_rank) - parseInt(b.result_rank));
    const top5 = rows.slice(0, 5);

    top5.forEach(r => {
      const task = taskMap.get(r.task_id);
      const judgeInputId = `v3-judge-input-${r.method}-${r.task_id}-${r.result_rank}`;
      
      judgeInputs.push({
        judge_input_id: judgeInputId,
        method: r.method,
        task_id: r.task_id,
        result_rank: r.result_rank,
        research_question: task?.research_question || '',
        evaluation_focus: (task?.evaluation_focus || []).join(', '),
        candidate_title: r.title,
        candidate_authors: r.authors,
        candidate_year: r.year,
        candidate_journal: r.journal,
        candidate_doi: r.doi,
        candidate_notes: r.notes,
        validation_state: r.validation_state,
        notes: task ? '' : 'missing_task_context'
      });
      manifest.processed_rows++;
    });
  }

  manifest.extracted_judge_inputs = judgeInputs.length;

  fs.writeFileSync(OUTPUT_JSONL, judgeInputs.map(obj => JSON.stringify(rowToInput(obj))).join('\n'));
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

  console.log(`Layer 5 judge inputs prepared. ${judgeInputs.length} rows written to ${OUTPUT_JSONL}`);
}

function rowToInput(obj) {
    // Keep it minimal as per instruction
    return obj;
}

prepareInputs().catch(console.error);
