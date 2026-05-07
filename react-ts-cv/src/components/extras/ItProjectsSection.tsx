import type { BaseSectionProps } from './types';

interface ItProjectsSectionProps extends BaseSectionProps {
  /** Appends an empty technology tag to an IT project item. */
  onAddTechnology: (sectionId: string, itemId: string) => void;
  /** Updates the value of a technology tag at a specific index. */
  onUpdateTechnology: (sectionId: string, itemId: string, techIndex: number, value: string) => void;
  /** Removes a technology tag at a specific index. */
  onRemoveTechnology: (sectionId: string, itemId: string, techIndex: number) => void;
}

/**
 * Form component for the "Projekty IT" custom section.
 * Manages a list of IT projects, each with name, description, technologies, and a link.
 */
export function ItProjectsSection({
  section,
  onUpdateTitle,
  onRemoveSection,
  onMoveSection,
  isFirst,
  isLast,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onMoveItem,
  onAddTechnology,
  onUpdateTechnology,
  onRemoveTechnology,
}: ItProjectsSectionProps) {
  const moveButtonClass =
    'px-2 py-0.5 text-xs border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed leading-none';

  return (
    <div className="border-2 border-gray-400 rounded-lg p-5 mb-5 bg-gray-50">
      <div className="flex justify-between items-center mb-[15px]">
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdateTitle(section.id, e.target.value)}
          className="text-lg font-semibold border-0 bg-transparent text-gray-900 flex-1 mr-2.5 focus:outline-none"
        />
        <div className="flex gap-1 items-center">
          <button type="button" onClick={() => onMoveSection(section.id, 'up')} disabled={isFirst} className={moveButtonClass} title="Przesuń sekcję w górę">▲</button>
          <button type="button" onClick={() => onMoveSection(section.id, 'down')} disabled={isLast} className={moveButtonClass} title="Przesuń sekcję w dół">▼</button>
          <button type="button" onClick={() => onRemoveSection(section.id)} className="btn-remove px-3 py-1.5 text-xs">Usuń sekcję</button>
        </div>
      </div>

      {section.items.map((item, itemIndex) => (
        <div key={item.id} className="bg-white p-[15px] rounded-md mb-3 border border-gray-300">
          <div className="flex justify-end gap-1 mb-3">
            <button type="button" onClick={() => onMoveItem(section.id, item.id, 'up')} disabled={itemIndex === 0} className={moveButtonClass} title="Przesuń w górę">▲</button>
            <button type="button" onClick={() => onMoveItem(section.id, item.id, 'down')} disabled={itemIndex === section.items.length - 1} className={moveButtonClass} title="Przesuń w dół">▼</button>
          </div>
          <div className="mb-[15px]">
            <label className="block mb-1.5 text-gray-900 font-medium text-sm">Nazwa projektu:</label>
            <input
              type="text"
              className="form-input w-full"
              value={item.data.name as string}
              onChange={(e) => onUpdateItem(section.id, item.id, 'name', e.target.value)}
              placeholder="np. Aplikacja webowa e-commerce"
            />
          </div>
          <div className="mb-[15px]">
            <label className="block mb-1.5 text-gray-900 font-medium text-sm">Opis:</label>
            <textarea
              className="form-input w-full resize-none"
              value={item.data.description as string}
              onChange={(e) => onUpdateItem(section.id, item.id, 'description', e.target.value)}
              placeholder="Krótki opis projektu..."
              rows={2}
            />
          </div>
          <div className="mb-[15px]">
            <label className="block mb-1.5 text-gray-900 font-medium text-sm">Technologie:</label>
            {Array.isArray(item.data.technologies) &&
              (item.data.technologies as string[]).map((tech, techIndex) => (
                <div key={techIndex} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="form-input flex-1"
                    value={tech}
                    onChange={(e) => onUpdateTechnology(section.id, item.id, techIndex, e.target.value)}
                    placeholder="np. React, TypeScript, Node.js"
                  />
                  <button type="button" onClick={() => onRemoveTechnology(section.id, item.id, techIndex)} className="btn-remove">Usuń</button>
                </div>
              ))}
            <button type="button" onClick={() => onAddTechnology(section.id, item.id)} className="btn-add text-[13px] px-3 py-1.5">
              + Dodaj technologię
            </button>
          </div>
          <div className="mb-[15px]">
            <label className="block mb-1.5 text-gray-900 font-medium text-sm">Link (opcjonalnie):</label>
            <input
              type="url"
              className="form-input w-full"
              value={item.data.link as string}
              onChange={(e) => onUpdateItem(section.id, item.id, 'link', e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
          <button type="button" onClick={() => onRemoveItem(section.id, item.id)} className="btn-remove mt-2.5">Usuń projekt</button>
        </div>
      ))}

      <button type="button" onClick={() => onAddItem(section.id)} className="btn-add w-full">
        + Dodaj projekt
      </button>
    </div>
  );
}