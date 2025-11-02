import fs from 'fs/promises';
import path from 'path';

export type Sponsor = {
  name: string;
  city?: string | null;
  website?: string | null;
};

function parseCsv(content: string): Sponsor[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Expect header: Sponsor Name,City
  const dataLines = lines[0].toLowerCase().includes('sponsor') ? lines.slice(1) : lines;

  const sponsors: Sponsor[] = [];
  for (const rawLine of dataLines) {
    // Simple split by comma; trim parts. Current dataset has no quoted commas.
    const parts = rawLine.split(',');
    const name = (parts[0] ?? '').trim();
    const cityRaw = (parts[1] ?? '').trim();
    if (!name) continue;
    sponsors.push({ name, city: cityRaw || null });
  }

  // Sort case-insensitively by name
  sponsors.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  return sponsors;
}

export async function readSponsorsFromCsv(csvPath?: string): Promise<Sponsor[]> {
  const filePath = csvPath ?? path.join(process.cwd(), 'sponsors.csv');
  const content = await fs.readFile(filePath, 'utf8');
  return parseCsv(content);
}


