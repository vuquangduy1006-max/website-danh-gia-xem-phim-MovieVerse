import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const viteCli = fileURLToPath(
  new URL("../node_modules/vite/bin/vite.js", import.meta.url),
);
const children = [
  spawn(
    process.execPath,
    ["--env-file-if-exists=.env", "server.js"],
    {
      cwd: projectRoot,
      stdio: "inherit",
    },
  ),
  spawn(process.execPath, [viteCli], {
    cwd: projectRoot,
    stdio: "inherit",
  }),
];
let stopping = false;

function stop(exitCode) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill();
  }
  process.exitCode = exitCode;
}

for (const child of children) {
  child.on("error", (error) => {
    console.error("Unable to start the MovieVerse development server:", error);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) stop(code ?? 1);
  });
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
