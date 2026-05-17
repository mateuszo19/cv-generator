import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { CVData, AdditionalInfo, Experience, CustomSection, CustomSectionItem, SectionType, SocialLink, CVSectionId } from './types';
import { DEFAULT_SECTION_ORDER } from './types';
import { CVPreview } from './components/CVPreview';
import { FontPicker, DEFAULT_FONT } from './components/FontPicker';
import {
  ItProjectsSection,
  EducationSection,
  SkillsSection,
  CertificationsSection,
  LanguagesSection,
  AviationSection,
  ConstructionSection,
  CustomGenericSection,
} from './components/extras';

/**
 * Root application component responsible for managing CV form state,
 * rendering the live preview, and handling import/export operations.
 */
function App() {
  const cvPreviewRef = useRef<HTMLDivElement>(null);

  const [cvData, setCvData] = useState<CVData>({
    firstName: '',
    lastName: '',
    birthDate: '',
    photo: null,
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    socialLinks: [],
    summary: '',
    additionalInfo: [],
    experience: [],
    customSections: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    language: 'pl',
    cvFont: DEFAULT_FONT,
    gdprConsent: true,
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    style: true,
    basic: true,
    contact: false,
    summary: false,
    experience: false,
    customSections: false,
    additional: false,
    sectionOrder: false,
  });

  /**
   * Toggles the expanded state of a collapsible form section.
   * @param sectionId - The unique identifier of the section to toggle.
   */
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  /**
   * Changes the CV language and optionally triggers translation via MyMemory API.
   * @param lang - Target language code ('pl' or 'en').
   */
  const changeLanguage = async (lang: 'pl' | 'en') => {
    if (lang === cvData.language) return;

    const confirmTranslate = window.confirm(
      lang === 'en'
        ? 'Czy chcesz przetłumaczyć CV na język angielski? To może chwilę potrwać.'
        : 'Czy chcesz przywrócić język polski?'
    );

    if (!confirmTranslate) return;

    if (lang === 'en') {
      try {
        const translatedData = { ...cvData, language: lang };

        const textsToTranslate: string[] = [];

        if (cvData.summary) textsToTranslate.push(cvData.summary);
        cvData.experience.forEach((exp) => {
          if (exp.jobDescription) textsToTranslate.push(exp.jobDescription);
          textsToTranslate.push(exp.company, exp.position);
          exp.description.forEach((desc) => textsToTranslate.push(desc));
        });
        cvData.additionalInfo.forEach((info) => {
          textsToTranslate.push(info.label, info.content);
        });
        cvData.customSections.forEach((section) => {
          section.items.forEach((item) => {
            if (section.type === 'languages') {
              if (item.data.language) textsToTranslate.push(item.data.language as string);
              if (item.data.level) textsToTranslate.push(item.data.level as string);
            } else if (section.type === 'certifications') {
              if (item.data.name) textsToTranslate.push(item.data.name as string);
              if (item.data.issuer) textsToTranslate.push(item.data.issuer as string);
            } else if (section.type === 'it-projects') {
              if (item.data.name) textsToTranslate.push(item.data.name as string);
              if (item.data.description) textsToTranslate.push(item.data.description as string);
            } else if (section.type === 'education') {
              if (item.data.school) textsToTranslate.push(item.data.school as string);
              if (item.data.degree) textsToTranslate.push(item.data.degree as string);
              if (item.data.field) textsToTranslate.push(item.data.field as string);
            } else if (section.type === 'skills') {
              if (item.data.category) textsToTranslate.push(item.data.category as string);
              if (item.data.skills) textsToTranslate.push(item.data.skills as string);
            }
          });
        });

        if (textsToTranslate.length > 0) {
          const translations = await Promise.all(
            textsToTranslate.map(async (text) => {
              try {
                const response = await fetch(
                  `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=pl|en`
                );
                const data = await response.json();
                return data.responseData.translatedText || text;
              } catch {
                return text;
              }
            })
          );

          let index = 0;
          if (cvData.summary) translatedData.summary = translations[index++];
          translatedData.experience = cvData.experience.map((exp) => {
            const translatedExp: any = {
              ...exp,
              company: translations[index++],
              position: translations[index++],
            };
            if (exp.jobDescription) translatedExp.jobDescription = translations[index++];
            translatedExp.description = exp.description.map(() => translations[index++]);
            return translatedExp;
          });
          translatedData.additionalInfo = cvData.additionalInfo.map((_info) => ({
            label: translations[index++],
            content: translations[index++],
          }));
          translatedData.customSections = cvData.customSections.map((section) => {
            const newSection = { ...section };
            newSection.items = section.items.map((item) => {
              const newItem = { ...item, data: { ...item.data } };
              if (section.type === 'languages') {
                if (item.data.language) newItem.data.language = translations[index++];
                if (item.data.level) newItem.data.level = translations[index++];
              } else if (section.type === 'certifications') {
                if (item.data.name) newItem.data.name = translations[index++];
                if (item.data.issuer) newItem.data.issuer = translations[index++];
              } else if (section.type === 'it-projects') {
                if (item.data.name) newItem.data.name = translations[index++];
                if (item.data.description) newItem.data.description = translations[index++];
              } else if (section.type === 'education') {
                if (item.data.school) newItem.data.school = translations[index++];
                if (item.data.degree) newItem.data.degree = translations[index++];
                if (item.data.field) newItem.data.field = translations[index++];
              } else if (section.type === 'skills') {
                if (item.data.category) newItem.data.category = translations[index++];
                if (item.data.skills) newItem.data.skills = translations[index++];
              }
              return newItem;
            });
            return newSection;
          });

          setCvData(translatedData);
        } else {
          setCvData(translatedData);
        }
      } catch (error) {
        alert('Wystąpił błąd podczas tłumaczenia. Spróbuj ponownie.');
        console.error(error);
      }
    } else {
      setCvData({ ...cvData, language: lang });
    }
  };

  /**
   * Adds a new custom section of the given type to the CV.
   * @param type - The section type to create.
   */
  const addCustomSection = (type: SectionType) => {
    const titles: Record<SectionType, string> = {
      'it-projects': 'Projekty IT',
      'construction': 'Doświadczenie w budownictwie',
      'aviation': 'Lotnictwo',
      'education': 'Wykształcenie',
      'certifications': 'Certyfikaty',
      'skills': 'Umiejętności',
      'languages': 'Języki obce',
      'custom': 'Własna sekcja',
    };

    const newSection: CustomSection = {
      id: Date.now().toString(),
      title: titles[type],
      type,
      items: [],
    };

    setCvData({
      ...cvData,
      customSections: [...cvData.customSections, newSection],
    });
    setExpandedSections({ ...expandedSections, customSections: true });
  };

  /**
   * Removes a custom section by its ID.
   * @param sectionId - ID of the section to remove.
   */
  const removeCustomSection = (sectionId: string) => {
    const newSections = cvData.customSections.filter((s) => s.id !== sectionId);
    setCvData({ ...cvData, customSections: newSections });
  };

  /**
   * Updates the display title of a custom section.
   * @param sectionId - ID of the section to update.
   * @param title - New title value.
   */
  const updateSectionTitle = (sectionId: string, title: string) => {
    const newSections = cvData.customSections.map((s) =>
      s.id === sectionId ? { ...s, title } : s
    );
    setCvData({ ...cvData, customSections: newSections });
  };

  /**
   * Appends a new empty item to a custom section based on its type.
   * @param sectionId - ID of the section to add an item to.
   */
  const addSectionItem = (sectionId: string) => {
    const section = cvData.customSections.find((s) => s.id === sectionId);
    if (!section) return;

    let newItem: CustomSectionItem;

    switch (section.type) {
      case 'it-projects':
        newItem = {
          id: Date.now().toString(),
          data: { name: '', description: '', technologies: [], link: '' },
        };
        break;
      case 'education':
        newItem = {
          id: Date.now().toString(),
          data: { school: '', degree: '', field: '', startDate: '', endDate: '' },
        };
        break;
      case 'skills':
        newItem = {
          id: Date.now().toString(),
          data: { category: '', skills: '' },
        };
        break;
      case 'certifications':
        newItem = {
          id: Date.now().toString(),
          data: { name: '', issuer: '', date: '' },
        };
        break;
      case 'languages':
        newItem = {
          id: Date.now().toString(),
          data: { language: '', level: '' },
        };
        break;
      case 'aviation':
        newItem = {
          id: Date.now().toString(),
          data: { license: '', hours: '', type: '' },
        };
        break;
      case 'construction':
        newItem = {
          id: Date.now().toString(),
          data: { project: '', role: '', duration: '', scope: '' },
        };
        break;
      default:
        newItem = {
          id: Date.now().toString(),
          data: {},
        };
    }

    const newSections = cvData.customSections.map((s) =>
      s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
    );
    setCvData({ ...cvData, customSections: newSections });
  };

  /**
   * Updates a specific field within a custom section item.
   * @param sectionId - ID of the parent section.
   * @param itemId - ID of the item to update.
   * @param field - Field name within the item data.
   * @param value - New value for the field.
   */
  const updateSectionItem = (sectionId: string, itemId: string, field: string, value: string | string[]) => {
    const newSections = cvData.customSections.map((s) => {
      if (s.id === sectionId) {
        const newItems = s.items.map((item) =>
          item.id === itemId ? { ...item, data: { ...item.data, [field]: value } } : item
        );
        return { ...s, items: newItems };
      }
      return s;
    });
    setCvData({ ...cvData, customSections: newSections });
  };

  /**
   * Removes an item from a custom section.
   * @param sectionId - ID of the parent section.
   * @param itemId - ID of the item to remove.
   */
  const removeSectionItem = (sectionId: string, itemId: string) => {
    const newSections = cvData.customSections.map((s) => {
      if (s.id === sectionId) {
        return { ...s, items: s.items.filter((item) => item.id !== itemId) };
      }
      return s;
    });
    setCvData({ ...cvData, customSections: newSections });
  };

  /**
   * Appends an empty technology entry to an IT project item.
   * @param sectionId - ID of the parent section.
   * @param itemId - ID of the IT project item.
   */
  const addTechnology = (sectionId: string, itemId: string) => {
    const section = cvData.customSections.find((s) => s.id === sectionId);
    if (!section) return;

    const item = section.items.find((i) => i.id === itemId);
    if (!item || !Array.isArray(item.data.technologies)) return;

    const newTechnologies = [...(item.data.technologies as string[]), ''];
    updateSectionItem(sectionId, itemId, 'technologies', newTechnologies);
  };

  /**
   * Updates a technology entry at a specific index within an IT project item.
   * @param sectionId - ID of the parent section.
   * @param itemId - ID of the IT project item.
   * @param techIndex - Index of the technology to update.
   * @param value - New technology name.
   */
  const updateTechnology = (sectionId: string, itemId: string, techIndex: number, value: string) => {
    const section = cvData.customSections.find((s) => s.id === sectionId);
    if (!section) return;

    const item = section.items.find((i) => i.id === itemId);
    if (!item || !Array.isArray(item.data.technologies)) return;

    const newTechnologies = [...(item.data.technologies as string[])];
    newTechnologies[techIndex] = value;
    updateSectionItem(sectionId, itemId, 'technologies', newTechnologies);
  };

  /**
   * Removes a technology entry at a specific index from an IT project item.
   * @param sectionId - ID of the parent section.
   * @param itemId - ID of the IT project item.
   * @param techIndex - Index of the technology to remove.
   */
  const removeTechnology = (sectionId: string, itemId: string, techIndex: number) => {
    const section = cvData.customSections.find((s) => s.id === sectionId);
    if (!section) return;

    const item = section.items.find((i) => i.id === itemId);
    if (!item || !Array.isArray(item.data.technologies)) return;

    const newTechnologies = (item.data.technologies as string[]).filter((_, i) => i !== techIndex);
    updateSectionItem(sectionId, itemId, 'technologies', newTechnologies);
  };

  /**
   * Reads a selected image file and stores it as a base64 data URL in CV state.
   * @param e - File input change event.
   */
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCvData({ ...cvData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Appends an empty additional info entry to the CV.
   */
  const addAdditionalInfo = () => {
    setCvData({
      ...cvData,
      additionalInfo: [...cvData.additionalInfo, { label: '', content: '' }],
    });
  };

  /**
   * Updates a specific field of an additional info entry.
   * @param index - Array index of the entry to update.
   * @param field - Field name to update ('label' or 'content').
   * @param value - New value.
   */
  const updateAdditionalInfo = (index: number, field: keyof AdditionalInfo, value: string) => {
    const newInfo = [...cvData.additionalInfo];
    newInfo[index][field] = value;
    setCvData({ ...cvData, additionalInfo: newInfo });
  };

  /**
   * Removes an additional info entry at the given index.
   * @param index - Array index of the entry to remove.
   */
  const removeAdditionalInfo = (index: number) => {
    const newInfo = cvData.additionalInfo.filter((_, i) => i !== index);
    setCvData({ ...cvData, additionalInfo: newInfo });
  };

  /**
   * Moves an additional info entry one position up or down in the list.
   * @param index - Current array index of the entry.
   * @param direction - Direction to move: 'up' decrements index, 'down' increments it.
   */
  const moveAdditionalInfo = (index: number, direction: 'up' | 'down') => {
    const newInfo = [...cvData.additionalInfo];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newInfo.length) return;
    [newInfo[index], newInfo[targetIndex]] = [newInfo[targetIndex], newInfo[index]];
    setCvData({ ...cvData, additionalInfo: newInfo });
  };

  /**
   * Appends an empty social link entry to the CV.
   */
  const addSocialLink = () => {
    setCvData({ ...cvData, socialLinks: [...cvData.socialLinks, { name: '', url: '' }] });
  };

  /**
   * Updates a specific field of a social link entry.
   * @param index - Array index of the entry to update.
   * @param field - Field to update ('name' or 'url').
   * @param value - New value.
   */
  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...cvData.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setCvData({ ...cvData, socialLinks: updated });
  };

  /**
   * Removes a social link entry at the given index.
   * @param index - Array index of the entry to remove.
   */
  const removeSocialLink = (index: number) => {
    setCvData({ ...cvData, socialLinks: cvData.socialLinks.filter((_, i) => i !== index) });
  };

  /**
   * Appends a new empty work experience entry to the CV.
   */
  const addExperience = () => {
    setCvData({
      ...cvData,
      experience: [...cvData.experience, { company: '', position: '', startDate: '', endDate: '', jobDescription: '', description: [''] }],
    });
  };

  /**
   * Updates a scalar field of a work experience entry.
   * @param index - Array index of the experience entry.
   * @param field - Experience field to update.
   * @param value - New value.
   */
  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExp = [...cvData.experience];
    if (field !== 'description') {
      newExp[index] = { ...newExp[index], [field]: value };
      setCvData({ ...cvData, experience: newExp });
    }
  };

  /**
   * Appends an empty bullet point to a work experience entry's description list.
   * @param expIndex - Index of the experience entry.
   */
  const addDescriptionPoint = (expIndex: number) => {
    const newExp = [...cvData.experience];
    newExp[expIndex].description.push('');
    setCvData({ ...cvData, experience: newExp });
  };

  /**
   * Updates the text of a specific bullet point within a work experience entry.
   * @param expIndex - Index of the experience entry.
   * @param descIndex - Index of the bullet point to update.
   * @param value - New text value.
   */
  const updateDescriptionPoint = (expIndex: number, descIndex: number, value: string) => {
    const newExp = [...cvData.experience];
    newExp[expIndex].description[descIndex] = value;
    setCvData({ ...cvData, experience: newExp });
  };

  /**
   * Removes a bullet point at a given index from a work experience entry.
   * @param expIndex - Index of the experience entry.
   * @param descIndex - Index of the bullet point to remove.
   */
  const removeDescriptionPoint = (expIndex: number, descIndex: number) => {
    const newExp = [...cvData.experience];
    newExp[expIndex].description = newExp[expIndex].description.filter((_, i) => i !== descIndex);
    setCvData({ ...cvData, experience: newExp });
  };

  /**
   * Removes a work experience entry at the given index.
   * @param index - Index of the experience entry to remove.
   */
  const removeExperience = (index: number) => {
    const newExp = cvData.experience.filter((_, i) => i !== index);
    setCvData({ ...cvData, experience: newExp });
  };

  /**
   * Moves a work experience entry one position up or down in the list.
   * @param index - Current array index of the entry.
   * @param direction - Direction to move: 'up' decrements index, 'down' increments it.
   */
  const moveExperience = (index: number, direction: 'up' | 'down') => {
    const newExp = [...cvData.experience];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newExp.length) return;
    [newExp[index], newExp[targetIndex]] = [newExp[targetIndex], newExp[index]];
    setCvData({ ...cvData, experience: newExp });
  };

  /**
   * Moves a custom section one position up or down in the sections list.
   * @param sectionId - ID of the section to move.
   * @param direction - Direction to move.
   */
  const moveCustomSection = (sectionId: string, direction: 'up' | 'down') => {
    const index = cvData.customSections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;
    const newSections = [...cvData.customSections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setCvData({ ...cvData, customSections: newSections });
  };

  /**
   * Moves an item within a custom section one position up or down.
   * @param sectionId - ID of the parent section.
   * @param itemId - ID of the item to move.
   * @param direction - Direction to move.
   */
  const moveCustomSectionItem = (sectionId: string, itemId: string, direction: 'up' | 'down') => {
    const newSections = cvData.customSections.map((s) => {
      if (s.id !== sectionId) return s;
      const index = s.items.findIndex((i) => i.id === itemId);
      if (index === -1) return s;
      const newItems = [...s.items];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newItems.length) return s;
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      return { ...s, items: newItems };
    });
    setCvData({ ...cvData, customSections: newSections });
  };

  /**
   * Moves a top-level CV section one position up or down in the render order.
   * @param sectionId - Identifier of the section to move.
   * @param direction - Direction to move: 'up' decrements index, 'down' increments it.
   */
  const moveCVSection = (sectionId: CVSectionId, direction: 'up' | 'down') => {
    const order = [...cvData.sectionOrder];
    const index = order.indexOf(sectionId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;
    [order[index], order[targetIndex]] = [order[targetIndex], order[index]];
    setCvData({ ...cvData, sectionOrder: order });
  };

  /**
   * Serialises the current CV data to a JSON file and triggers a download.
   */
  const saveToJSON = () => {
    const dataStr = JSON.stringify(cvData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-${cvData.firstName}-${cvData.lastName || 'saved'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Reads a JSON file selected by the user and restores CV state from it.
   * @param e - File input change event.
   */
  const loadFromJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (!data.sectionOrder) {
            data.sectionOrder = [...DEFAULT_SECTION_ORDER];
          }
          setCvData(data);
          alert('CV zostało wczytane pomyślnie!');
        } catch (error) {
          alert('Błąd podczas wczytywania pliku JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  /**
   * Resets all CV fields to their initial empty state after user confirmation.
   */
  const clearForm = () => {
    if (window.confirm('Czy na pewno chcesz wyczyścić formularz?')) {
      setCvData({
        firstName: '',
        lastName: '',
        birthDate: '',
        photo: null,
        address: '',
        city: '',
        postalCode: '',
        phone: '',
        email: '',
        socialLinks: [],
        summary: '',
        additionalInfo: [],
        experience: [],
        customSections: [],
        sectionOrder: [...DEFAULT_SECTION_ORDER],
        language: 'pl',
        cvFont: DEFAULT_FONT,
        gdprConsent: true,
      });
    }
  };

  /**
   * Triggers the browser's native print dialog.
   */
  const printCV = () => {
    window.print();
  };

  /**
   * Generates and downloads a multi-page A4 PDF of the CV preview.
   * Renders the DOM element to a canvas with html2canvas, then slices it
   * into A4 pages using jsPDF.
   */
  const generatePDF = async () => {
    const element = cvPreviewRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = pageWidth / canvas.width;
      const scaledImgHeight = canvas.height * ratio;

      let yOffset = 0;
      while (yOffset < scaledImgHeight) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -yOffset, pageWidth, scaledImgHeight);
        yOffset += pageHeight;
      }

      pdf.save(`cv-${cvData.firstName}-${cvData.lastName || 'cv'}.pdf`);
    } catch (error) {
      alert('Błąd podczas generowania PDF. Spróbuj użyć opcji Drukuj.');
      console.error(error);
    }
  };

  /**
   * Returns the className string for a collapsible section header based on its expanded state.
   * @param expanded - Whether the section is currently expanded.
   * @returns Tailwind class string for the header element.
   */
  const headerClass = (expanded: boolean) =>
    `flex justify-between items-center px-5 py-4 cursor-pointer select-none transition-all border-b ${
      expanded
        ? 'bg-white border-gray-300'
        : 'bg-gray-50 border-transparent hover:bg-gray-100'
    }`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[50%_50%] lg:grid-cols-[60%_40%] min-h-screen bg-gray-100 print:block">

      <div className="bg-white p-5 lg:p-10 overflow-y-auto h-auto lg:h-screen print:w-full print:h-auto print:overflow-visible print:p-0">
        <CVPreview ref={cvPreviewRef} data={cvData} />
      </div>

      <div className="bg-white px-4 lg:px-5 py-6 lg:py-8 overflow-y-auto h-auto lg:h-screen border-l border-gray-300 print:hidden">

        <div className="flex gap-2.5 mb-5 justify-center">
          <button
            className={`flex items-center gap-2 px-5 py-2.5 border-2 rounded text-base font-semibold cursor-pointer transition-all ${
              cvData.language === 'pl'
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400'
            }`}
            onClick={() => changeLanguage('pl')}
          >
            <span className="text-xl">🇵🇱</span> PL
          </button>
          <button
            className={`flex items-center gap-2 px-5 py-2.5 border-2 rounded text-base font-semibold cursor-pointer transition-all ${
              cvData.language === 'en'
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400'
            }`}
            onClick={() => changeLanguage('en')}
          >
            <span className="text-xl">🇬🇧</span> EN
          </button>
        </div>

        <div className="flex gap-2.5 mb-5 flex-wrap">
          <div className="flex gap-2.5 flex-1">
            <button onClick={saveToJSON} className="btn btn-primary flex-1">
              Zapisz do pliku
            </button>
            <label className="btn flex-1 cursor-pointer justify-center">
              Wczytaj z pliku
              <input type="file" onChange={loadFromJSON} accept=".json" className="hidden" />
            </label>
          </div>
          <div className="flex gap-2.5 flex-1">
            <button onClick={printCV} className="btn btn-primary flex-1">
              Drukuj
            </button>
            <button onClick={generatePDF} className="btn btn-primary flex-1">
              Generuj PDF
            </button>
          </div>
          <button onClick={clearForm} className="btn btn-danger w-full">
            Wyczyść
          </button>
        </div>

        <div className="border border-gray-300 rounded-md mb-3 overflow-hidden bg-white">
          <div className={headerClass(expandedSections.style)} onClick={() => toggleSection('style')}>
            <span className="font-semibold text-gray-900 text-[15px]">Styl CV</span>
            <span className={`transition-transform text-gray-500 text-xs inline-block ${expandedSections.style ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {expandedSections.style && (
            <div className="p-5">
              <p className="block mb-3 text-gray-900 font-medium text-sm">Czcionka dokumentu:</p>
              <FontPicker
                value={cvData.cvFont}
                onChange={(font) => setCvData({ ...cvData, cvFont: font })}
              />
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded-md mb-3 overflow-hidden bg-white">
          <div className={headerClass(expandedSections.sectionOrder)} onClick={() => toggleSection('sectionOrder')}>
            <span className="font-semibold text-gray-900 text-[15px]">Kolejnosc sekcji</span>
            <span className={`transition-transform text-gray-500 text-xs inline-block ${expandedSections.sectionOrder ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {expandedSections.sectionOrder && (
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-3">Ustaw kolejnosc w jakiej sekcje pojawia sie w CV.</p>
              {cvData.sectionOrder.map((sectionId, index) => (
                <div key={sectionId} data-testid="section-order-row" className="flex items-center gap-2 mb-2 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                  <span className="flex-1 text-sm text-gray-800 font-medium">
                    {sectionId === 'summary' && 'Opis zawodowy'}
                    {sectionId === 'experience' && 'Doswiadczenie zawodowe'}
                    {sectionId === 'customSections' && 'Sekcje personalizowane'}
                    {sectionId === 'additionalInfo' && 'Informacje dodatkowe'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveCVSection(sectionId, 'up')}
                      disabled={index === 0}
                      className="px-2 py-0.5 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                      title="Przesuń w górę"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCVSection(sectionId, 'down')}
                      disabled={index === cvData.sectionOrder.length - 1}
                      className="px-2 py-0.5 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                      title="Przesuń w dół"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded-md mb-3 overflow-hidden bg-white">
          <div className={headerClass(expandedSections.basic)} onClick={() => toggleSection('basic')}>
            <span className="font-semibold text-gray-900 text-[15px]">Dane podstawowe</span>
            <span className={`transition-transform text-gray-500 text-xs inline-block ${expandedSections.basic ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {expandedSections.basic && (
            <div className="p-5">
              <div className="mb-[15px]">
                <label className="block mb-1.5 text-gray-900 font-medium text-sm">Imię:</label>
                <input
                  type="text"
                  className="form-input w-full"
                  value={cvData.firstName}
                  onChange={(e) => setCvData({ ...cvData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="mb-[15px]">
                <label className="block mb-1.5 text-gray-900 font-medium text-sm">Nazwisko:</label>
                <input
                  type="text"
                  className="form-input w-full"
                  value={cvData.lastName}
                  onChange={(e) => setCvData({ ...cvData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="mb-[15px]">
                <label className="block mb-1.5 text-gray-900 font-medium text-sm">Data urodzenia:</label>
                <input
                  type="date"
                  className="form-input w-full"
                  value={cvData.birthDate}
                  onChange={(e) => setCvData({ ...cvData, birthDate: e.target.value })}
                />
              </div>
              <div className="mb-[15px]">
                <label className="block mb-1.5 text-gray-900 font-medium text-sm">Zdjęcie:</label>
                <input type="file" onChange={handlePhotoChange} accept="image/*" className="text-sm" />
                {cvData.photo && (
                  <div className="mt-2.5">
                    <img src={cvData.photo} alt="Podgląd" className="max-w-[200px] max-h-[200px] rounded border-2 border-gray-300" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded-md mb-3 overflow-hidden bg-white">
          <div className={headerClass(expandedSections.contact)} onClick={() => toggleSection('contact')}>
            <span className="font-semibold text-gray-900 text-[15px]">Dane kontaktowe</span>
            <span className={`transition-transform text-gray-500 text-xs inline-block ${expandedSections.contact ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {expandedSections.contact && (
            <div className="p-5">
              <div className="mb-[15px]">
                <label className="block mb-1.5 text-gray-900 font-medium text-sm">Adres:</label>
                <input
                  type="text"
                  className="form-input w-full"
                  value={cvData.address}
                  onChange={(e) => setCvData({ ...cvData, address: e.target.value })}
                />
              </div>
              <div className="mb-[15px]">
                <label className="block mb-1.5 text-gray-900 font-medium text-sm">Miejscowość:</label>
                <input
                  type="text"
                  className="form-input w-full"
                  value={cvData.city}
                  onChange={(e) => setCvData({ ...cvData, city: e.target.value })}
                />
              </div>
              <div className="mb-[15px]">
                <label className="block mb-1.5 text-gray-900 font-medium text-sm">Kod pocztowy:</label>
                <input
                  type="text"
                  className="form-input w-full"
                  value={cvData.postalCode}
                  onChange={(e) => setCvData({ ...cvData, postalCode: e.target.value })}
                  placeholder="00-000"
                />
              </div>
              <div className="mb-[15px]">
                <label className="block mb-1.5 text-gray-900 font-medium text-sm">Numer telefonu:</label>
                <input
                  type="tel"
                  className="form-input w-full"
                  value={cvData.phone}
                  onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                  placeholder="+48 000 000 000"
                />
              </div>
              <div className="mb-[15px]">
                <label className="block mb-1.5 text-gray-900 font-medium text-sm">Adres e-mail:</label>
                <input
                  type="email"
                  className="form-input w-full"
                  value={cvData.email}
                  onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                />
              </div>
              <div className="mb-[15px]">
                <label className="block mb-1.5 text-gray-900 font-medium text-sm">Social media:</label>
                {cvData.socialLinks.map((link, index) => (
                  <div key={index} className="flex gap-2.5 mb-2.5 items-center">
                    <input
                      type="text"
                      className="form-input w-[140px]"
                      value={link.name}
                      onChange={(e) => updateSocialLink(index, 'name', e.target.value)}
                      placeholder="np. GitHub"
                    />
                    <input
                      type="url"
                      className="form-input flex-1"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="btn-remove"
                    >
                      Usuń
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addSocialLink} className="btn-add">
                  + Dodaj profil
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded-md mb-3 overflow-hidden bg-white">
          <div className={headerClass(expandedSections.summary)} onClick={() => toggleSection('summary')}>
            <span className="font-semibold text-gray-900 text-[15px]">Opis zawodowy</span>
            <span className={`transition-transform text-gray-500 text-xs inline-block ${expandedSections.summary ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {expandedSections.summary && (
            <div className="p-5">
              <div className="mb-[15px]">
                <label className="block mb-1.5 text-gray-900 font-medium text-sm">Krótki opis (np. profil zawodowy, podsumowanie):</label>
                <textarea
                  className="form-input w-full resize-none"
                  value={cvData.summary}
                  onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                  placeholder="Opisz swoje mocne strony, cele zawodowe, doświadczenie..."
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded-md mb-3 overflow-hidden bg-white">
          <div className={headerClass(expandedSections.experience)} onClick={() => toggleSection('experience')}>
            <span className="font-semibold text-gray-900 text-[15px]">Doświadczenie zawodowe</span>
            <span className={`transition-transform text-gray-500 text-xs inline-block ${expandedSections.experience ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {expandedSections.experience && (
            <div className="p-5">
              {cvData.experience.map((exp, expIndex) => (
                <div key={expIndex} className="bg-white p-5 rounded-md mb-[15px] border border-gray-300 hover:border-gray-400">
                  <div className="flex justify-end gap-1 mb-3">
                    <button
                      type="button"
                      onClick={() => moveExperience(expIndex, 'up')}
                      disabled={expIndex === 0}
                      className="px-2 py-0.5 text-xs border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                      title="Przesuń w górę"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveExperience(expIndex, 'down')}
                      disabled={expIndex === cvData.experience.length - 1}
                      className="px-2 py-0.5 text-xs border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                      title="Przesuń w dół"
                    >
                      ▼
                    </button>
                  </div>
                  <div className="mb-[15px]">
                    <label className="block mb-1.5 text-gray-900 font-medium text-sm">Nazwa firmy:</label>
                    <input
                      type="text"
                      className="form-input w-full"
                      value={exp.company}
                      onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                      placeholder="np. ABC Sp. z o.o."
                    />
                  </div>
                  <div className="mb-[15px]">
                    <label className="block mb-1.5 text-gray-900 font-medium text-sm">Stanowisko:</label>
                    <input
                      type="text"
                      className="form-input w-full"
                      value={exp.position}
                      onChange={(e) => updateExperience(expIndex, 'position', e.target.value)}
                      placeholder="np. Programista"
                    />
                  </div>
                  <div className="flex gap-[15px]">
                    <div className="mb-[15px] flex-1">
                      <label className="block mb-1.5 text-gray-900 font-medium text-sm">Data od:</label>
                      <input
                        type="date"
                        className="form-input w-full"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(expIndex, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="mb-[15px] flex-1">
                      <label className="block mb-1.5 text-gray-900 font-medium text-sm">Data do:</label>
                      <input
                        type="date"
                        className="form-input w-full"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(expIndex, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-[15px]">
                    <label className="block mb-1.5 text-gray-900 font-medium text-sm">Opis stanowiska:</label>
                    <textarea
                      className="form-input w-full resize-none"
                      value={exp.jobDescription}
                      onChange={(e) => updateExperience(expIndex, 'jobDescription', e.target.value)}
                      placeholder="Ogólny opis stanowiska, zakresu odpowiedzialności..."
                      rows={3}
                    />
                  </div>
                  <div className="mb-[15px]">
                    <label className="block mb-1.5 text-gray-900 font-medium text-sm">Opis obowiązków (podpunkty):</label>
                    {exp.description.map((desc, descIndex) => (
                      <div key={descIndex} className="flex gap-2.5 mb-2.5">
                        <input
                          type="text"
                          className="form-input flex-1"
                          value={desc}
                          onChange={(e) => updateDescriptionPoint(expIndex, descIndex, e.target.value)}
                          placeholder="np. Programowanie aplikacji webowych"
                        />
                        <button
                          type="button"
                          onClick={() => removeDescriptionPoint(expIndex, descIndex)}
                          className="btn-remove"
                        >
                          Usuń
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addDescriptionPoint(expIndex)}
                      className="btn-add"
                    >
                      + Dodaj podpunkt
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(expIndex)}
                    className="btn-remove mt-2.5"
                  >
                    Usuń doświadczenie
                  </button>
                </div>
              ))}
              <button type="button" onClick={addExperience} className="btn-add">
                + Dodaj doświadczenie
              </button>
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded-md mb-3 overflow-hidden bg-white">
          <div className={headerClass(expandedSections.additional)} onClick={() => toggleSection('additional')}>
            <span className="font-semibold text-gray-900 text-[15px]">Informacje dodatkowe</span>
            <span className={`transition-transform text-gray-500 text-xs inline-block ${expandedSections.additional ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {expandedSections.additional && (
            <div className="p-5">
              {cvData.additionalInfo.map((info, index) => (
                <div key={index} className="flex gap-2.5 items-center mb-[15px] bg-white p-[15px] rounded border border-gray-300">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => moveAdditionalInfo(index, 'up')}
                      disabled={index === 0}
                      className="px-2 py-0.5 text-xs border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                      title="Przesuń w górę"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAdditionalInfo(index, 'down')}
                      disabled={index === cvData.additionalInfo.length - 1}
                      className="px-2 py-0.5 text-xs border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                      title="Przesuń w dół"
                    >
                      ▼
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-input flex-1 min-w-[200px]"
                    value={info.label}
                    onChange={(e) => updateAdditionalInfo(index, 'label', e.target.value)}
                    placeholder="np. Prawo jazdy"
                  />
                  <input
                    type="text"
                    className="form-input flex-[2]"
                    value={info.content}
                    onChange={(e) => updateAdditionalInfo(index, 'content', e.target.value)}
                    placeholder="np. Kat. B"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdditionalInfo(index)}
                    className="btn-remove"
                  >
                    Usuń
                  </button>
                </div>
              ))}
              <button type="button" onClick={addAdditionalInfo} className="btn-add">
                + Dodaj informację
              </button>
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded-md mb-3 overflow-hidden bg-white">
          <div className={headerClass(expandedSections.customSections)} onClick={() => toggleSection('customSections')}>
            <span className="font-semibold text-gray-900 text-[15px]">Sekcje personalizowane</span>
            <span className={`transition-transform text-gray-500 text-xs inline-block ${expandedSections.customSections ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {expandedSections.customSections && (
            <div className="p-5">
              <div className="mb-5 flex flex-col gap-2.5">
                <p className="font-semibold mb-2.5 text-gray-900">Dodaj sekcję:</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button" onClick={() => addCustomSection('it-projects')} className="btn-add">+ Projekty IT</button>
                  <button type="button" onClick={() => addCustomSection('education')} className="btn-add">+ Wykształcenie</button>
                  <button type="button" onClick={() => addCustomSection('skills')} className="btn-add">+ Umiejętności</button>
                  <button type="button" onClick={() => addCustomSection('certifications')} className="btn-add">+ Certyfikaty</button>
                  <button type="button" onClick={() => addCustomSection('languages')} className="btn-add">+ Języki obce</button>
                  <button type="button" onClick={() => addCustomSection('aviation')} className="btn-add">+ Lotnictwo</button>
                  <button type="button" onClick={() => addCustomSection('construction')} className="btn-add">+ Budownictwo</button>
                  <button type="button" onClick={() => addCustomSection('custom')} className="btn-add">+ Własna sekcja</button>
                </div>
              </div>

              {cvData.customSections.map((section, sectionIndex) => {
                const baseProps = {
                  section,
                  onUpdateTitle: updateSectionTitle,
                  onRemoveSection: removeCustomSection,
                  onMoveSection: moveCustomSection,
                  isFirst: sectionIndex === 0,
                  isLast: sectionIndex === cvData.customSections.length - 1,
                  onAddItem: addSectionItem,
                  onRemoveItem: removeSectionItem,
                  onUpdateItem: updateSectionItem,
                  onMoveItem: moveCustomSectionItem,
                };

                switch (section.type) {
                  case 'it-projects':
                    return (
                      <ItProjectsSection
                        key={section.id}
                        {...baseProps}
                        onAddTechnology={addTechnology}
                        onUpdateTechnology={updateTechnology}
                        onRemoveTechnology={removeTechnology}
                      />
                    );
                  case 'education':
                    return <EducationSection key={section.id} {...baseProps} />;
                  case 'skills':
                    return <SkillsSection key={section.id} {...baseProps} />;
                  case 'certifications':
                    return <CertificationsSection key={section.id} {...baseProps} />;
                  case 'languages':
                    return <LanguagesSection key={section.id} {...baseProps} />;
                  case 'aviation':
                    return <AviationSection key={section.id} {...baseProps} />;
                  case 'construction':
                    return <ConstructionSection key={section.id} {...baseProps} />;
                  case 'custom':
                    return <CustomGenericSection key={section.id} {...baseProps} />;
                  default:
                    return null;
                }
              })}
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded-md mb-3 overflow-hidden bg-white">
          <div className="flex justify-between items-center px-5 py-4 bg-gray-50 border-b border-transparent">
            <span className="font-semibold text-gray-900 text-[15px]">Zgoda RODO</span>
          </div>
          <div className="p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-gray-900 cursor-pointer flex-shrink-0"
                checked={cvData.gdprConsent}
                onChange={(e) => setCvData({ ...cvData, gdprConsent: e.target.checked })}
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                Dodaj klauzulę zgody na przetwarzanie danych osobowych (RODO) na końcu CV
              </span>
            </label>
            {cvData.gdprConsent && (
              <p className="mt-3 text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">
                Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w CV na potrzeby procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;