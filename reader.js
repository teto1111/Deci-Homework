// reader.js
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

// Sync: Good for CLI tools where the script waits for the file
export const readSync = (path) => {
  return readFileSync(path, 'utf-8');
};

// Async: Essential for performance and non-blocking apps
export const readAsync = async (path) => {
  try {
    const data = await readFile(path, 'utf-8');
    return data;
  } catch (err) {
    throw new Error(`Failed to read file: ${err.message}`);
  }
};