import { memo } from 'react';
import { lighten, PRESET_COLORS } from '../lib/color';

interface CategoryColorPickerProps {
  selectedColor: string;
  hexValue: string;
  customColorLabel: string;
  swatchSizeClassName?: string;
  onSelect: (color: string) => void;
  onHexChange: (value: string) => void;
  onSave?: () => void;
}

export const CategoryColorPicker = memo(function CategoryColorPicker({
  selectedColor,
  hexValue,
  customColorLabel,
  swatchSizeClassName = 'h-9 w-9 sm:h-7 sm:w-7',
  onSelect,
  onHexChange,
  onSave,
}: CategoryColorPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESET_COLORS.map((swatch) => {
        const selected = swatch.toLowerCase() === selectedColor.toLowerCase();
        return (
          <button
            key={swatch}
            type="button"
            onClick={() => onSelect(swatch)}
            aria-label={`Use color ${swatch}`}
            aria-pressed={selected}
            className={`${swatchSizeClassName} cursor-pointer rounded-full border-2 transition-transform hover:scale-110 motion-reduce:transform-none`}
            style={{
              background: swatch,
              borderColor: selected ? 'var(--ink)' : 'rgba(var(--frost-rgb),0.6)',
              boxShadow: selected ? `0 0 0 3px ${lighten(swatch, 0.6)}` : '0 2px 6px -2px rgba(45,36,24,0.15)',
              touchAction: 'manipulation',
            }}
          />
        );
      })}
      <input
        value={hexValue}
        onChange={(event) => onHexChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSave?.();
        }}
        placeholder="#6b8db5"
        maxLength={7}
        aria-label={customColorLabel}
        className="h-9 w-24 rounded-full border bg-frost/50 px-2.5 text-center text-xs uppercase outline-none transition-colors focus:bg-frost/80 focus:ring-2 focus:ring-[var(--accent)]/30 sm:h-8"
        style={{ borderColor: 'rgba(var(--frost-rgb),0.8)', color: 'var(--ink)', fontFamily: "'Outfit', sans-serif" }}
      />
    </div>
  );
});
