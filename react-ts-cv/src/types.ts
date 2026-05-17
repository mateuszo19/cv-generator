/** Identifies a reorderable top-level section in the CV document. */
export type CVSectionId = 'summary' | 'experience' | 'customSections' | 'additionalInfo';

/** Default rendering order for top-level CV sections. */
export const DEFAULT_SECTION_ORDER: CVSectionId[] = [
  'summary',
  'experience',
  'customSections',
  'additionalInfo',
];

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
  socialLinks: SocialLink[];
  summary: string;
  additionalInfo: AdditionalInfo[];
  experience: Experience[];
  customSections: CustomSection[];
  sectionOrder: CVSectionId[];
  language: 'pl' | 'en';
  cvFont: string;
  gdprConsent: boolean;
}

/** A named social media or web profile link. */
export interface SocialLink {
  /** Display name of the platform, e.g. "GitHub", "LinkedIn". */
  name: string;
  /** Full URL to the profile. */
  url: string;
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
