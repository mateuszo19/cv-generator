import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import html2pdf from 'html2pdf.js';
import type { CVData, AdditionalInfo, Experience, CustomSection, CustomSectionItem, SectionType } from './types';
import { CVPreview } from './components/CVPreview';
import './App.css';

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
    summary: '',
    additionalInfo: [],
    experience: [],
    customSections: [],
    language: 'pl',
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    contact: false,
    summary: false,
    experience: false,
    customSections: false,
    additional: false,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

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
        // Tłumaczenie nagłówków i interfejsu
        const translatedData = { ...cvData, language: lang };

        // Tłumaczenie treści CV
        const textsToTranslate: string[] = [];

        // Zbierz wszystkie teksty do tłumaczenia
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

        // Użyj darmowego API MyMemory do tłumaczenia
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
      // Przywróć język polski (bez tłumaczenia wstecz)
      setCvData({ ...cvData, language: lang });
    }
  };

  // Dodawanie sekcji personalizowanej
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

  // Usuwanie sekcji personalizowanej
  const removeCustomSection = (sectionId: string) => {
    const newSections = cvData.customSections.filter((s) => s.id !== sectionId);
    setCvData({ ...cvData, customSections: newSections });
  };

  // Aktualizacja tytułu sekcji
  const updateSectionTitle = (sectionId: string, title: string) => {
    const newSections = cvData.customSections.map((s) =>
      s.id === sectionId ? { ...s, title } : s
    );
    setCvData({ ...cvData, customSections: newSections });
  };

  // Dodawanie elementu do sekcji
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

  // Aktualizacja elementu sekcji
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

  // Usuwanie elementu sekcji
  const removeSectionItem = (sectionId: string, itemId: string) => {
    const newSections = cvData.customSections.map((s) => {
      if (s.id === sectionId) {
        return { ...s, items: s.items.filter((item) => item.id !== itemId) };
      }
      return s;
    });
    setCvData({ ...cvData, customSections: newSections });
  };

  // Dodawanie technologii do projektu IT
  const addTechnology = (sectionId: string, itemId: string) => {
    const section = cvData.customSections.find((s) => s.id === sectionId);
    if (!section) return;

    const item = section.items.find((i) => i.id === itemId);
    if (!item || !Array.isArray(item.data.technologies)) return;

    const newTechnologies = [...(item.data.technologies as string[]), ''];
    updateSectionItem(sectionId, itemId, 'technologies', newTechnologies);
  };

  // Aktualizacja technologii
  const updateTechnology = (sectionId: string, itemId: string, techIndex: number, value: string) => {
    const section = cvData.customSections.find((s) => s.id === sectionId);
    if (!section) return;

    const item = section.items.find((i) => i.id === itemId);
    if (!item || !Array.isArray(item.data.technologies)) return;

    const newTechnologies = [...(item.data.technologies as string[])];
    newTechnologies[techIndex] = value;
    updateSectionItem(sectionId, itemId, 'technologies', newTechnologies);
  };

  // Usuwanie technologii
  const removeTechnology = (sectionId: string, itemId: string, techIndex: number) => {
    const section = cvData.customSections.find((s) => s.id === sectionId);
    if (!section) return;

    const item = section.items.find((i) => i.id === itemId);
    if (!item || !Array.isArray(item.data.technologies)) return;

    const newTechnologies = (item.data.technologies as string[]).filter((_, i) => i !== techIndex);
    updateSectionItem(sectionId, itemId, 'technologies', newTechnologies);
  };

  // Wczytywanie zdjęcia
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

  // Dodawanie informacji dodatkowej
  const addAdditionalInfo = () => {
    setCvData({
      ...cvData,
      additionalInfo: [...cvData.additionalInfo, { label: '', content: '' }],
    });
  };

  // Aktualizacja informacji dodatkowej
  const updateAdditionalInfo = (index: number, field: keyof AdditionalInfo, value: string) => {
    const newInfo = [...cvData.additionalInfo];
    newInfo[index][field] = value;
    setCvData({ ...cvData, additionalInfo: newInfo });
  };

  // Usuwanie informacji dodatkowej
  const removeAdditionalInfo = (index: number) => {
    const newInfo = cvData.additionalInfo.filter((_, i) => i !== index);
    setCvData({ ...cvData, additionalInfo: newInfo });
  };

  // Dodawanie doświadczenia
  const addExperience = () => {
    setCvData({
      ...cvData,
      experience: [...cvData.experience, { company: '', position: '', startDate: '', endDate: '', jobDescription: '', description: [''] }],
    });
  };

  // Aktualizacja doświadczenia
  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExp = [...cvData.experience];
    if (field !== 'description') {
      newExp[index] = { ...newExp[index], [field]: value };
      setCvData({ ...cvData, experience: newExp });
    }
  };

  // Dodawanie podpunktu w doświadczeniu
  const addDescriptionPoint = (expIndex: number) => {
    const newExp = [...cvData.experience];
    newExp[expIndex].description.push('');
    setCvData({ ...cvData, experience: newExp });
  };

  // Aktualizacja podpunktu w doświadczeniu
  const updateDescriptionPoint = (expIndex: number, descIndex: number, value: string) => {
    const newExp = [...cvData.experience];
    newExp[expIndex].description[descIndex] = value;
    setCvData({ ...cvData, experience: newExp });
  };

  // Usuwanie podpunktu z doświadczenia
  const removeDescriptionPoint = (expIndex: number, descIndex: number) => {
    const newExp = [...cvData.experience];
    newExp[expIndex].description = newExp[expIndex].description.filter((_, i) => i !== descIndex);
    setCvData({ ...cvData, experience: newExp });
  };

  // Usuwanie doświadczenia
  const removeExperience = (index: number) => {
    const newExp = cvData.experience.filter((_, i) => i !== index);
    setCvData({ ...cvData, experience: newExp });
  };

  // Zapis do JSON
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

  // Wczytanie z JSON
  const loadFromJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setCvData(data);
          alert('CV zostało wczytane pomyślnie!');
        } catch (error) {
          alert('Błąd podczas wczytywania pliku JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  // Czyszczenie formularza
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
        summary: '',
        additionalInfo: [],
        experience: [],
        customSections: [],
        language: 'pl',
      });
    }
  };

  // Drukowanie
  const printCV = () => {
    window.print();
  };

  // Generowanie PDF
  const generatePDF = () => {
    const element = cvPreviewRef.current;
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `cv-${cvData.firstName}-${cvData.lastName || 'cv'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="main-container">
      {/* Panel podglądu - lewa strona (60%) */}
      <div className="preview-panel">
        <CVPreview ref={cvPreviewRef} data={cvData} />
      </div>

      {/* Panel formularza - prawa strona (40%) */}
      <div className="form-panel">
        {/* Przełącznik języka */}
        <div className="language-switcher">
          <button
            className={`lang-btn ${cvData.language === 'pl' ? 'active' : ''}`}
            onClick={() => changeLanguage('pl')}
          >
            <span className="flag">🇵🇱</span> PL
          </button>
          <button
            className={`lang-btn ${cvData.language === 'en' ? 'active' : ''}`}
            onClick={() => changeLanguage('en')}
          >
            <span className="flag">🇬🇧</span> EN
          </button>
        </div>

        {/* Przyciski akcji */}
        <div className="action-buttons">
          <div style={{ display: 'flex', gap: '10px', flex: '1' }}>
            <button onClick={saveToJSON} className="btn btn-primary" style={{ flex: 1 }}>
              Zapisz do JSON
            </button>
            <label className="btn" style={{ flex: 1 }}>
              Wczytaj z JSON
              <input type="file" onChange={loadFromJSON} accept=".json" style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: '10px', flex: '1' }}>
            <button onClick={printCV} className="btn btn-print" style={{ flex: 1 }}>
              Drukuj
            </button>
            <button onClick={generatePDF} className="btn btn-print" style={{ flex: 1 }}>
              Generuj PDF
            </button>
          </div>
          <button onClick={clearForm} className="btn btn-danger">
            Wyczyść
          </button>
        </div>

        {/* Sekcja: Dane podstawowe */}
        <div className={`collapsible-section ${expandedSections.basic ? 'expanded' : ''}`}>
          <div className="collapsible-header" onClick={() => toggleSection('basic')}>
            <span className="collapsible-title">Dane podstawowe</span>
            <span className="collapsible-icon">▼</span>
          </div>
          {expandedSections.basic && (
            <div className="collapsible-content">
              <div className="form-group">
                <label>Imię:</label>
                <input
                  type="text"
                  value={cvData.firstName}
                  onChange={(e) => {
                    console.log('firstName onChange:', e.target.value);
                    setCvData({ ...cvData, firstName: e.target.value });
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nazwisko:</label>
                <input
                  type="text"
                  value={cvData.lastName}
                  onChange={(e) => {
                    console.log('lastName onChange:', e.target.value);
                    setCvData({ ...cvData, lastName: e.target.value });
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data urodzenia:</label>
                <input
                  type="date"
                  value={cvData.birthDate}
                  onChange={(e) => setCvData({ ...cvData, birthDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Zdjęcie:</label>
                <input type="file" onChange={handlePhotoChange} accept="image/*" />
                {cvData.photo && (
                  <div className="photo-preview">
                    <img src={cvData.photo} alt="Podgląd" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sekcja: Dane kontaktowe */}
        <div className={`collapsible-section ${expandedSections.contact ? 'expanded' : ''}`}>
          <div className="collapsible-header" onClick={() => toggleSection('contact')}>
            <span className="collapsible-title">Dane kontaktowe</span>
            <span className="collapsible-icon">▼</span>
          </div>
          {expandedSections.contact && (
            <div className="collapsible-content">
              <div className="form-group">
                <label>Adres:</label>
                <input
                  type="text"
                  value={cvData.address}
                  onChange={(e) => setCvData({ ...cvData, address: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Miejscowość:</label>
                <input
                  type="text"
                  value={cvData.city}
                  onChange={(e) => setCvData({ ...cvData, city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Kod pocztowy:</label>
                <input
                  type="text"
                  value={cvData.postalCode}
                  onChange={(e) => setCvData({ ...cvData, postalCode: e.target.value })}
                  placeholder="00-000"
                />
              </div>
              <div className="form-group">
                <label>Numer telefonu:</label>
                <input
                  type="tel"
                  value={cvData.phone}
                  onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                  placeholder="+48 000 000 000"
                />
              </div>
              <div className="form-group">
                <label>Adres e-mail:</label>
                <input
                  type="email"
                  value={cvData.email}
                  onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sekcja: Opis */}
        <div className={`collapsible-section ${expandedSections.summary ? 'expanded' : ''}`}>
          <div className="collapsible-header" onClick={() => toggleSection('summary')}>
            <span className="collapsible-title">Opis zawodowy</span>
            <span className="collapsible-icon">▼</span>
          </div>
          {expandedSections.summary && (
            <div className="collapsible-content">
              <div className="form-group">
                <label>Krótki opis (np. profil zawodowy, podsumowanie):</label>
                <textarea
                  value={cvData.summary}
                  onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                  placeholder="Opisz swoje mocne strony, cele zawodowe, doświadczenie..."
                  rows={4}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '14px', fontFamily: 'var(--font-family-ui)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sekcja: Doświadczenie zawodowe */}
        <div className={`collapsible-section ${expandedSections.experience ? 'expanded' : ''}`}>
          <div className="collapsible-header" onClick={() => toggleSection('experience')}>
            <span className="collapsible-title">Doświadczenie zawodowe</span>
            <span className="collapsible-icon">▼</span>
          </div>
          {expandedSections.experience && (
            <div className="collapsible-content">
              {cvData.experience.map((exp, expIndex) => (
                <div key={expIndex} className="experience-item">
                  <div className="form-group">
                    <label>Nazwa firmy:</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                      placeholder="np. ABC Sp. z o.o."
                    />
                  </div>
                  <div className="form-group">
                    <label>Stanowisko:</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => updateExperience(expIndex, 'position', e.target.value)}
                      placeholder="np. Programista"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Data od:</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(expIndex, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Data do:</label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(expIndex, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Opis stanowiska:</label>
                    <textarea
                      value={exp.jobDescription}
                      onChange={(e) => updateExperience(expIndex, 'jobDescription', e.target.value)}
                      placeholder="Ogólny opis stanowiska, zakresu odpowiedzialności..."
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '14px', fontFamily: 'var(--font-family-ui)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Opis obowiązków (podpunkty):</label>
                    {exp.description.map((desc, descIndex) => (
                      <div key={descIndex} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                          type="text"
                          value={desc}
                          onChange={(e) => updateDescriptionPoint(expIndex, descIndex, e.target.value)}
                          placeholder="np. Programowanie aplikacji webowych"
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => removeDescriptionPoint(expIndex, descIndex)}
                          className="btn btn-remove"
                        >
                          Usuń
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addDescriptionPoint(expIndex)}
                      className="btn btn-add"
                      style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                      + Dodaj podpunkt
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(expIndex)}
                    className="btn btn-remove"
                    style={{ marginTop: '10px' }}
                  >
                    Usuń doświadczenie
                  </button>
                </div>
              ))}
              <button type="button" onClick={addExperience} className="btn btn-add">
                + Dodaj doświadczenie
              </button>
            </div>
          )}
        </div>

        {/* Sekcja: Informacje dodatkowe */}
        <div className={`collapsible-section ${expandedSections.additional ? 'expanded' : ''}`}>
          <div className="collapsible-header" onClick={() => toggleSection('additional')}>
            <span className="collapsible-title">Informacje dodatkowe</span>
            <span className="collapsible-icon">▼</span>
          </div>
          {expandedSections.additional && (
            <div className="collapsible-content">
              {cvData.additionalInfo.map((info, index) => (
                <div key={index} className="additional-info-item">
                  <input
                    type="text"
                    value={info.label}
                    onChange={(e) => updateAdditionalInfo(index, 'label', e.target.value)}
                    placeholder="np. Prawo jazdy"
                  />
                  <input
                    type="text"
                    value={info.content}
                    onChange={(e) => updateAdditionalInfo(index, 'content', e.target.value)}
                    placeholder="np. Kat. B"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdditionalInfo(index)}
                    className="btn btn-remove"
                  >
                    Usuń
                  </button>
                </div>
              ))}
              <button type="button" onClick={addAdditionalInfo} className="btn btn-add">
                + Dodaj informację
              </button>
            </div>
          )}
        </div>

        {/* Sekcja: Sekcje personalizowane */}
        <div className={`collapsible-section ${expandedSections.customSections ? 'expanded' : ''}`}>
          <div className="collapsible-header" onClick={() => toggleSection('customSections')}>
            <span className="collapsible-title">Sekcje personalizowane</span>
            <span className="collapsible-icon">▼</span>
          </div>
          {expandedSections.customSections && (
            <div className="collapsible-content">
              {/* Przyciski dodawania sekcji */}
              <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontWeight: '600', marginBottom: '10px', color: 'var(--color-text-primary)' }}>
                  Dodaj sekcję:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <button type="button" onClick={() => addCustomSection('it-projects')} className="btn btn-add" style={{ fontSize: '14px' }}>
                    + Projekty IT
                  </button>
                  <button type="button" onClick={() => addCustomSection('education')} className="btn btn-add" style={{ fontSize: '14px' }}>
                    + Wykształcenie
                  </button>
                  <button type="button" onClick={() => addCustomSection('skills')} className="btn btn-add" style={{ fontSize: '14px' }}>
                    + Umiejętności
                  </button>
                  <button type="button" onClick={() => addCustomSection('certifications')} className="btn btn-add" style={{ fontSize: '14px' }}>
                    + Certyfikaty
                  </button>
                  <button type="button" onClick={() => addCustomSection('languages')} className="btn btn-add" style={{ fontSize: '14px' }}>
                    + Języki obce
                  </button>
                  <button type="button" onClick={() => addCustomSection('aviation')} className="btn btn-add" style={{ fontSize: '14px' }}>
                    + Lotnictwo
                  </button>
                  <button type="button" onClick={() => addCustomSection('construction')} className="btn btn-add" style={{ fontSize: '14px' }}>
                    + Budownictwo
                  </button>
                  <button type="button" onClick={() => addCustomSection('custom')} className="btn btn-add" style={{ fontSize: '14px' }}>
                    + Własna sekcja
                  </button>
                </div>
              </div>

              {/* Wyświetlanie dodanych sekcji */}
              {cvData.customSections.map((section) => (
                <div key={section.id} style={{ border: '2px solid var(--color-border-dark)', borderRadius: '8px', padding: '20px', marginBottom: '20px', background: 'var(--color-bg-secondary)' }}>
                  {/* Tytuł sekcji i przycisk usuń */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                      style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--color-text-primary)',
                        flex: 1,
                        marginRight: '10px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomSection(section.id)}
                      className="btn btn-remove"
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                    >
                      Usuń sekcję
                    </button>
                  </div>

                  {/* Projekty IT */}
                  {section.type === 'it-projects' && (
                    <div>
                      {section.items.map((item) => (
                        <div key={item.id} style={{ background: 'white', padding: '15px', borderRadius: '6px', marginBottom: '12px', border: '1px solid var(--color-border)' }}>
                          <div className="form-group">
                            <label>Nazwa projektu:</label>
                            <input
                              type="text"
                              value={item.data.name as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'name', e.target.value)}
                              placeholder="np. Aplikacja webowa e-commerce"
                            />
                          </div>
                          <div className="form-group">
                            <label>Opis:</label>
                            <textarea
                              value={item.data.description as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'description', e.target.value)}
                              placeholder="Krótki opis projektu..."
                              rows={2}
                              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '14px' }}
                            />
                          </div>
                          <div className="form-group">
                            <label>Technologie:</label>
                            {Array.isArray(item.data.technologies) && (item.data.technologies as string[]).map((tech, techIndex) => (
                              <div key={techIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input
                                  type="text"
                                  value={tech}
                                  onChange={(e) => updateTechnology(section.id, item.id, techIndex, e.target.value)}
                                  placeholder="np. React, TypeScript, Node.js"
                                  style={{ flex: 1 }}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeTechnology(section.id, item.id, techIndex)}
                                  className="btn btn-remove"
                                  style={{ padding: '5px 10px' }}
                                >
                                  Usuń
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addTechnology(section.id, item.id)}
                              className="btn btn-add"
                              style={{ fontSize: '13px', padding: '6px 12px' }}
                            >
                              + Dodaj technologię
                            </button>
                          </div>
                          <div className="form-group">
                            <label>Link (opcjonalnie):</label>
                            <input
                              type="url"
                              value={item.data.link as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'link', e.target.value)}
                              placeholder="https://github.com/..."
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSectionItem(section.id, item.id)}
                            className="btn btn-remove"
                            style={{ marginTop: '10px' }}
                          >
                            Usuń projekt
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSectionItem(section.id)}
                        className="btn btn-add"
                        style={{ width: '100%' }}
                      >
                        + Dodaj projekt
                      </button>
                    </div>
                  )}

                  {/* Wykształcenie */}
                  {section.type === 'education' && (
                    <div>
                      {section.items.map((item) => (
                        <div key={item.id} style={{ background: 'white', padding: '15px', borderRadius: '6px', marginBottom: '12px', border: '1px solid var(--color-border)' }}>
                          <div className="form-group">
                            <label>Szkoła/Uczelnia:</label>
                            <input
                              type="text"
                              value={item.data.school as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'school', e.target.value)}
                              placeholder="np. Politechnika Warszawska"
                            />
                          </div>
                          <div className="form-group">
                            <label>Stopień:</label>
                            <input
                              type="text"
                              value={item.data.degree as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'degree', e.target.value)}
                              placeholder="np. Inżynier, Magister"
                            />
                          </div>
                          <div className="form-group">
                            <label>Kierunek:</label>
                            <input
                              type="text"
                              value={item.data.field as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'field', e.target.value)}
                              placeholder="np. Informatyka"
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '15px' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                              <label>Data od:</label>
                              <input
                                type="text"
                                value={item.data.startDate as string}
                                onChange={(e) => updateSectionItem(section.id, item.id, 'startDate', e.target.value)}
                                placeholder="np. 2018"
                              />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                              <label>Data do:</label>
                              <input
                                type="text"
                                value={item.data.endDate as string}
                                onChange={(e) => updateSectionItem(section.id, item.id, 'endDate', e.target.value)}
                                placeholder="np. 2022 lub puste"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSectionItem(section.id, item.id)}
                            className="btn btn-remove"
                            style={{ marginTop: '10px' }}
                          >
                            Usuń
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSectionItem(section.id)}
                        className="btn btn-add"
                        style={{ width: '100%' }}
                      >
                        + Dodaj wykształcenie
                      </button>
                    </div>
                  )}

                  {/* Umiejętności */}
                  {section.type === 'skills' && (
                    <div>
                      {section.items.map((item) => (
                        <div key={item.id} style={{ background: 'white', padding: '15px', borderRadius: '6px', marginBottom: '12px', border: '1px solid var(--color-border)' }}>
                          <div className="form-group">
                            <label>Kategoria:</label>
                            <input
                              type="text"
                              value={item.data.category as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'category', e.target.value)}
                              placeholder="np. Programowanie, Design, Języki"
                            />
                          </div>
                          <div className="form-group">
                            <label>Umiejętności:</label>
                            <textarea
                              value={item.data.skills as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'skills', e.target.value)}
                              placeholder="Wymień umiejętności po przecinku..."
                              rows={2}
                              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '14px' }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSectionItem(section.id, item.id)}
                            className="btn btn-remove"
                            style={{ marginTop: '10px' }}
                          >
                            Usuń
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSectionItem(section.id)}
                        className="btn btn-add"
                        style={{ width: '100%' }}
                      >
                        + Dodaj kategorię
                      </button>
                    </div>
                  )}

                  {/* Certyfikaty */}
                  {section.type === 'certifications' && (
                    <div>
                      {section.items.map((item) => (
                        <div key={item.id} style={{ background: 'white', padding: '15px', borderRadius: '6px', marginBottom: '12px', border: '1px solid var(--color-border)' }}>
                          <div className="form-group">
                            <label>Nazwa certyfikatu:</label>
                            <input
                              type="text"
                              value={item.data.name as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'name', e.target.value)}
                              placeholder="np. AWS Solutions Architect"
                            />
                          </div>
                          <div className="form-group">
                            <label>Organizacja:</label>
                            <input
                              type="text"
                              value={item.data.issuer as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'issuer', e.target.value)}
                              placeholder="np. Amazon Web Services"
                            />
                          </div>
                          <div className="form-group">
                            <label>Data uzyskania:</label>
                            <input
                              type="text"
                              value={item.data.date as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'date', e.target.value)}
                              placeholder="np. 01/2023"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSectionItem(section.id, item.id)}
                            className="btn btn-remove"
                            style={{ marginTop: '10px' }}
                          >
                            Usuń
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSectionItem(section.id)}
                        className="btn btn-add"
                        style={{ width: '100%' }}
                      >
                        + Dodaj certyfikat
                      </button>
                    </div>
                  )}

                  {/* Języki obce */}
                  {section.type === 'languages' && (
                    <div>
                      {section.items.map((item) => (
                        <div key={item.id} style={{ background: 'white', padding: '15px', borderRadius: '6px', marginBottom: '12px', border: '1px solid var(--color-border)' }}>
                          <div className="form-group">
                            <label>Język:</label>
                            <input
                              type="text"
                              value={item.data.language as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'language', e.target.value)}
                              placeholder="np. Angielski"
                            />
                          </div>
                          <div className="form-group">
                            <label>Poziom:</label>
                            <input
                              type="text"
                              value={item.data.level as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'level', e.target.value)}
                              placeholder="np. B2, C1, ICAO Level 4"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSectionItem(section.id, item.id)}
                            className="btn btn-remove"
                            style={{ marginTop: '10px' }}
                          >
                            Usuń
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSectionItem(section.id)}
                        className="btn btn-add"
                        style={{ width: '100%' }}
                      >
                        + Dodaj język
                      </button>
                    </div>
                  )}

                  {/* Lotnictwo */}
                  {section.type === 'aviation' && (
                    <div>
                      {section.items.map((item) => (
                        <div key={item.id} style={{ background: 'white', padding: '15px', borderRadius: '6px', marginBottom: '12px', border: '1px solid var(--color-border)' }}>
                          <div className="form-group">
                            <label>Licencja/Uprawnienia:</label>
                            <input
                              type="text"
                              value={item.data.license as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'license', e.target.value)}
                              placeholder="np. CPL, ATPL, PPL"
                            />
                          </div>
                          <div className="form-group">
                            <label>Liczba godzin:</label>
                            <input
                              type="text"
                              value={item.data.hours as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'hours', e.target.value)}
                              placeholder="np. 250 godzin"
                            />
                          </div>
                          <div className="form-group">
                            <label>Typ:</label>
                            <input
                              type="text"
                              value={item.data.type as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'type', e.target.value)}
                              placeholder="np. SAM, TMG, MEP"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSectionItem(section.id, item.id)}
                            className="btn btn-remove"
                            style={{ marginTop: '10px' }}
                          >
                            Usuń
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSectionItem(section.id)}
                        className="btn btn-add"
                        style={{ width: '100%' }}
                      >
                        + Dodaj wpis
                      </button>
                    </div>
                  )}

                  {/* Budownictwo */}
                  {section.type === 'construction' && (
                    <div>
                      {section.items.map((item) => (
                        <div key={item.id} style={{ background: 'white', padding: '15px', borderRadius: '6px', marginBottom: '12px', border: '1px solid var(--color-border)' }}>
                          <div className="form-group">
                            <label>Projekt:</label>
                            <input
                              type="text"
                              value={item.data.project as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'project', e.target.value)}
                              placeholder="np. Wieżowiec, Centrum handlowe"
                            />
                          </div>
                          <div className="form-group">
                            <label>Rola:</label>
                            <input
                              type="text"
                              value={item.data.role as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'role', e.target.value)}
                              placeholder="np. Kierownik budowy, Inżynier"
                            />
                          </div>
                          <div className="form-group">
                            <label>Okres:</label>
                            <input
                              type="text"
                              value={item.data.duration as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'duration', e.target.value)}
                              placeholder="np. 2020-2022"
                            />
                          </div>
                          <div className="form-group">
                            <label>Zakres:</label>
                            <textarea
                              value={item.data.scope as string}
                              onChange={(e) => updateSectionItem(section.id, item.id, 'scope', e.target.value)}
                              placeholder="Opis zakresu prac..."
                              rows={2}
                              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '14px' }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSectionItem(section.id, item.id)}
                            className="btn btn-remove"
                            style={{ marginTop: '10px' }}
                          >
                            Usuń
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSectionItem(section.id)}
                        className="btn btn-add"
                        style={{ width: '100%' }}
                      >
                        + Dodaj projekt
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
