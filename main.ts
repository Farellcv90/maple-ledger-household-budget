// Maple Ledger — hand-in program (Node 22, standard library only).
//
// The site itself is plain static files in app/ beside this file: no build
// step, no network requests, everything it shows held in its own files.
// This program hands the site in. It copies app/ and screenshots/ into the
// output directory and writes dossier.json there, built with the vendored
// make.fun library. The scorer rebuilds that dossier from its own copy of
// the library and compares the two byte for byte, so the file under
// vendor/makefun-frontend.ts must stay exactly as the kit handed it out.
//
// Run it locally with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the site itself with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outDir, { recursive: true });
cpSync(join(here, "app"), join(outDir, "app"), { recursive: true });
mkdirSync(join(outDir, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(outDir, "screenshots"), { recursive: true });
}

// Caps that mirror the gate: at most four screenshots, each at most 256 KiB;
// app/ at most 993 files and directories and 16 MiB in all; the dossier's
// own text capped at 160 KiB so the judge's outline stays readable.
writeFileSync(
  join(outDir, "dossier.json"),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
