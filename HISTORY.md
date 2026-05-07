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
