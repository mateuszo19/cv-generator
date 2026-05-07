import type { CustomSection } from '../../types';

/**
 * Shared props accepted by all custom section form components.
 * Provides the section data and all necessary mutation callbacks.
 */
export interface BaseSectionProps {
  /** The section instance being rendered. */
  section: CustomSection;
  /** Updates the editable title of the section. */
  onUpdateTitle: (id: string, title: string) => void;
  /** Removes the entire section from the CV. */
  onRemoveSection: (id: string) => void;
  /** Moves the section up or down relative to its siblings. */
  onMoveSection: (id: string, direction: 'up' | 'down') => void;
  /** True when this section is first in the list — disables the up button. */
  isFirst: boolean;
  /** True when this section is last in the list — disables the down button. */
  isLast: boolean;
  /** Appends a new empty item to the section. */
  onAddItem: (sectionId: string) => void;
  /** Removes a specific item from the section. */
  onRemoveItem: (sectionId: string, itemId: string) => void;
  /** Updates a single field within a section item. */
  onUpdateItem: (sectionId: string, itemId: string, field: string, value: string | string[]) => void;
  /** Moves an item up or down within the section. */
  onMoveItem: (sectionId: string, itemId: string, direction: 'up' | 'down') => void;
}