import { forwardRef } from 'react';
import type { CVData } from '../types';

interface CVPreviewProps {
  data: CVData;
}

// Tłumaczenia nagłówków
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
  },
};

export const CVPreview = forwardRef<HTMLDivElement, CVPreviewProps>(({ data }, ref) => {
  const t = translations[data.language];
  const hasContactData = data.address || data.city || data.postalCode || data.phone || data.email;

  return (
    <div ref={ref} className="cv-preview active">
      {/* Zawsze pokazuj nagłówek z imieniem i nazwiskiem */}
      <div className="cv-header">
        {data.photo && (
          <div className="cv-photo">
            <img src={data.photo} alt={`${data.firstName} ${data.lastName}`} />
          </div>
        )}
        <div className="cv-info">
          <h1 className="cv-name">
            {data.firstName || 'Imię'} {data.lastName || 'Nazwisko'}
          </h1>
          <div className="cv-contact">
            {data.birthDate && <p>{t.birthDate}: {new Date(data.birthDate).toLocaleDateString(data.language === 'pl' ? 'pl-PL' : 'en-GB')}</p>}
            {hasContactData && (
              <p>
                {t.address}: {data.address}
                {data.city && `, ${data.city}`}
                {data.postalCode && ` ${data.postalCode}`}
              </p>
            )}
            {data.phone && <p>{t.phone}: {data.phone}</p>}
            {data.email && <p>{t.email}: {data.email}</p>}
          </div>
        </div>
      </div>

      {/* Podsumowanie zawodowe */}
      {data.summary && (
        <div className="cv-section">
          <h3 className="cv-section-title">{t.professionalSummary}</h3>
          <p style={{ lineHeight: '1.6', color: '#333333' }}>{data.summary}</p>
        </div>
      )}

      {/* Doświadczenie zawodowe */}
      {data.experience.length > 0 && (
        <div className="cv-section">
          <h3 className="cv-section-title">{t.workExperience}</h3>
          {data.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '8px',
                }}
              >
                <h4 style={{ fontSize: '1.2em', color: '#000000' }}>{exp.position}</h4>
                <span style={{ color: '#666', fontSize: '0.9em' }}>
                  {exp.startDate && new Date(exp.startDate).toLocaleDateString(data.language === 'pl' ? 'pl-PL' : 'en-GB')} -{' '}
                  {exp.endDate ? new Date(exp.endDate).toLocaleDateString(data.language === 'pl' ? 'pl-PL' : 'en-GB') : t.present}
                </span>
              </div>
              <p className="experience-company">{exp.company}</p>
              {exp.jobDescription && (
                <p style={{ marginBottom: '10px', color: '#333333', lineHeight: '1.5' }}>
                  {exp.jobDescription}
                </p>
              )}
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {exp.description
                  .filter((d) => d.trim())
                  .map((desc, descIndex) => (
                    <li key={descIndex} style={{ marginBottom: '5px', color: '#333333' }}>
                      {desc}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Dodatkowe sekcje personalizowane */}
      {data.customSections.length > 0 &&
        data.customSections.map((section) => (
          <div key={section.id} className="cv-section">
            <h3 className="cv-section-title">{section.title}</h3>
            {section.type === 'it-projects' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {section.items.map((item) => (
                  <div key={item.id} style={{ border: '1px solid #e5e7eb', padding: '15px', borderRadius: '4px' }}>
                    <h4 style={{ fontSize: '1.1em', color: '#000000', marginBottom: '8px' }}>
                      {item.data.name as string}
                    </h4>
                    {item.data.description && (
                      <p style={{ color: '#333333', marginBottom: '8px', lineHeight: '1.5' }}>
                        {item.data.description as string}
                      </p>
                    )}
                    {item.data.technologies && Array.isArray(item.data.technologies) && (
                      <div style={{ marginTop: '10px' }}>
                        <strong style={{ color: '#000000', fontSize: '0.9em' }}>Technologies:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                          {(item.data.technologies as string[]).map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              style={{
                                background: '#f3f4f6',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.85em',
                                color: '#333333',
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {item.data.link && (
                      <div style={{ marginTop: '8px' }}>
                        <a href={item.data.link as string} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                          {item.data.link as string}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === 'education' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.items.map((item) => (
                  <div key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.1em', color: '#000000' }}>{item.data.school as string}</h4>
                      <span style={{ color: '#666', fontSize: '0.9em' }}>
                        {item.data.startDate as string} - {item.data.endDate || t.present}
                      </span>
                    </div>
                    <p style={{ color: '#333333', fontWeight: '500' }}>{item.data.degree as string}</p>
                    {item.data.field && <p style={{ color: '#666', fontSize: '0.95em' }}>{item.data.field as string}</p>}
                  </div>
                ))}
              </div>
            )}

            {section.type === 'languages' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {section.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: '#333333', fontWeight: '500' }}>{item.data.language as string}</span>
                    <span style={{ color: '#666', fontSize: '0.95em' }}>{item.data.level as string}</span>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'certifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {section.items.map((item) => (
                  <div key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.05em', color: '#000000' }}>{item.data.name as string}</h4>
                      <span style={{ color: '#666', fontSize: '0.9em' }}>{item.data.date as string}</span>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.95em' }}>{item.data.issuer as string}</p>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'aviation' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.items.map((item) => (
                  <div key={item.id} style={{ border: '1px solid #e5e7eb', padding: '12px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '1.05em', color: '#000000' }}>{item.data.license as string}</h4>
                      <span style={{ color: '#666', fontSize: '0.9em' }}>{item.data.hours as string}</span>
                    </div>
                    {item.data.type && <p style={{ color: '#666', fontSize: '0.95em' }}>Typ: {item.data.type as string}</p>}
                  </div>
                ))}
              </div>
            )}

            {section.type === 'construction' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.items.map((item) => (
                  <div key={item.id} style={{ border: '1px solid #e5e7eb', padding: '12px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '1.05em', color: '#000000' }}>{item.data.project as string}</h4>
                      <span style={{ color: '#666', fontSize: '0.9em' }}>{item.data.duration as string}</span>
                    </div>
                    <p style={{ color: '#333333', fontWeight: '500', marginBottom: '4px' }}>{item.data.role as string}</p>
                    {item.data.scope && (
                      <p style={{ color: '#666', fontSize: '0.95em', marginTop: '4px', lineHeight: '1.4' }}>
                        {item.data.scope as string}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === 'skills' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {section.items.map((item) => (
                  <div key={item.id} style={{ border: '1px solid #e5e7eb', padding: '10px', borderRadius: '4px' }}>
                    <strong style={{ color: '#000000' }}>{item.data.category as string}</strong>
                    <p style={{ color: '#333333', marginTop: '4px', fontSize: '0.95em' }}>
                      {item.data.skills as string}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.items.map((item) => (
                  <div key={item.id} style={{ border: '1px solid #e5e7eb', padding: '12px', borderRadius: '4px' }}>
                    {Object.entries(item.data).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: value !== item.data[Object.keys(item.data)[Object.keys(item.data).length - 1]] ? '8px' : '0' }}>
                        <strong style={{ color: '#000000', fontSize: '0.9em' }}>{key}:</strong>
                        <p style={{ color: '#333333', marginTop: '2px' }}>{value as string}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

      {/* Informacje dodatkowe */}
      {data.additionalInfo.length > 0 && (
        <div className="cv-section">
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
      )}
    </div>
  );
});

CVPreview.displayName = 'CVPreview';
