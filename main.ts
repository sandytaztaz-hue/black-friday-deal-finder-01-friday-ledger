// main.ts — hands The Friday Ledger in.
//
// Copies app/ and screenshots/ from beside this file into the output
// directory (MAKEFUN_OUTPUT_DIR when set, otherwise /output), then writes
// /output/dossier.json with buildDossier from the kit's vendored library.
// Node 22, standard library only.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function handIn() {
  mkdirSync(outputDir, { recursive: true });
  for (const folder of ['app', 'screenshots']) {
    const source = resolve(repoRoot, folder);
    if (!existsSync(source)) throw new Error('missing folder beside main.ts: ' + folder);
    cpSync(source, resolve(outputDir, folder), { recursive: true, force: true });
  }
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
    app_path_max_bytes: 1000,
  });
  writeFileSync(resolve(outputDir, 'dossier.json'), dossier);
  console.log('handed in: app/ + screenshots/ + dossier.json -> ' + outputDir);
}

handIn();
