import type { BaseSectionProps } from './types';

/**
 * Form component for the "Certyfikaty" custom section.
 * Manages a list of certifications with name, issuing organisation, and date.
 */
export function CertificationsSection({
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
}: BaseSectionProps) {
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
            <label className="block mb-1.5 text-gray-900 font-medium text-sm">Nazwa certyfikatu:</label>
            <input
              type="text"
              className="form-input w-full"
              value={item.data.name as string}
              onChange={(e) => onUpdateItem(section.id, item.id, 'name', e.target.value)}
              placeholder="np. AWS Solutions Architect"
            />
          </div>
          <div className="mb-[15px]">
            <label className="block mb-1.5 text-gray-900 font-medium text-sm">Organizacja:</label>
            <input
              type="text"
              className="form-input w-full"
              value={item.data.issuer as string}
              onChange={(e) => onUpdateItem(section.id, item.id, 'issuer', e.target.value)}
              placeholder="np. Amazon Web Services"
            />
          </div>
          <div className="mb-[15px]">
            <label className="block mb-1.5 text-gray-900 font-medium text-sm">Data uzyskania:</label>
            <input
              type="text"
              className="form-input w-full"
              value={item.data.date as string}
              onChange={(e) => onUpdateItem(section.id, item.id, 'date', e.target.value)}
              placeholder="np. 01/2023"
            />
          </div>
          <button type="button" onClick={() => onRemoveItem(section.id, item.id)} className="btn-remove mt-2.5">Usuń</button>
        </div>
      ))}

      <button type="button" onClick={() => onAddItem(section.id)} className="btn-add w-full">
        + Dodaj certyfikat
      </button>
    </div>
  );
}