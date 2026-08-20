import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { CIRCUIT_PREFLIGHT_CONTRACTS, externalTestCircuit } from '../src/core/circuitPreflight';

async function main(): Promise<void> {
  const requested = process.argv[2];
  if (!requested) throw new Error('Usage: npm run export:preflights -- <output-directory>');
  const outputDirectory = path.resolve(requested);
  await mkdir(outputDirectory, { recursive: true });
  for (const contract of CIRCUIT_PREFLIGHT_CONTRACTS) {
    if (contract.mode !== 'external') continue;
    await writeFile(path.join(outputDirectory, `${contract.id}.dig`), externalTestCircuit(contract), 'utf8');
  }
  process.stdout.write(`Exported public Digital preflight harnesses to ${outputDirectory}\n`);
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
