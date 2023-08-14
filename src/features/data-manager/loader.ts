import { existsSync, lstatSync } from "fs";
import { readFile, readdir } from "fs/promises";
import { join } from "path";

export type RawData = {
  name: string;
  data: Object;
};

export async function readJSONFile(path: string): Promise<RawData> {
  const raw = await readFile(path, "utf8");

  return { name: path, data: JSON.parse(raw) };
}

export async function loadJSONInFolder(path: string) {
  if (!existsSync(path)) {
    return [];
  }

  const isDirectory = lstatSync(path).isDirectory();

  if (isDirectory) {
    const files = await readdir(path);

    return files
      .filter((file) => file.includes(".json"))
      .map((file) => join(path, file));
  }

  return [];
}

export async function loadJSONFiles(
  directory: string,
  beforeEachFromParent = []
) {
  const beforeEachName = "before-each";
  const beforeAllName = "before-all";
  const beforeEachPath = join(directory, beforeEachName);
  const beforeAllPath = join(directory, beforeAllName);

  const beforeAll = await loadJSONInFolder(beforeAllPath);
  const beforeEachFromThis = await loadJSONInFolder(beforeEachPath);
  const beforeEach = [...beforeEachFromParent, ...beforeEachFromThis];
  const paths = await readdir(directory);
  const result = [...beforeAll];

  for (const path of paths) {
    const currentPath = join(directory, path);

    if ([beforeEachName, beforeAllName].includes(path)) {
      continue;
    }

    if (currentPath.includes(".json")) {
      result.push(...beforeEach, currentPath);
    }

    if (lstatSync(currentPath).isDirectory()) {
      const files = await loadJSONFiles(currentPath, beforeEach);

      result.push(...files);
    }
  }

  return result;
}

export async function loadData(directory: string) {
  const files = await loadJSONFiles(directory);

  return Promise.all(files.map(readJSONFile));
}
