import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const manifestPath = join(root, "assets/signature/final/manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const targets = ["assets/signature/final", "public/assets/signature/final"];
for (const directory of targets) {
  for (const asset of manifest.files) {
    const file = join(root, directory, asset.path);
    const hash = createHash("sha256").update(await readFile(file)).digest("hex");
    if (hash !== asset.sha256) throw new Error(`Brand asset mismatch: ${directory}/${asset.path}`);
  }
}
console.log(`Verified ${manifest.files.length} canonical assets in ${targets.length} locations.`);
