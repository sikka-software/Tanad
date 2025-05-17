const fs = require("fs");
const path = require("path");

const modulesDir = "./src/modules";
const tsconfigPath = "./tsconfig.json"; // Or a separate paths file

try {
  const moduleSubDirs = fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  console.log("moduleSubDirs ", moduleSubDirs);
  const newPaths = {};
  moduleSubDirs.forEach((moduleName) => {
    newPaths[`@/${moduleName}/*`] = [`./src/modules/${moduleName}/*`];
  });

  console.log("newPaths ", newPaths);

  // Read existing tsconfig
  let tsconfigData = {};
  if (fs.existsSync(tsconfigPath)) {
    tsconfigData = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
  }

  // Ensure compilerOptions and paths exist
  tsconfigData.compilerOptions = tsconfigData.compilerOptions || {};
  tsconfigData.compilerOptions.paths = tsconfigData.compilerOptions.paths || {};

  // Merge new paths (or replace existing generated ones)
  // You might want a more sophisticated merge or a marker to identify generated paths
  Object.assign(tsconfigData.compilerOptions.paths, newPaths);

  // Add baseUrl if not present, as it's required for paths
  if (!tsconfigData.compilerOptions.baseUrl) {
    tsconfigData.compilerOptions.baseUrl = ".";
  }

  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfigData, null, 2) + "\n");
  console.log("tsconfig.json paths updated successfully.");
} catch (error) {
  console.error("Error updating tsconfig.json paths:", error);
}
