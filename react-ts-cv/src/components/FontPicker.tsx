import type { FontOption } from '../types';

/** All available font options for the CV document. */
export const FONT_OPTIONS: FontOption[] = [
  { value: 'Inter, sans-serif',             label: 'Inter',            googleFamily: 'Inter' },
  { value: 'Lato, sans-serif',              label: 'Lato',             googleFamily: 'Lato' },
  { value: 'Roboto, sans-serif',            label: 'Roboto',           googleFamily: 'Roboto' },
  { value: '"Playfair Display", serif',     label: 'Playfair Display', googleFamily: 'Playfair Display' },
  { value: 'Merriweather, serif',           label: 'Merriweather',     googleFamily: 'Merriweather' },
  { value: '"Source Serif 4", serif',       label: 'Source Serif 4',   googleFamily: 'Source Serif 4' },
  { value: 'Georgia, serif',               label: 'Georgia',           googleFamily: '' },
];

/** The default font used for new CV documents. */
export const DEFAULT_FONT = FONT_OPTIONS[0].value;

interface FontPickerProps {
  /** Currently selected font-family value. */
  value: string;
  /** Called when the user selects a different font. */
  onChange: (font: string) => void;
}

/**
 * Grid of clickable font cards that lets the user choose a typeface for the CV.
 * Each card renders its own label in the corresponding font so the user can
 * preview the appearance before selecting.
 */
export function FontPicker({ value, onChange }: FontPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {FONT_OPTIONS.map((font) => {
        const selected = value === font.value;
        return (
          <button
            key={font.value}
            type="button"
            onClick={() => onChange(font.value)}
            className={`px-4 py-3 rounded border-2 cursor-pointer transition-all text-left ${
              selected
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
            }`}
          >
            <span className="block text-[11px] font-medium mb-1 opacity-60 uppercase tracking-wide font-sans">
              {selected ? 'Wybrana' : 'Aa'}
            </span>
            <span
              className="block text-base leading-tight"
              style={{ fontFamily: font.value }}
            >
              {font.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}