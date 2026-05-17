# Task History

| ID | Date | Task | Status | Notes |
|----|------|------|--------|-------|
| 1 | 2026-04-07 | Initialize git repository and push to GitHub | DONE | Created .gitignore, HISTORY.md, committed all project files, and pushed to git@github.com:mateuszo19/cv-generator.git |
| 5 | 2026-04-07 | Add Style section with font picker for CV preview | DONE | FontPicker component, 7 fonts (Inter default), dynamic font-family in CVPreview | Font selection cards in right panel, Google Fonts, dynamic font applied to CV |
| 4 | 2026-04-07 | Fix deploy.sh — SSH key auth support, sshpass detection, fix scp glob bug | DONE | scp glob "dist/*" w cudzysłowie nie był rozwijany przez shell; zamieniono na "dist/." | sshpass not available on macOS by default |
| 3 | 2026-04-07 | Extract custom sections to separate components in components/extras | DONE | One component per section type: it-projects, education, skills, certifications, languages, aviation, construction, custom |
| 2 | 2026-04-07 | Migrate styling to Tailwind CSS v4 | DONE | Installed tailwindcss + @tailwindcss/vite, updated vite.config.ts, index.css, rewrote App.tsx and CVPreview.tsx with Tailwind utilities, cleared App.css. Build passes. |
| 6 | 2026-05-07 | Add reorder (up/down) buttons for items in "Informacje dodatkowe" section | DONE | Added moveAdditionalInfo handler and ▲/▼ buttons per row in App.tsx |
| 7 | 2026-05-07 | Add reorder buttons for experience entries, custom sections and their items; ensure order persists in JSON | DONE | Added moveExperience, moveCustomSection, moveCustomSectionItem handlers; ▲/▼ in all section components; order inherits from array in JSON |
| 8 | 2026-05-14 | Add configurable social media links in contact section and GDPR consent clause at the bottom of CV; both exported to JSON/PDF | DONE | SocialLink[] and gdprConsent: boolean added to CVData; handlers in App.tsx; rendered in CVPreview; 6 Playwright tests passing |
| 9 | 2026-05-16 | Add section order management - user can reorder main CV sections (summary, experience, customSections, additionalInfo); order persists in JSON export/import | DONE | CVSectionId type + DEFAULT_SECTION_ORDER in types.ts; moveCVSection handler in App.tsx; "Kolejnosc sekcji" panel with ▲/▼ buttons; CVPreview renders by sectionOrder; backward compat in loadFromJSON; 6 Playwright tests passing |
| 10 | 2026-05-17 | Fix print page-break: section header orphaned on one page while content on next | DONE | Added break-after: avoid to .cv-section-title in index.css |
