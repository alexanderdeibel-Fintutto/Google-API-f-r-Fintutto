# FINTUTTO RECHNER & CHECKER - MASTER LOVABLE PROMPT

## Basis-Anweisung für alle neuen Lovable-Apps

Kopiere diese Basis-Prompt und füge den spezifischen Rechner/Checker-Teil hinzu.

---

## BASIS-PROMPT (für alle Apps gleich)

```
Erstelle eine professionelle Immobilien-Rechner Web-App mit React, TypeScript und Tailwind CSS.

## DESIGN-SYSTEM (FinTuttO Standard)

### Farben
- Primary: #10b981 (Emerald-500)
- Primary Hover: #059669 (Emerald-600)
- Background: Gradient von primary-50 zu white
- Cards: White mit subtle shadow
- Text: Gray-900 (Headings), Gray-600 (Body)

### Layout
- Zwei-Panel-Layout (Desktop): Links Input, Rechts Ergebnis
- Mobile: Stacked (Input oben, Ergebnis unten)
- Max-Width: 1200px, zentriert
- Padding: 24px (Desktop), 16px (Mobile)

### Komponenten-Klassen
```css
.vf-calculator { @apply grid grid-cols-1 lg:grid-cols-2 gap-6; }
.vf-calculator-input-panel { @apply bg-white rounded-xl shadow-sm border p-6; }
.vf-calculator-result-panel { @apply bg-white rounded-xl shadow-sm border p-6; }
.vf-calculator-input-group { @apply space-y-4 p-4 bg-gray-50 rounded-lg; }
.vf-calculator-input-group-title { @apply text-sm font-semibold text-gray-700 mb-3; }
.vf-calculator-primary-result { @apply text-center py-6 bg-gradient-to-br from-emerald-50 to-white rounded-lg; }
.vf-calculator-primary-label { @apply text-sm text-gray-600 mb-1; }
.vf-calculator-primary-value { @apply text-4xl font-bold text-emerald-600; }
.vf-calculator-secondary-results { @apply grid grid-cols-2 gap-4 my-6; }
.vf-calculator-secondary-item { @apply text-center p-3 bg-gray-50 rounded-lg; }
.vf-calculator-secondary-label { @apply text-xs text-gray-500; }
.vf-calculator-secondary-value { @apply text-lg font-semibold text-gray-900; }
.vf-calculator-breakdown { @apply border-t pt-4 mt-4 space-y-2; }
.vf-calculator-breakdown-title { @apply text-sm font-semibold text-gray-700 mb-3; }
.vf-calculator-breakdown-item { @apply flex justify-between text-sm; }
.vf-btn-gradient { @apply bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700; }
.vf-tool-icon { @apply w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600; }
```

### Funktionalität
1. Input-Validierung in Echtzeit
2. Berechnung über Backend-Funktion (base44.functions.invoke)
3. Ergebnis-Anzeige mit Primary/Secondary/Breakdown Struktur
4. Lead-Capture nach Berechnung (E-Mail für PDF)
5. PDF-Download Option
6. Toast-Notifications für Feedback
7. Loading States
8. Responsive Design

### Dependencies
- React 18+
- Tailwind CSS
- Lucide React (Icons)
- Sonner (Toasts)

### Dateistruktur
```
src/
├── pages/
│   └── [RechnerName].jsx
├── components/
│   ├── shared/
│   │   └── VfInput.jsx
│   ├── ui/
│   │   ├── button.jsx
│   │   └── card.jsx
│   └── lead-capture/
│       └── VfLeadCapturePage.jsx
└── api/
    └── base44Client.js
```
```

---

## SPEZIFISCHE RECHNER-PROMPTS

Siehe einzelne Dateien in `/calculators/rechner/` und `/calculators/checker/`
