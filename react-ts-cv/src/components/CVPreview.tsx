import { forwardRef } from 'react';
import type { CVData, CVSectionId } from '../types';
import { DEFAULT_SECTION_ORDER } from '../types';

interface CVPreviewProps {
  data: CVData;
}

/** Polish and English label translations for CV section headings. */
const translations = {
  pl: {
    birthDate: 'Data urodzenia',
    address: 'Adres',
    phone: 'Telefon',
    email: 'Email',
    professionalSummary: 'Podsumowanie zawodowe',
    workExperience: 'Doświadczenie zawodowe',
    present: 'obecnie',
    additionalInfo: 'Informacje dodatkowe',
    gdprConsent:
      'Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w CV na potrzeby procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).',
  },
  en: {
    birthDate: 'Date of birth',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    professionalSummary: 'Professional Summary',
    workExperience: 'Work Experience',
    present: 'present',
    additionalInfo: 'Additional Information',
    gdprConsent:
      'I consent to the processing of my personal data contained in this CV for the purposes of the recruitment process, in accordance with Regulation (EU) 2016/679 of the European Parliament and of the Council (GDPR).',
  },
};

/**
 * Read-only CV document component rendered as a printable/exportable preview.
 * Accepts a forwarded ref so the parent can capture the DOM node for PDF generation.
 */
export const CVPreview = forwardRef<HTMLDivElement, CVPreviewProps>(({ data }, ref) => {
  const t = translations[data.language];
  const hasContactData = data.address || data.city || data.postalCode || data.phone || data.email;
  const locale = data.language === 'pl' ? 'pl-PL' : 'en-GB';

  return (
    <div ref={ref} className="cv-preview" style={{ fontFamily: data.cvFont }}>
      <div className="cv-header">
        {data.photo && (
          <div className="flex-shrink-0">
            <img
              src={data.photo}
              alt={`${data.firstName} ${data.lastName}`}
              className="w-[150px] h-[150px] object-cover border-2 border-black"
            />
          </div>
        )}
        <div className="flex-1">
          <h1 className="cv-name">
            {data.firstName || 'Imię'} {data.lastName || 'Nazwisko'}
          </h1>
          <div className="cv-contact">
            {data.birthDate && (
              <p className="my-[5px]">
                {t.birthDate}: {new Date(data.birthDate).toLocaleDateString(locale)}
              </p>
            )}
            {hasContactData && (
              <p className="my-[5px]">
                {t.address}: {data.address}
                {data.city && `, ${data.city}`}
                {data.postalCode && ` ${data.postalCode}`}
              </p>
            )}
            {data.phone && <p className="my-[5px]">{t.phone}: {data.phone}</p>}
            {data.email && <p className="my-[5px]">{t.email}: {data.email}</p>}
            {data.socialLinks && data.socialLinks.filter((l) => l.name && l.url).map((link, index) => (
              <p key={index} className="my-[5px]">
                {link.name}:{' '}
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                  {link.url}
                </a>
              </p>
            ))}
          </div>
        </div>
      </div>

      {(data.sectionOrder ?? DEFAULT_SECTION_ORDER).map((sectionId: CVSectionId) => {
        if (sectionId === 'summary') {
          return data.summary ? (
            <div key="summary" className="cv-section">
              <h3 className="cv-section-title">{t.professionalSummary}</h3>
              <p className="leading-[1.6] text-[#333333]">{data.summary}</p>
            </div>
          ) : null;
        }

        if (sectionId === 'experience') {
          return data.experience.length > 0 ? (
            <div key="experience" className="cv-section">
              <h3 className="cv-section-title">{t.workExperience}</h3>
              {data.experience.map((exp, index) => (
                <div key={index} className="mb-5">
                  <div className="flex justify-between items-baseline mb-2">
                    <h4 className="text-[1.2em] text-black">{exp.position}</h4>
                    <span className="text-[#666] text-[0.9em]">
                      {exp.startDate && new Date(exp.startDate).toLocaleDateString(locale)} -{' '}
                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString(locale) : t.present}
                    </span>
                  </div>
                  <p className="experience-company">{exp.company}</p>
                  {exp.jobDescription && (
                    <p className="mb-2.5 text-[#333333] leading-[1.5]">{exp.jobDescription}</p>
                  )}
                  <ul className="pl-5 m-0">
                    {exp.description
                      .filter((d) => d.trim())
                      .map((desc, descIndex) => (
                        <li key={descIndex} className="mb-[5px] text-[#333333]">
                          {desc}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null;
        }

        if (sectionId === 'customSections') {
          return data.customSections.length > 0 ? (
            <>
              {data.customSections.map((section) => (
                <div key={section.id} className="cv-section">
                  <h3 className="cv-section-title">{section.title}</h3>

                  {section.type === 'it-projects' && (
                    <div className="flex flex-col gap-[15px]">
                      {section.items.map((item) => (
                        <div key={item.id} className="border border-gray-200 p-[15px] rounded">
                          <h4 className="text-[1.1em] text-black mb-2">{item.data.name as string}</h4>
                          {item.data.description && (
                            <p className="text-[#333333] mb-2 leading-[1.5]">{item.data.description as string}</p>
                          )}
                          {item.data.technologies && Array.isArray(item.data.technologies) && (
                            <div className="mt-2.5">
                              <strong className="text-black text-[0.9em]">Technologie:</strong>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {(item.data.technologies as string[]).map((tech, techIndex) => (
                                  <span
                                    key={techIndex}
                                    className="bg-gray-100 px-3 py-1 rounded-full text-[0.85em] text-[#333333]"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.data.link && (
                            <div className="mt-2">
                              <a
                                href={item.data.link as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600"
                              >
                                {item.data.link as string}
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'education' && (
                    <div className="flex flex-col gap-3">
                      {section.items.map((item) => (
                        <div key={item.id}>
                          <div className="flex justify-between mb-1">
                            <h4 className="text-[1.1em] text-black">{item.data.school as string}</h4>
                            <span className="text-[#666] text-[0.9em]">
                              {item.data.startDate as string} - {item.data.endDate || t.present}
                            </span>
                          </div>
                          <p className="text-[#333333] font-medium">{item.data.degree as string}</p>
                          {item.data.field && (
                            <p className="text-[#666] text-[0.95em]">{item.data.field as string}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'languages' && (
                    <div className="flex flex-col gap-2.5">
                      {section.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-baseline">
                          <span className="text-[#333333] font-medium">{item.data.language as string}</span>
                          <span className="text-[#666] text-[0.95em]">{item.data.level as string}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'certifications' && (
                    <div className="flex flex-col gap-2.5">
                      {section.items.map((item) => (
                        <div key={item.id}>
                          <div className="flex justify-between mb-1">
                            <h4 className="text-[1.05em] text-black">{item.data.name as string}</h4>
                            <span className="text-[#666] text-[0.9em]">{item.data.date as string}</span>
                          </div>
                          <p className="text-[#666] text-[0.95em]">{item.data.issuer as string}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'aviation' && (
                    <div className="flex flex-col gap-3">
                      {section.items.map((item) => (
                        <div key={item.id} className="border border-gray-200 p-3 rounded">
                          <div className="flex justify-between mb-2">
                            <h4 className="text-[1.05em] text-black">{item.data.license as string}</h4>
                            <span className="text-[#666] text-[0.9em]">{item.data.hours as string}</span>
                          </div>
                          {item.data.type && (
                            <p className="text-[#666] text-[0.95em]">Typ: {item.data.type as string}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'construction' && (
                    <div className="flex flex-col gap-3">
                      {section.items.map((item) => (
                        <div key={item.id} className="border border-gray-200 p-3 rounded">
                          <div className="flex justify-between mb-2">
                            <h4 className="text-[1.05em] text-black">{item.data.project as string}</h4>
                            <span className="text-[#666] text-[0.9em]">{item.data.duration as string}</span>
                          </div>
                          <p className="text-[#333333] font-medium mb-1">{item.data.role as string}</p>
                          {item.data.scope && (
                            <p className="text-[#666] text-[0.95em] leading-[1.4]">{item.data.scope as string}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'skills' && (
                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                      {section.items.map((item) => (
                        <div key={item.id} className="border border-gray-200 p-2.5 rounded">
                          <strong className="text-black">{item.data.category as string}</strong>
                          <p className="text-[#333333] mt-1 text-[0.95em]">{item.data.skills as string}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'custom' && (
                    <div className="flex flex-col gap-3">
                      {section.items.map((item) => (
                        <div key={item.id} className="border border-gray-200 p-3 rounded">
                          {Object.entries(item.data).map(([key, value]) => (
                            <div key={key} className="mb-2 last:mb-0">
                              <strong className="text-black text-[0.9em]">{key}:</strong>
                              <p className="text-[#333333] mt-0.5">{value as string}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : null;
        }

        if (sectionId === 'additionalInfo') {
          return data.additionalInfo.length > 0 ? (
            <div key="additionalInfo" className="cv-section">
              <h3 className="cv-section-title">{t.additionalInfo}</h3>
              <div className="cv-additional-info">
                {data.additionalInfo.map(
                  (info, index) =>
                    info.label && info.content && (
                      <div key={index} className="cv-info-item">
                        <div className="cv-info-label">{info.label}</div>
                        <div className="cv-info-value">{info.content}</div>
                      </div>
                    ),
                )}
              </div>
            </div>
          ) : null;
        }

        return null;
      })}
      {data.gdprConsent && (
        <div className="mt-8 pt-4 border-t border-gray-300">
          <p className="text-[0.75em] text-[#666] leading-[1.5] italic">{t.gdprConsent}</p>
        </div>
      )}
    </div>
  );
});

CVPreview.displayName = 'CVPreview';