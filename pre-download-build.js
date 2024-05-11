/**
 * Copyright 2023 Continue
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fs = require("fs");
const { execSync } = require("child_process");

fs.mkdirSync("bin", { recursive: true });

const targetToLanceDb = {
  "darwin-arm64": "@lancedb/vectordb-darwin-arm64",
  "darwin-x64": "@lancedb/vectordb-darwin-x64",
  "linux-arm64": "@lancedb/vectordb-linux-arm64-gnu",
  "linux-x64": "@lancedb/vectordb-linux-x64-gnu",
  "win32-x64": "@lancedb/vectordb-win32-x64-msvc",
};

const platforms = ["darwin", "linux", "win32"];
const architectures = ["x64", "arm64"];
let targets = platforms.flatMap((platform) =>
  architectures.map((arch) => `${platform}-${arch}`),
);

console.log("[info] Building binaries with pkg...");
for (const target of targets) {
  const targetDir = `bin/${target}`;
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`[info] Building ${target}...`);
  // execSync(
  //   `npx pkg --no-bytecode --public-packages "*" --public pkgJson/${target} --out-path ${targetDir}`,
  // );

  // Download and unzip prebuilt sqlite3 binary for the target
  const downloadUrl = `https://github.com/TryGhost/node-sqlite3/releases/download/v5.1.7/sqlite3-v5.1.7-napi-v6-${
    target === "win32-arm64" ? "win32-ia32" : target
  }.tar.gz`;
  execSync(`curl -L -o ${targetDir}/build.tar.gz ${downloadUrl}`);
  execSync(`cd ${targetDir} && tar -xvzf build.tar.gz`);
  fs.copyFileSync(
    `${targetDir}/build/Release/node_sqlite3.node`,
    `${targetDir}/node_sqlite3.node`,
  );
  fs.unlinkSync(`${targetDir}/build.tar.gz`);
  fs.rmSync(`${targetDir}/build`, {
    recursive: true,
    force: true,
  });
}

console.log("[info] Downloading prebuilt lancedb...");
for (const target of targets) {
  if (targetToLanceDb[target]) {
    console.log(`[info] Downloading ${target}...`);
    execSync(`npm install -f ${targetToLanceDb[target]}@0.4.19 --no-save`);
  }
}
