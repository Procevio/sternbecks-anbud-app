# 💰 Sternbecks Måleri - Prislista och Beräkningsguide

**Uppdaterad:** 2025-08-22  
**Version:** Aktuell prislista med alla beräkningsregler  

---

## 📋 GRUNDPRISER (Exklusive moms)

### 🏠 Fönster och Dörrar

| **Typ** | **Pris per st** | **Beskrivning** |
|---------|-----------------|-----------------|
| **Dörrpartier** | 6 000 kr | Renovering av dörrparti |
| **Källare/Glugg** | 3 000 kr | Källarfönster och gluggar |
| **1 luftare** | 3 500 kr | Fönster med 1 luftare |
| **2 luftare** | 5 000 kr | Fönster med 2 luftare |
| **3 luftare** | 6 500 kr | Fönster med 3 luftare |
| **4 luftare** | 8 000 kr | Fönster med 4 luftare |
| **5 luftare** | 9 000 kr | Fönster med 5 luftare |
| **6 luftare** | 11 000 kr | Fönster med 6 luftare |

---

## 🎨 RENOVERINGSTYP-PÅLÄGG

| **Typ** | **Pålägg** | **Beskrivning** |
|---------|------------|-----------------|
| **Modern - Alcro bestå** | +0% | Standardpris (baslinje) |
| **Traditionell - Linoljebehandling** | +15% | Premium behandling |

---

## 🪟 FÖNSTERTYP-PÅLÄGG

| **Typ** | **Pålägg/Kostnad** | **Beräkning** |
|---------|-------------------|---------------|
| **Kopplade standard** | +0% | Standardpris |
| **Isolerglas** | +400 kr per fönster | Fast kostnad |
| **Kopplade isolerglas** | Separat fält | Anges separat |
| **Insatsbågar yttre** | Separat fält | Anges separat |
| **Insatsbågar inre** | Separat fält | Anges separat |
| **Insatsbågar komplett** | Separat fält | Anges separat |
| **Inåtgående** | -5% | Rabatt på grundpris |
| **Utåtgående** | +0% | Standardpris |

---

## 🏢 ARBETSBESKRIVNING-PÅLÄGG

| **Typ** | **Pålägg** | **Beskrivning** |
|---------|------------|-----------------|
| **Utvändig renovering** | +0% | Standardarbete (100%) |
| **Invändig renovering** | +25% | Extra komplexitet |
| **Utvändig + innerbågens insida** | +5% | Utökat arbete |

---

## 🖼️ SPRÖJS-PRISER (Exklusive moms)

| **Antal spröjs** | **Pris per ruta** | **Kategori** |
|------------------|-------------------|--------------|
| **1-3 spröjs** | 250 kr | Låg komplexitet |
| **4+ spröjs** | 400 kr | Hög komplexitet |

### Spröjs-beräkning:
```
Spröjs-kostnad = Pris per ruta × Antal spröjs × Antal luftare per fönster × Antal fönster MED spröjs
```

**Exempel:**
- 3 spröjs på 2st av 4st 3-luftare
- Beräkning: 250 kr × 3 spröjs × 3 luftare × 2 fönster = **4 500 kr**

---

## 💎 EXTRA TILLÄGG

| **Typ** | **Kostnad** | **Enhet** |
|---------|-------------|-----------|
| **LE-glas** | 2 500 kr | per kvm |
| **Extra timmar** | 700 kr | per timme |

---

## 📊 BERÄKNINGSPROCESS - Steg för steg

### **STEG 1: Grundpris**
Summera alla enheter:
```
Grundpris = (Antal dörrpartier × 6000) + 
           (Antal källare/glugg × 3000) + 
           (Antal 1-luftare × 3500) + 
           (Antal 2-luftare × 5000) + 
           ... osv för alla luftare-typer
```

### **STEG 2: Renoveringstyp-pålägg**
```
Renoveringspålägg = Grundpris × Renoveringstyp-multiplikator
Exempel: Traditionell linoljebehandling = Grundpris × 1.15 (15% pålägg)
```

### **STEG 3: Fönstertyp-pålägg**
```
Fönstertyp-kostnad = Grundpris × Fönstertyp-multiplikator + Fasta kostnader
Exempel: Isolerglas = (Grundpris × 1.0) + (400kr × Antal fönster)
```

### **STEG 4: Spröjs och LE-glas**
```
Spröjs: 250kr/400kr × Antal spröjs × Luftare per fönster × Fönster med spröjs
LE-glas: 2500kr × Antal kvm
```

### **STEG 5: Prisjusteringar**
```
Subtotal = Grundpris + Renoveringspålägg + Fönsterpålägg + Extras + Extra timmar
```

### **STEG 6: Materialkostnad**
```
Materialkostnad = Subtotal × Materialprocent (standard 10%)
Subtotal efter material = Subtotal + Materialkostnad
```

### **STEG 7: Arbetsbeskrivning-pålägg**
```
Arbetspålägg = (Subtotal - Prisjusteringar - Material) × (Arbetsmultiplikator - 1)
```

### **STEG 8: Moms**
```
Summa exkl. moms = Alla ovanstående steg
Moms (25%) = Summa exkl. moms × 0.25
Totalt inkl. moms = Summa exkl. moms + Moms
```

### **STEG 9: ROT-avdrag (om tillämpligt)**
```
Materialkostnadsavdrag = Totalt inkl. moms × Materialprocent / 100
Arbetskostnad = Totalt inkl. moms - Materialkostnadsavdrag
ROT-avdrag = Arbetskostnad × 0.5 (50%)
Kunden betalar = Totalt inkl. moms - ROT-avdrag
```

---

## 🧮 BERÄKNINGSEXEMPEL

### **Exempel 1: Grundläggande renovering**

**Input:**
- 1 dörrparti
- 2 källare/glugg  
- 1 3-luftare
- Modern - Alcro bestå
- Kopplade standard
- Utvändig renovering
- 10% materialkostnad

**Beräkning:**
```
Grundpris:        6000 + 6000 + 6500 = 18 500 kr
Renoveringspålägg: 18500 × 1.0 = 0 kr (ingen pålägg)
Fönsterpålägg:    18500 × 1.0 = 0 kr (ingen pålägg)
Extras:           0 kr (inga spröjs/LE-glas)
Subtotal:         18 500 kr
Material:         18500 × 0.1 = 1 850 kr
Arbetspålägg:     (20350 - 0 - 1850) × (1.0 - 1) = 0 kr
Summa exkl. moms: 20 350 kr
Moms (25%):       20350 × 0.25 = 5 088 kr
Totalt inkl. moms: 25 438 kr
```

### **Exempel 2: Komplex renovering med spröjs**

**Input:**
- 1 dörrparti
- 4st 3-luftare
- Traditionell - Linoljebehandling
- Isolerglas (4 fönster)
- 3 spröjs på 2 fönster
- Invändig renovering
- 10% materialkostnad

**Beräkning:**
```
Grundpris:        6000 + (4 × 6500) = 32 000 kr
Renoveringspålägg: 32000 × 0.15 = 4 800 kr
Fönsterpålägg:    (4 × 400kr isolerglas) = 1 600 kr
Spröjs:           250 × 3 × 3 × 2 = 4 500 kr
Subtotal:         42 900 kr
Material:         42900 × 0.1 = 4 290 kr
Arbetspålägg:     (47190 - 0 - 4290) × (1.25 - 1) = 10 725 kr
Summa exkl. moms: 57 915 kr
Moms (25%):       57915 × 0.25 = 14 479 kr
Totalt inkl. moms: 72 394 kr
```

---

## ⚖️ ROT-AVDRAG - Regler och beräkning

### **Förutsättningar:**
1. **Fastighet måste vara ROT-berättigad:**
   - Ja - Villa/Radhus/Bostadsrätt
   - Nej - Hyresrätt/Kommersiell fastighet

2. **Kund måste vara berättigad:**
   - Ja - inkludera ROT-avdrag i anbudet
   - Nej - visa fullpris utan avdrag

### **ROT-beräkning:**
```
1. Materialkostnadsavdrag = Totalpris × (Materialprocent / 100)
2. Arbetskostnad = Totalpris - Materialkostnadsavdrag  
3. ROT-avdrag = Arbetskostnad × 50%
4. Slutpris = Totalpris - ROT-avdrag
```

**Exempel:**
- Totalt inkl. moms: 25 000 kr
- Material (10%): 2 500 kr avdrag
- Arbetskostnad: 22 500 kr
- ROT-avdrag (50%): 11 250 kr
- **Kund betalar: 13 750 kr**

---

## 💡 VIKTIGA BERÄKNINGSREGLER

### **Spröjs-specifika regler:**
- Beräknas endast på fönster som FAKTISKT har spröjs
- Använder genomsnittligt antal luftare per fönster
- Prissättning baserad på total komplexitet (1-3 vs 4+ spröjs)

### **Materialkostnad:**
- Standardvärde: 10% om inget anges
- Räknas på hela subtotalen före arbetsbeskrivning-pålägg
- Påverkar ROT-beräkning (dras av från arbetskostnad)

### **Arbetsbeskrivning-pålägg:**
- Räknas endast på grundpris + renoveringspålägg + fönsterpålägg
- INTE på materialkostnad eller prisjusteringar

### **Prisformat:**
- Alla priser visas i svenska kronor
- Format: "6 000 kr" (mellanslag som tusentalsavskiljare)
- Exklusive moms anges tydligt där det gäller

---

## 🎯 SAMMANFATTNING

Sternbecks prismodell bygger på:
1. **Transparent grundprissättning** per enhet
2. **Rättvisa pålägg** baserat på komplexitet
3. **Flexibla tillägg** för specialarbeten
4. **Korrekt ROT-hantering** enligt gällande regler
5. **Tydlig presentation** av alla kostnadsposter

Denna struktur säkerställer att kunder får en rättvis och transparent prissättning baserat på projektets faktiska omfattning och komplexitet.

---

**Kontakt för prisförfrågningar:**  
📧 info@sternbecks.se  
🌐 www.sternbecks.se