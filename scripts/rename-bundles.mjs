import { existsSync, readdirSync, renameSync, rmSync } from "node:fs";
import { extname, join } from "node:path";

const profile = process.argv[2] ?? "release";
const bundleRoot = join(process.cwd(), "src-tauri", "target", profile, "bundle");
const allowedExtensions = new Set([".msi", ".exe"]);

if (!existsSync(bundleRoot)) {
  console.log(`[rename-bundles] bundle directory not found: ${bundleRoot}`);
  process.exit(0);
}

const renameArtifacts = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      renameArtifacts(fullPath);
      continue;
    }

    if (!allowedExtensions.has(extname(entry.name)) || !entry.name.includes(" ")) {
      continue;
    }

    const nextName = entry.name.replaceAll(" ", "-");
    const nextPath = join(directory, nextName);

    if (existsSync(nextPath)) {
      rmSync(nextPath, { force: true });
    }

    renameSync(fullPath, nextPath);
    console.log(`[rename-bundles] ${entry.name} -> ${nextName}`);
  }
};

renameArtifacts(bundleRoot);
