export function bytesToMB(bytes: number): number {
  return bytes / (1024 * 1024);
}

export function bytesToGB(bytes: number): number {
  return bytes / (1024 * 1024 * 1024);
}

export function bytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) {
    return `${mb.toFixed(2)} MB`;
  }
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}
