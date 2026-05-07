export interface CVData {
  firstName: string;
  lastName: string;
  birthDate: string;
  photo: string | null;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  summary: string;
  additionalInfo: AdditionalInfo[];
  experience: Experience[];
  customSections: CustomSection[];
  language: 'pl' | 'en';
  cvFont: string;
}

/** A selectable font option for the CV document. */
export interface FontOption {
  /** CSS font-family value passed to the CV preview. */
  value: string;
  /** Human-readable name shown in the font picker. */
  label: string;
  /** URL fragment used to load the font from Google Fonts. */
  googleFamily: string;
}

export interface AdditionalInfo {
  label: string;
  content: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  jobDescription: string;
  description: string[];
}

export interface CustomSection {
  id: string;
  title: string;
  type: SectionType;
  items: CustomSectionItem[];
}

export type SectionType =
  | 'it-projects'
  | 'construction'
  | 'aviation'
  | 'education'
  | 'certifications'
  | 'skills'
  | 'languages'
  | 'custom';

export interface CustomSectionItem {
  id: string;
  data: Record<string, string | string[]>; // Elastyczne dane dla różnych typów sekcji
}
