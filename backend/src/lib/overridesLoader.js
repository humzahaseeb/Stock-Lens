import { readFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OVERRIDES_DIR = path.join(__dirname, '..', 'data', 'overrides');

/**
 * Loads the manually-curated override file for a ticker (business model,
 * competitive moat, bull/bear case, analyst consensus). These fields are
 * maintained as company-specific overrides.
 *
 * Fields the user hasn't researched yet carry `needsResearch: true` and a
 * `researchNote` describing exactly what to fill in before presenting.
 */
export async function loadOverrides(ticker) {
  const file = path.join(OVERRIDES_DIR, `${ticker}.json`);
  if (!existsSync(file)) {
    return null;
  }
  const raw = await readFile(file, 'utf-8');
  const data = JSON.parse(raw);
  return {
    ...data,
    bullCase: normalizePoints(data.bullCase),
    bearCase: normalizePoints(data.bearCase),
  };
}

function normalizePoints(section) {
  if (!section) return section;
  if (Array.isArray(section.points)) return section;
  // Still a placeholder string ("TODO_RESEARCH_REQUIRED") — wrap as a single-item list.
  return { ...section, points: [section.points] };
}

export function listAvailableOverrideTickers() {
  if (!existsSync(OVERRIDES_DIR)) return [];
  return readdirSync(OVERRIDES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}
