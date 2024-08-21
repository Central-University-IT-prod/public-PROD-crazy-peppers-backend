export function shortenString(str: string, max_symbols: number) {
  if (str.length <= max_symbols) return str;
  return str.substring(0, max_symbols - 3) + '...';
}
