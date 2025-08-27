export function parseAiJson(raw: string) {
  const cleaned = raw
    .replace(/```json/i, '')
    .replace(/```/g, '')
    .trim();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(cleaned);
}
