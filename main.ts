// The Friday Ledger — round two entrypoint (Node 22, standard library only).
// Copies app/ and screenshots/ into the output directory and writes
// out/dossier.json with buildDossier from the kit's vendored library.
// Deterministic: no timestamps, no network, no random input — two runs on
// the same tree write byte-identical output.
import { buildDossier } from "./vendor/makefun-frontend.ts";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
  app_path_max_bytes: 1000,
};

function fail(message: string): never {
  console.error("main.ts: " + message);
  process.exit(1);
}

const appDir = join(ROOT, "app");
const shotsDir = join(ROOT, "screenshots");
if (!existsSync(join(appDir, "index.html"))) fail("app/index.html is missing");
if (!existsSync(shotsDir)) fail("screenshots/ is missing");

const shots = readdirSync(shotsDir)
  .filter((name) => !name.startsWith(".") && /\.(png|jpe?g)$/i.test(name))
  .sort();
if (shots.length < 3 || shots.length > 4) {
  fail("expected 3 or 4 screenshots, found " + shots.length);
}
for (const name of shots) {
  const size = statSync(join(shotsDir, name)).size;
  if (size > 262144) fail("screenshot " + name + " is " + size + " bytes, over the 262144 cap");
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(appDir, join(OUT, "app"), { recursive: true });
cpSync(shotsDir, join(OUT, "screenshots"), { recursive: true });

const dossier = buildDossier(OUT, CAPS);
writeFileSync(join(OUT, "dossier.json"), dossier);
console.log("wrote " + join(OUT, "dossier.json") + " (" + dossier.length + " bytes, " + shots.length + " screenshots)");
