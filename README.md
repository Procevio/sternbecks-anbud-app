# Sternbecks Anbudsapplikation

En professionell webbapplikation för anbudsgenerering för Sternbecks Måleri & Fönsterhantverk. Applikationen ersätter Google Forms-formulär och integrerar med befintlig Zapier-automation.

## 🌟 Funktioner

- **Responsiv design** - Fungerar perfekt på både mobil och desktop
- **Avancerad prissättningslogik** - Komplett prisberäkning med komponenter, pålägg och avdrag
- **Realtidsberäkning** - Automatisk uppdatering av alla priskomponenter vid ändringar
- **Detaljerad prisvisning** - Transparent uppdelning från grundpris till slutligt kundpris
- **ROT-avdrag beräkning** - Automatisk beräkning av 50% ROT-avdrag på arbetskostnad
- **Google Forms Integration** - Automatisk inskickning med detaljerad prissammanfattning
- **Formulärvalidering** - Omfattande validering med felhantering
- **Modern design** - Elegant design som speglar företagets kvalitetshantverk
- **Tillgänglighet** - Byggd med tillgänglighet i fokus (WCAG-riktlinjer)

## 🎨 Design

Applikationen använder företagets färgschema:
- **Mörk antracit** (#2c2c2c) - Huvudfärg
- **Krämbeige** (#d4c4a0) - Accent färg  
- **Guld/beige** (#c8b896) - Kompletterande färg

## 📋 Formulärfält

### Kontaktinformation
- Företag/Namn (obligatorisk)
- Kontaktperson
- E-post (obligatorisk)
- Telefonnummer (obligatorisk)
- Adress (obligatorisk)
- Postnummer (obligatorisk)
- Ort (obligatorisk)
- Fastighetsbesiktning (checkbox)

### Arbetsbeskrivning
- **Typ av renovering** (obligatorisk radio button):
  - Utvändig renovering (100% av totalsumman)
  - Invändig renovering (+25% på totalsumman)
  - Utvändig renovering samt målning av innerbägens insida (+5% på totalsumman)
  - Övrigt (endast extra timmar)
- **Typ av fönster** (dropdown):
  - Traditionell - Linoljebehandling (+15%)
  - Modern - Alcro bestå (ingen tilläggsavgift)
  - Kopplade standard (standardpris)
  - Isolerglas (+400kr/fönster)
  - Insatsbågar (+300kr/fönster)
  - Inåtgående -5% (-5%)
  - Utåtgående standard (standardpris)
- **Arbetsbeskrivning** (textarea) - Fri text
- **Extra timmar** (700 kr/timme)
- **Materialkostnad** (kr)

### Antal partier
- **Fönsterpartier** (används för spröjs och fönstertyp-beräkningar)
- **Dörrpartier** (6000kr/st)
- **1 luftare** (3500kr/st)
- **2 luftare** (5000kr/st)
- **3 luftare** (6500kr/st)
- **4 luftare** (8000kr/st)
- **5 luftare** (9000kr/st)
- **6 luftare** (11000kr/st)

### Tillägg och specialalternativ
- **Spröjs** (checkbox + antal per båge)
  - 300kr per ruta × antal spröjs × antal fönster
- **E-glas upgrade** (checkbox + kvm)
  - 2500kr/kvm
- **ROT-avdrag** (checkbox)
  - 50% avdrag på arbetskostnad (exkl. material)

## 💰 Prissättningslogik

Applikationen använder en avancerad prissättningsmodell med följande komponenter:

### 1. Grundkomponenter
- **Luftare och dörrar**: Fast prissättning per enhet enligt tabell ovan
- **Fönstertyp-tillägg**: Procentuella eller fasta tillägg beroende på typ
- **Spröjs/E-glas**: Tillägg baserat på antal och area
- **Renoveringstyp-pålägg**: Procentuellt pålägg på arbetskostnad
- **Extra timmar**: 700kr per timme
- **Material**: Kundangiven kostnad

### 2. Beräkningsordning
1. Beräkna grundkomponenter (luftare + dörrar)
2. Lägg till fönstertyp-tillägg
3. Lägg till spröjs/E-glas kostnader
4. Lägg till extra timmar och material
5. Applicera renoveringstyp-pålägg på arbetskostnad
6. Beräkna moms (25%)
7. Applicera ROT-avdrag (50% på arbetskostnad exkl. material)

### 3. Slutlig prisvisning
```
Grundpris komponenter
├── Luftare och dörrar: XX,XXX kr
├── Fönstertyp-tillägg: +X,XXX kr
├── Spröjs/E-glas: +X,XXX kr
├── Renoveringstyp-pålägg: +X,XXX kr
├── Extra timmar: +X,XXX kr
└── Material: +X,XXX kr
────────────────────────────────────
Summa exkl. moms: XX,XXX kr
Moms (25%): +X,XXX kr
────────────────────────────────────
Totalt inkl. moms: XX,XXX kr
ROT-avdrag (50%): -X,XXX kr
────────────────────────────────────
KUNDEN BETALAR: XX,XXX kr
```

## ⚙️ Installation & Setup

### 1. Klona eller ladda ner projektet
```bash
git clone [repository-url]
cd sternbecks-anbudsapp
```

### 2. Konfigurera Google Forms Integration

**VIKTIGT:** Du måste uppdatera följande i `assets/js/app.js`:

1. **Google Forms URL**: Ersätt placeholder-URL med din riktiga Google Forms URL
```javascript
GOOGLE_FORMS_URL: 'https://docs.google.com/forms/d/e/YOUR_REAL_FORM_ID/formResponse'
```

2. **Form Field Mapping**: Uppdatera entry IDs för att matcha ditt Google Forms:
```javascript
FORM_FIELDS: {
    'company': 'entry.DITT_ENTRY_ID',
    'email': 'entry.DITT_ENTRY_ID',
    // ... uppdatera alla fält
}
```

#### Hur får jag Google Forms entry IDs?

1. Öppna ditt Google Forms i redigeringsläge
2. Klicka på "Förhandsgranska" 
3. Öppna Developer Tools (F12)
4. Gå till Network tab
5. Fyll i och skicka formuläret
6. Leta efter POST-request till Google Forms
7. Kopiera entry-ID:n från request body

### 3. Justera prissättning

Applikationen är redan konfigurerad med din prissättning, men du kan justera värdena i `assets/js/app.js`:

```javascript
const CONFIG = {
    HOURLY_RATE: 700,    // Pris per extra timme
    
    // Prissättning per enhet
    UNIT_PRICES: {
        'antal-dorrpartier': 6000,  // Dörrpartier: 6000kr/st
        'antal-1-luftare': 3500,    // 1 luftare: 3500kr/st
        'antal-2-luftare': 5000,    // 2 luftare: 5000kr/st
        'antal-3-luftare': 6500,    // 3 luftare: 6500kr/st
        'antal-4-luftare': 8000,    // 4 luftare: 8000kr/st
        'antal-5-luftare': 9000,    // 5 luftare: 9000kr/st
        'antal-6-luftare': 11000    // 6 luftare: 11000kr/st
    },
    
    // Tillägg
    EXTRAS: {
        SPROJS_PER_RUTA: 300,       // 300kr per ruta
        E_GLASS_PER_SQM: 2500,      // 2500kr/kvm
        VAT_RATE: 0.25,             // 25% moms
        ROT_DEDUCTION: 0.5          // 50% ROT-avdrag
    }
};
```

### 4. Anpassa företagsinformation

Uppdatera företagsnamn och andra detaljer i `index.html` om nödvändigt.

## 🚀 Deployment

### GitHub Pages (Rekommenderat)

1. **Skapa GitHub repository**
```bash
git init
git add .
git commit -m "Initial commit: Sternbecks anbudsapplikation"
git branch -M main
git remote add origin https://github.com/dittanvändarnamn/sternbecks-anbudsapp.git
git push -u origin main
```

2. **Aktivera GitHub Pages**
   - Gå till Settings i ditt GitHub repository
   - Scrolla ner till "Pages" sektionen  
   - Välj "Deploy from a branch"
   - Välj "main" branch och "/ (root)"
   - Klicka "Save"

3. **Din app kommer att vara tillgänglig på:**
```
https://dittanvändarnamn.github.io/sternbecks-anbudsapp/
```

### Alternativa deployment-alternativ

- **Netlify**: Dra och släpp `sternbecks-anbudsapp` mappen
- **Vercel**: Anslut GitHub repository
- **Egen webbserver**: Ladda upp alla filer till din webbserver

## 📁 Filstruktur

```
sternbecks-anbudsapp/
├── index.html              # Huvudfil med komplett formulär och prisvisning
├── README.md               # Denna fil (uppdaterad dokumentation)
├── config-example.md       # Detaljerad konfigurationsguide
├── assets/
│   ├── css/
│   │   └── styles.css      # Komplett styling inkl. prisvisning
│   ├── js/
│   │   └── app.js          # Avancerad prissättningslogik och validering
│   └── images/             # Plats för logotyp och bilder
```

## ✨ Avancerade funktioner

### Automatisk prisberäkning
- **Realtidsuppdatering**: Priserna uppdateras automatiskt när användaren ändrar värden
- **Komponentbaserad**: Varje del av priset visas separat för transparens
- **ROT-optimering**: Automatisk beräkning och visning av ROT-avdrag när tillämpligt

### Intelligent formulärvalidering
- **Realtidsvalidering**: Felmeddelanden visas direkt vid felaktig inmatning
- **Kontextuell hjälp**: Hjälptexter visar prisinfo för varje alternativ
- **Responsiv design**: Fungerar perfekt på alla enheter

### Google Forms integration
- **Detaljerad prissammanfattning**: Komplett prisuppdelning skickas till Google Forms
- **Automatisk formatering**: Priserna formateras elegant för läsbarhet
- **Zapier-kompatibel**: Fungerar med befintliga automationer

### Tillgänglighetsfunktioner
- **Tangentbordsnavigation**: Komplett stöd för tangentbordsanvändare
- **Skärmläsaroptimerad**: ARIA-labels och semantisk HTML
- **Kontrastoptimerad**: Färger som uppfyller WCAG-riktlinjer

## 🔧 Anpassning

### Lägga till företagslogotyp

1. Lägg logotyp i `assets/images/`
2. Uppdatera `index.html` header-sektionen:
```html
<div class="logo-section">
    <img src="assets/images/logo.png" alt="Sternbecks Måleri & Fönsterhantverk" class="company-logo">
    <h1 class="company-name">Sternbecks Måleri & Fönsterhantverk</h1>
    <!-- ... -->
</div>
```

3. Lägg till CSS för logotypen i `styles.css`:
```css
.company-logo {
    max-height: 80px;
    margin-bottom: 1rem;
}
```

### Ändra färgschema

Uppdatera CSS custom properties i `styles.css`:
```css
:root {
    --primary-dark: #2c2c2c;    /* Din huvudfärg */
    --cream-beige: #d4c4a0;     /* Din accent färg */
    --gold-beige: #c8b896;      /* Din kompletterande färg */
}
```

## 📱 Browser-stöd

Applikationen stödjer alla moderna webbläsare:
- Chrome (senaste 2 versionerna)
- Firefox (senaste 2 versionerna)
- Safari (senaste 2 versionerna)
- Edge (senaste 2 versionerna)

## 🐛 Felsökning

### Google Forms skickar inte data

1. Kontrollera att `GOOGLE_FORMS_URL` är korrekt
2. Verifiera att alla `entry.` IDs matchar ditt formulär
3. Testa att skicka data direkt till Google Forms först

### Prisberäkning fungerar inte

1. Kontrollera att `CONFIG.BASE_PRICE` och `CONFIG.HOURLY_RATE` är satta
2. Kontrollera browser console för JavaScript-fel

### Styling ser fel ut

1. Kontrollera att `styles.css` laddas korrekt
2. Rensa browser cache
3. Kontrollera att Google Fonts laddas

## 📞 Support

För teknisk support eller frågor om applikationen, kontakta utvecklaren eller konsultera denna dokumentation.

## 🚀 Framtida förbättringar

### Klara funktioner ✅
- [x] **Komplett prissättningslogik** - Avancerad prisberäkning med alla komponenter
- [x] **ROT-avdrag beräkning** - Automatisk beräkning och visning
- [x] **Detaljerad prisvisning** - Transparent uppdelning av alla kostnadsposter
- [x] **Google Forms integration** - Komplett med detaljerad prissammanfattning
- [x] **Responsiv design** - Fungerar perfekt på alla enheter
- [x] **Formulärvalidering** - Omfattande realtidsvalidering

### Potentiella framtida tillägg
- [ ] **PDF-generering** - Generera PDF-anbud direkt från applikationen
- [ ] **CRM-integration** - Anslut till befintliga kundhanteringssystem
- [ ] **Admin-panel** - Webbgränssnitt för att ändra priser utan kodändringar
- [ ] **Prishistorik** - Spåra prisförändringar över tid
- [ ] **Analytics dashboard** - Detaljerad statistik över förfrågningar
- [ ] **E-postsignering** - Digitala signaturer för anbud
- [ ] **Kalenderbookning** - Integrera möjlighet att boka besiktning
- [ ] **Multilingual support** - Stöd för flera språk

---

**Sternbecks Måleri & Fönsterhantverk**  
*Kvalitet och hantverkstradition sedan 2015*