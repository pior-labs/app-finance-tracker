export const FAVORITE_HOTKEY_LIMIT = 10;

export const PRESET_COLORS = ['#c96442', '#5b8a5a', '#6b8db5', '#a87cc4', '#d4a55a', '#e2738a', '#7ec1c1'];
export const DEFAULT_COLOR = PRESET_COLORS[2];
export const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export function favoriteHotkey(index: number): string | null {
  if (index < 0 || index >= FAVORITE_HOTKEY_LIMIT) return null;
  return index === 9 ? '0' : String(index + 1);
}

export function lighten(hex: string, amount = 0.75): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color);
}
