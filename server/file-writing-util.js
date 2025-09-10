import {promises as fs} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8088; // fixed typo (was POST)
const DATA_PATH = path.join(__dirname, 'products.json');

async function atomicWrite(file, data) {
  const tmp = file + '.tmp';
  await fs.writeFile(tmp, data);      // write new contents
  await fs.rename(tmp, file);         // atomic replace on same filesystem
}

let queue = Promise.resolve();
let pendingData = null;
let flushing = false;

export async function writeProducts(list) {
  // stringify once (JSON.stringify can be the slow part for big files)
  pendingData = JSON.stringify(list, null, 2);

  // coalesce multiple rapid writes into one disk write
  if (flushing) return queue;

  flushing = true;
  queue = queue.then(async () => {
    while (pendingData !== null) {
      const data = pendingData;
      pendingData = null;
      await atomicWrite(DATA_PATH, data);
    }
  }).finally(() => {
    flushing = false;
  });

  return queue;
}




