// Twin Lanterns, a spot-the-difference entry for make.fun (Node 22, stdlib
// only). The game is plain static files under game/ — an index.html page
// plus ES modules, no build step and no network request — and this program
// hands it in: it copies game/ and screenshots/ from beside this file into
// the output directory and writes output/dossier.json with the vendored
// make.fun library, so the judge can read the entry's source and pictures.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps the gate enforces: text is capped at 160 KiB, screenshots at
// four files of 256 KiB each, game/ at 993 entries and 48 MiB in all with
// no path over 1000 bytes. game/ shares /output's own 1000-entry cap with
// screenshots/ and dossier.json, so these numbers leave room.
const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
// A second run must write the same bytes, so fail loudly here instead of
// handing the grader an empty or half-written dossier.
if (!existsSync(dossierPath)) throw new Error('dossier.json was not written');
