const { useState, useEffect } = React;

function App() {
    const [cvData, setCvData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        photo: null,
        address: '',
        city: '',
        postalCode: '',
        phone: '',
        email: '',
        additionalInfo: [],
        experience: []
    });

    const [showPreview, setShowPreview] = useState(false);

    // Wczytywanie zdjęcia
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCvData({ ...cvData, photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // Dodawanie informacji dodatkowej
    const addAdditionalInfo = () => {
        setCvData({
            ...cvData,
            additionalInfo: [...cvData.additionalInfo, { label: '', content: '' }]
        });
    };

    // Aktualizacja informacji dodatkowej
    const updateAdditionalInfo = (index, field, value) => {
        const newInfo = [...cvData.additionalInfo];
        newInfo[index][field] = value;
        setCvData({ ...cvData, additionalInfo: newInfo });
    };

    // Usuwanie informacji dodatkowej
    const removeAdditionalInfo = (index) => {
        const newInfo = cvData.additionalInfo.filter((_, i) => i !== index);
        setCvData({ ...cvData, additionalInfo: newInfo });
    };

    // Dodawanie doświadczenia
    const addExperience = () => {
        setCvData({
            ...cvData,
            experience: [...cvData.experience, {
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                description: ['']
            }]
        });
    };

    // Aktualizacja doświadczenia
    const updateExperience = (index, field, value) => {
        const newExp = [...cvData.experience];
        newExp[index][field] = value;
        setCvData({ ...cvData, experience: newExp });
    };

    // Dodawanie podpunktu w doświadczeniu
    const addDescriptionPoint = (expIndex) => {
        const newExp = [...cvData.experience];
        newExp[expIndex].description.push('');
        setCvData({ ...cvData, experience: newExp });
    };

    // Aktualizacja podpunktu w doświadczeniu
    const updateDescriptionPoint = (expIndex, descIndex, value) => {
        const newExp = [...cvData.experience];
        newExp[expIndex].description[descIndex] = value;
        setCvData({ ...cvData, experience: newExp });
    };

    // Usuwanie podpunktu z doświadczenia
    const removeDescriptionPoint = (expIndex, descIndex) => {
        const newExp = [...cvData.experience];
        newExp[expIndex].description = newExp[expIndex].description.filter((_, i) => i !== descIndex);
        setCvData({ ...cvData, experience: newExp });
    };

    // Usuwanie doświadczenia
    const removeExperience = (index) => {
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
    const loadFromJSON = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
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
                additionalInfo: [],
                experience: []
            });
        }
    };

    // Drukowanie
    const printCV = () => {
        window.print();
    };

    return (
        <div className="container">
            <h1>📄 Generator CV</h1>

            <div className="buttons-section">
                <button onClick={saveToJSON} className="btn btn-primary">💾 Zapisz CV (JSON)</button>
                <label className="btn btn-secondary">
                    📂 Wczytaj CV (JSON)
                    <input type="file" onChange={loadFromJSON} accept=".json" style={{ display: 'none' }} />
                </label>
                <button onClick={clearForm} className="btn btn-danger">🗑️ Wyczyść formularz</button>
                <button onClick={() => setShowPreview(!showPreview)} className="btn btn-add">
                    {showPreview ? '📝 Edytuj' : '👁️ Podgląd CV'}
                </button>
            </div>

            {!showPreview ? (
                <form>
                    <div className="form-section">
                        <h2>📋 Dane podstawowe</h2>
                        <div className="form-group">
                            <label>Imię:</label>
                            <input
                                type="text"
                                value={cvData.firstName}
                                onChange={(e) => setCvData({ ...cvData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Nazwisko:</label>
                            <input
                                type="text"
                                value={cvData.lastName}
                                onChange={(e) => setCvData({ ...cvData, lastName: e.target.value })}
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

                    <div className="form-section">
                        <h2>📍 Dane kontaktowe</h2>
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

                    <div className="form-section">
                        <h2>💼 Doświadczenie zawodowe</h2>
                        {cvData.experience.map((exp, expIndex) => (
                            <div key={expIndex} className="experience-item" style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '15px' }}>
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
                                                🗑️
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
                                    🗑️ Usuń doświadczenie
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addExperience}
                            className="btn btn-add"
                        >
                            + Dodaj doświadczenie
                        </button>
                    </div>

                    <div className="form-section">
                        <h2>➕ Informacje dodatkowe</h2>
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
                                    🗑️
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addAdditionalInfo}
                            className="btn btn-add"
                        >
                            + Dodaj informację
                        </button>
                    </div>
                </form>
            ) : (
                <div className="preview-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>👁️ Podgląd CV</h2>
                        <button onClick={printCV} className="btn btn-print">🖨️ Drukuj / Zapisz PDF</button>
                    </div>
                    <CVPreview data={cvData} />
                </div>
            )}
        </div>
    );
}

function CVPreview({ data }) {
    return (
        <div className="cv-preview active">
            {data.photo && (
                <div className="cv-header">
                    <div className="cv-photo">
                        <img src={data.photo} alt={`${data.firstName} ${data.lastName}`} />
                    </div>
                    <div className="cv-info">
                        <h1 className="cv-name">{data.firstName} {data.lastName}</h1>
                        <div className="cv-contact">
                            <p>📅 {data.birthDate && new Date(data.birthDate).toLocaleDateString('pl-PL')}</p>
                            <p>📍 {data.address}{data.city && `, ${data.city}`}{data.postalCode && ` ${data.postalCode}`}</p>
                            <p>📞 {data.phone}</p>
                            <p>✉️ {data.email}</p>
                        </div>
                    </div>
                </div>
            )}

            {data.experience.length > 0 && (
                <div className="cv-section">
                    <h3 className="cv-section-title">💼 Doświadczenie zawodowe</h3>
                    {data.experience.map((exp, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                                <h4 style={{ fontSize: '1.2em', color: '#333' }}>{exp.position}</h4>
                                <span style={{ color: '#666', fontSize: '0.9em' }}>
                                    {exp.startDate && new Date(exp.startDate).toLocaleDateString('pl-PL')} -
                                    {exp.endDate ? ` ${new Date(exp.endDate).toLocaleDateString('pl-PL')}` : ' obecnie'}
                                </span>
                            </div>
                            <p style={{ color: '#667eea', fontWeight: '600', marginBottom: '10px' }}>{exp.company}</p>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                {exp.description.filter(d => d.trim()).map((desc, descIndex) => (
                                    <li key={descIndex} style={{ marginBottom: '5px', color: '#555' }}>{desc}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {data.additionalInfo.length > 0 && (
                <div className="cv-section">
                    <h3 className="cv-section-title">➕ Informacje dodatkowe</h3>
                    <div className="cv-additional-info">
                        {data.additionalInfo.map((info, index) => (
                            info.label && info.content && (
                                <div key={index} className="cv-info-item">
                                    <div className="cv-info-label">{info.label}</div>
                                    <div className="cv-info-value">{info.content}</div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
