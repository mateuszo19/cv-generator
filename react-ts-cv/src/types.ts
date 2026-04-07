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
  summary: string; // Nowe pole: opis własny
  additionalInfo: AdditionalInfo[];
  experience: Experience[];
  customSections: CustomSection[]; // Nowe pole: personalizowane sekcje
  language: 'pl' | 'en'; // Nowe pole: język interfejsu
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
