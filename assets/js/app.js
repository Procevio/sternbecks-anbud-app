// Lösenordsskydd konfiguration
const PASSWORD_CONFIG = {
    CORRECT_PASSWORD: 'sternbecks2025'
};

// Konfiguration för applikationen
const CONFIG = {
    BASE_PRICE: 0, // Grundpris baserat på komponenter, inte fast summa
    HOURLY_RATE: 700, // Pris per extra timme
    
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
    
    // Fönstertyp-påslag
    WINDOW_TYPE_MULTIPLIERS: {
        'Traditionell - Linoljebehandling': 1.15,  // +15%
        'Modern - Alcro bestå': 1.0,               // Ingen tilläggsavgift
        'Kopplade standard': 1.0,                  // Standardpris
        'Isolerglas': 'per_window_400',            // +400kr per fönster
        'Insatsbågar': 'per_window_300',           // +300kr per fönster
        'Inåtgående -5%': 0.95,                    // -5%
        'Utåtgående standard': 1.0                 // Standardpris
    },
    
    // Renoveringstyp-påslag
    RENOVATION_TYPE_MULTIPLIERS: {
        'Utvändig renovering': 1.0,                // 100% av totalsumman
        'Invändig renovering': 1.25,               // +25%
        'Utvändig renovering samt målning av innerbägens insida': 1.05, // +5%
        'Övrigt': 0                                // Endast extra timmar
    },
    
    // Tillägg
    EXTRAS: {
        SPROJS_PER_RUTA: 300,       // 300kr per ruta
        E_GLASS_PER_SQM: 2500,      // 2500kr/kvm
        VAT_RATE: 0.25,             // 25% moms
        ROT_DEDUCTION: 0.5          // 50% ROT-avdrag
    },
    GOOGLE_FORMS_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSeWgToYq-djzYjwlx51cg6NG8hk9hhK2ryusZCJxE3FSMeDlw/formResponse', // Din Google Forms URL
    // Mapping mellan formulärfält och Google Forms entry IDs - uppdaterade med riktiga värden
    FORM_FIELDS: {
        'company': 'entry.840064910',           // Kundnamn
        'contact-person': 'entry.840064910',    // Använder samma som kundnamn (kan justeras om separata fält finns)
        'email': 'entry.34850442',             // E-post
        'phone': 'entry.1576794399',           // Telefonnummer
        'address': 'entry.451691303',          // Adress
        'postal-code': 'entry.183003918',      // Postnummer
        'city': 'entry.1773944220',            // Ort
        'property-inspection': 'entry.1947831774', // Fastighetsbeteckning (används för besiktning)
        'typ-av-renovering': 'entry.1001679891',   // Typ av renovering
        'typ-av-fonster': 'entry.1431165045',      // Typ av fönster
        'arbetsbeskrivning': 'entry.375552021',    // Arbetsbeskrivning
        'extra-hours': 'entry.280137558',          // Arbetsbeskrivning övrigt (extra timmar)
        'materialkostnad': 'entry.1087712385',     // Materialkostnad
        'window-sections': 'entry.1428207307',     // Antal fönsterpartier
        'antal-dorrpartier': 'entry.15247411',     // Antal dörrpartier
        'antal-1-luftare': 'entry.1346898155',     // Antal 1 luftare
        'antal-2-luftare': 'entry.994599656',      // Antal 2 luftare
        'antal-3-luftare': 'entry.882686399',      // Antal 3 luftare
        'antal-4-luftare': 'entry.421567894',      // Antal 4 luftare
        'antal-5-luftare': 'entry.15154510',       // Antal 5 luftare
        'antal-6-luftare': 'entry.904743569',      // Antal 6 luftare
        'sprojs': 'entry.105600632',               // Spröjs
        'antal-sprojs-per-bage': 'entry.1553251704', // Antal spröjs per båge
        'byte-till-le-glas': 'entry.1641252616',   // Byte till LE-glas
        'le-kvm': 'entry.1217325448',              // LE-glas kvm
        'rot-avdrag': 'entry.1617253565'           // ROT-avdrag berättigad
    }
};

class QuoteCalculator {
    constructor() {
        this.form = document.getElementById('quote-form');
        
        // Alla priselement
        this.baseComponentsPriceElement = document.getElementById('base-components-price');
        this.windowTypeCostElement = document.getElementById('window-type-cost');
        this.extrasCostElement = document.getElementById('extras-cost');
        this.renovationMarkupElement = document.getElementById('renovation-markup');
        this.extraHoursCostElement = document.getElementById('extra-hours-cost');
        this.materialCostDisplayElement = document.getElementById('material-cost-display');
        this.subtotalPriceElement = document.getElementById('subtotal-price');
        this.vatCostElement = document.getElementById('vat-cost');
        this.totalWithVatElement = document.getElementById('total-with-vat');
        this.rotDeductionElement = document.getElementById('rot-deduction');
        this.rotRowElement = document.getElementById('rot-row');
        this.finalCustomerPriceElement = document.getElementById('final-customer-price');
        this.extraHoursDisplayElement = document.getElementById('extra-hours-display');
        
        // Input elements
        this.extraHoursInput = document.getElementById('extra-hours');
        
        // Form controls
        this.submitBtn = document.getElementById('submit-btn');
        this.successMessage = document.getElementById('success-message');
        this.errorMessage = document.getElementById('error-message');
        
        this.initializeEventListeners();
        this.updatePriceCalculation();
    }
    
    initializeEventListeners() {
        // Lyssna på alla ändringar som påverkar prissättning
        const priceAffectingFields = [
            'extra-hours', 'materialkostnad', 'window-sections', 'antal-dorrpartier',
            'antal-1-luftare', 'antal-2-luftare', 'antal-3-luftare', 
            'antal-4-luftare', 'antal-5-luftare', 'antal-6-luftare',
            'antal-sprojs-per-bage', 'le-kvm'
        ];
        
        priceAffectingFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.updatePriceCalculation();
                });
            }
        });
        
        // Lyssna på ändringar i checkboxes och select
        const priceAffectingControls = [
            'typ-av-renovering', 'typ-av-fonster', 'sprojs', 'byte-till-le-glas', 'rot-avdrag'
        ];
        
        priceAffectingControls.forEach(name => {
            const fields = this.form.querySelectorAll(`[name="${name}"]`);
            fields.forEach(field => {
                if (field.type === 'radio' || field.type === 'checkbox') {
                    field.addEventListener('change', () => {
                        this.updatePriceCalculation();
                        this.clearFieldError(field);
                    });
                } else {
                    field.addEventListener('change', () => {
                        this.updatePriceCalculation();
                    });
                }
            });
        });
        
        // Lyssna på formulär submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });
        
        // Realtidsvalidering för alla inputfält
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }
    
    updatePriceCalculation() {
        // Samla in alla värden
        const data = this.collectPricingData();
        
        // Beräkna grundkomponenter (luftare + dörrar)
        const baseComponentsPrice = this.calculateBaseComponents(data);
        
        // Beräkna fönstertyp-tillägg
        const windowTypeCost = this.calculateWindowTypeCost(data, baseComponentsPrice);
        
        // Beräkna spröjs och E-glas
        const extrasCost = this.calculateExtrasCost(data);
        
        // Beräkna extra timmar
        const extraHoursCost = data.extraHours * CONFIG.HOURLY_RATE;
        
        // Materialkostnad
        const materialCost = data.materialCost;
        
        // Summa innan renoveringstyp-pålägg
        const subtotalBeforeRenovation = baseComponentsPrice + windowTypeCost + extrasCost + extraHoursCost + materialCost;
        
        // Beräkna renoveringstyp-pålägg
        const renovationMarkup = this.calculateRenovationMarkup(data, subtotalBeforeRenovation, extraHoursCost, materialCost);
        
        // Total summa exklusive moms
        const subtotalExclVat = subtotalBeforeRenovation + renovationMarkup;
        
        // Moms
        const vatCost = subtotalExclVat * CONFIG.EXTRAS.VAT_RATE;
        
        // Total inklusive moms
        const totalInclVat = subtotalExclVat + vatCost;
        
        // ROT-avdrag (endast på arbetskostnad, inte material)
        const workCost = subtotalExclVat - materialCost;
        const rotDeduction = data.hasRotDeduction ? workCost * CONFIG.EXTRAS.ROT_DEDUCTION : 0;
        
        // Slutligt kundpris
        const finalCustomerPrice = totalInclVat - rotDeduction;
        
        // Uppdatera alla priselement
        this.updatePriceDisplay({
            baseComponentsPrice,
            windowTypeCost,
            extrasCost,
            renovationMarkup,
            extraHoursCost,
            materialCost,
            subtotalExclVat,
            vatCost,
            totalInclVat,
            rotDeduction,
            finalCustomerPrice,
            extraHours: data.extraHours,
            hasRotDeduction: data.hasRotDeduction
        });
    }
    
    collectPricingData() {
        return {
            // Antal enheter
            doorSections: parseInt(document.getElementById('antal-dorrpartier')?.value) || 0,
            luftare1: parseInt(document.getElementById('antal-1-luftare')?.value) || 0,
            luftare2: parseInt(document.getElementById('antal-2-luftare')?.value) || 0,
            luftare3: parseInt(document.getElementById('antal-3-luftare')?.value) || 0,
            luftare4: parseInt(document.getElementById('antal-4-luftare')?.value) || 0,
            luftare5: parseInt(document.getElementById('antal-5-luftare')?.value) || 0,
            luftare6: parseInt(document.getElementById('antal-6-luftare')?.value) || 0,
            
            // Totalt antal fönster (för vissa beräkningar)
            totalWindows: parseInt(document.getElementById('window-sections')?.value) || 0,
            
            // Renoveringstyp
            renovationType: this.form.querySelector('input[name="typ-av-renovering"]:checked')?.value || '',
            
            // Fönstertyp
            windowType: document.getElementById('typ-av-fonster')?.value || '',
            
            // Extra timmar och material
            extraHours: parseInt(document.getElementById('extra-hours')?.value) || 0,
            materialCost: parseInt(document.getElementById('materialkostnad')?.value) || 0,
            
            // Spröjs
            hasSprojs: document.getElementById('sprojs')?.checked || false,
            sprojsPerWindow: parseInt(document.getElementById('antal-sprojs-per-bage')?.value) || 0,
            
            // E-glas
            hasEGlass: document.getElementById('byte-till-le-glas')?.checked || false,
            eGlassSqm: parseFloat(document.getElementById('le-kvm')?.value) || 0,
            
            // ROT-avdrag
            hasRotDeduction: document.getElementById('rot-avdrag')?.checked || false
        };
    }
    
    calculateBaseComponents(data) {
        let total = 0;
        
        // Dörrpartier
        total += data.doorSections * CONFIG.UNIT_PRICES['antal-dorrpartier'];
        
        // Luftare
        total += data.luftare1 * CONFIG.UNIT_PRICES['antal-1-luftare'];
        total += data.luftare2 * CONFIG.UNIT_PRICES['antal-2-luftare'];
        total += data.luftare3 * CONFIG.UNIT_PRICES['antal-3-luftare'];
        total += data.luftare4 * CONFIG.UNIT_PRICES['antal-4-luftare'];
        total += data.luftare5 * CONFIG.UNIT_PRICES['antal-5-luftare'];
        total += data.luftare6 * CONFIG.UNIT_PRICES['antal-6-luftare'];
        
        return total;
    }
    
    calculateWindowTypeCost(data, basePrice) {
        if (!data.windowType) return 0;
        
        const multiplier = CONFIG.WINDOW_TYPE_MULTIPLIERS[data.windowType];
        
        if (typeof multiplier === 'number') {
            // Procentuell ökning/minskning
            return basePrice * (multiplier - 1);
        } else if (multiplier === 'per_window_400') {
            // Fast kostnad per fönster
            return data.totalWindows * 400;
        } else if (multiplier === 'per_window_300') {
            // Fast kostnad per fönster
            return data.totalWindows * 300;
        }
        
        return 0;
    }
    
    calculateExtrasCost(data) {
        let total = 0;
        
        // Spröjs: 300kr per ruta × antal spröjs × antal fönster
        if (data.hasSprojs && data.sprojsPerWindow > 0) {
            total += CONFIG.EXTRAS.SPROJS_PER_RUTA * data.sprojsPerWindow * data.totalWindows;
        }
        
        // E-glas: 2500kr/kvm
        if (data.hasEGlass && data.eGlassSqm > 0) {
            total += CONFIG.EXTRAS.E_GLASS_PER_SQM * data.eGlassSqm;
        }
        
        return total;
    }
    
    calculateRenovationMarkup(data, subtotal, extraHoursCost, materialCost) {
        if (!data.renovationType) return 0;
        
        const multiplier = CONFIG.RENOVATION_TYPE_MULTIPLIERS[data.renovationType];
        
        if (data.renovationType === 'Övrigt') {
            // För "Övrigt" beräknas endast extra timmar, ingen pålägg på andra kostnader
            return 0;
        }
        
        // Pålägg på allt utom extra timmar och material för andra renoveringstyper
        const baseForMarkup = subtotal - extraHoursCost - materialCost;
        return baseForMarkup * (multiplier - 1);
    }
    
    updatePriceDisplay(prices) {
        // Uppdatera alla priselement
        this.baseComponentsPriceElement.textContent = this.formatPrice(prices.baseComponentsPrice);
        this.windowTypeCostElement.textContent = this.formatPrice(prices.windowTypeCost);
        this.extrasCostElement.textContent = this.formatPrice(prices.extrasCost);
        this.renovationMarkupElement.textContent = this.formatPrice(prices.renovationMarkup);
        this.extraHoursCostElement.textContent = this.formatPrice(prices.extraHoursCost);
        this.materialCostDisplayElement.textContent = this.formatPrice(prices.materialCost);
        this.subtotalPriceElement.innerHTML = `<strong>${this.formatPrice(prices.subtotalExclVat)}</strong>`;
        this.vatCostElement.textContent = this.formatPrice(prices.vatCost);
        this.totalWithVatElement.innerHTML = `<strong>${this.formatPrice(prices.totalInclVat)}</strong>`;
        this.finalCustomerPriceElement.innerHTML = `<strong>${this.formatPrice(prices.finalCustomerPrice)}</strong>`;
        this.extraHoursDisplayElement.textContent = prices.extraHours;
        
        // ROT-avdrag - visa/dölj beroende på om det är valt
        if (prices.hasRotDeduction && prices.rotDeduction > 0) {
            this.rotRowElement.style.display = 'block';
            this.rotDeductionElement.textContent = `-${this.formatPrice(prices.rotDeduction)}`;
        } else {
            this.rotRowElement.style.display = 'none';
        }
    }
    
    formatPrice(amount) {
        return new Intl.NumberFormat('sv-SE', {
            style: 'currency',
            currency: 'SEK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('SEK', 'kr');
    }
    
    validateField(field) {
        const fieldGroup = field.closest('.form-group');
        const errorElement = fieldGroup.querySelector('.error-message');
        let isValid = true;
        let errorMessage = '';
        
        // Kontrollera obligatoriska fält
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Detta fält är obligatoriskt';
        }
        
        // Specifik validering baserat på fälttyp
        if (field.value.trim()) {
            switch (field.type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value)) {
                        isValid = false;
                        errorMessage = 'Ange en giltig e-postadress';
                    }
                    break;
                    
                case 'tel':
                    const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
                    if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
                        isValid = false;
                        errorMessage = 'Ange ett giltigt telefonnummer';
                    }
                    break;
                    
                default:
                    if (field.name === 'postal-code') {
                        const postalRegex = /^[0-9]{5}$/;
                        if (!postalRegex.test(field.value)) {
                            isValid = false;
                            errorMessage = 'Ange ett giltigt postnummer (5 siffror)';
                        }
                    }
                    break;
            }
        }
        
        // Validera radio buttons separat
        if (field.type === 'radio' && field.hasAttribute('required')) {
            const radioGroup = this.form.querySelectorAll(`input[name="${field.name}"]`);
            const isRadioSelected = Array.from(radioGroup).some(radio => radio.checked);
            if (!isRadioSelected) {
                isValid = false;
                errorMessage = 'Vänligen välj ett alternativ';
            }
        }
        
        // Visa eller dölj felmeddelande
        if (!isValid) {
            fieldGroup.classList.add('error');
            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.classList.add('show');
            }
        } else {
            fieldGroup.classList.remove('error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
            }
        }
        
        return isValid;
    }
    
    clearFieldError(field) {
        const fieldGroup = field.closest('.form-group') || field.closest('.radio-group')?.closest('.form-group');
        const errorElement = fieldGroup?.querySelector('.error-message');
        
        if (fieldGroup) {
            fieldGroup.classList.remove('error');
        }
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }
    
    validateForm() {
        let isFormValid = true;
        
        // Validera alla obligatoriska textfält
        const requiredFields = this.form.querySelectorAll('input[required], textarea[required]');
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });
        
        // Validera radio buttons
        const renovationTypeRadios = this.form.querySelectorAll('input[name="typ-av-renovering"]');
        const isRenovationTypeSelected = Array.from(renovationTypeRadios).some(radio => radio.checked);
        if (!isRenovationTypeSelected) {
            isFormValid = false;
            const renovationTypeGroup = renovationTypeRadios[0].closest('.form-group');
            const errorElement = renovationTypeGroup.querySelector('.error-message');
            renovationTypeGroup.classList.add('error');
            if (errorElement) {
                errorElement.textContent = 'Vänligen välj typ av renovering';
                errorElement.classList.add('show');
            }
        }
        
        return isFormValid;
    }
    
    async handleFormSubmission() {
        // Validera formuläret
        if (!this.validateForm()) {
            this.scrollToFirstError();
            return;
        }
        
        // Visa loading state
        this.setSubmitButtonLoading(true);
        this.hideMessages();
        
        try {
            // Samla in formulärdata
            const formData = this.collectFormData();
            
            // Skicka till Google Forms
            await this.submitToGoogleForms(formData);
            
            // Visa framgångsmeddelande
            this.showSuccessMessage();
            this.resetForm();
            
        } catch (error) {
            console.error('Fel vid skickning av formulär:', error);
            this.showErrorMessage();
        } finally {
            this.setSubmitButtonLoading(false);
        }
    }
    
    collectFormData() {
        const formData = new FormData();
        
        // Samla in alla formulärfält
        Object.keys(CONFIG.FORM_FIELDS).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            let value = '';
            
            if (field) {
                if (field.type === 'checkbox') {
                    value = field.checked ? 'Ja' : 'Nej';
                } else if (field.type === 'radio') {
                    const selectedRadio = this.form.querySelector(`input[name="${fieldName}"]:checked`);
                    value = selectedRadio ? selectedRadio.value : '';
                } else {
                    value = field.value;
                }
                
                formData.append(CONFIG.FORM_FIELDS[fieldName], value);
            }
        });
        
        // Lägg till detaljerad prisberäkning
        const data = this.collectPricingData();
        const baseComponentsPrice = this.calculateBaseComponents(data);
        const windowTypeCost = this.calculateWindowTypeCost(data, baseComponentsPrice);
        const extrasCost = this.calculateExtrasCost(data);
        const extraHoursCost = data.extraHours * CONFIG.HOURLY_RATE;
        const materialCost = data.materialCost;
        const subtotalBeforeRenovation = baseComponentsPrice + windowTypeCost + extrasCost + extraHoursCost + materialCost;
        const renovationMarkup = this.calculateRenovationMarkup(data, subtotalBeforeRenovation, extraHoursCost, materialCost);
        const subtotalExclVat = subtotalBeforeRenovation + renovationMarkup;
        const vatCost = subtotalExclVat * CONFIG.EXTRAS.VAT_RATE;
        const totalInclVat = subtotalExclVat + vatCost;
        const workCost = subtotalExclVat - materialCost;
        const rotDeduction = data.hasRotDeduction ? workCost * CONFIG.EXTRAS.ROT_DEDUCTION : 0;
        const finalCustomerPrice = totalInclVat - rotDeduction;
        
        // Skapa detaljerad prissammanfattning för Google Forms
        const priceBreakdown = `
PRISBERÄKNING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Grundkomponenter:
- Luftare och dörrar: ${this.formatPrice(baseComponentsPrice)}
- Fönstertyp-tillägg: ${this.formatPrice(windowTypeCost)}
- Spröjs/E-glas: ${this.formatPrice(extrasCost)}
- Renoveringstyp-pålägg: ${this.formatPrice(renovationMarkup)}
- Extra timmar (${data.extraHours}h × 700kr): ${this.formatPrice(extraHoursCost)}
- Material: ${this.formatPrice(materialCost)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summa exkl. moms: ${this.formatPrice(subtotalExclVat)}
Moms (25%): ${this.formatPrice(vatCost)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Totalt inkl. moms: ${this.formatPrice(totalInclVat)}
${data.hasRotDeduction ? `ROT-avdrag (50%): -${this.formatPrice(rotDeduction)}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KUNDEN BETALAR: ${this.formatPrice(finalCustomerPrice)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        
        formData.append('entry.calculated_price', priceBreakdown);
        
        return formData;
    }
    
    async submitToGoogleForms(formData) {
        // Kontrollera att Google Forms URL är konfigurerad
        if (!CONFIG.GOOGLE_FORMS_URL || CONFIG.GOOGLE_FORMS_URL.includes('YOUR_FORM_ID_HERE')) {
            throw new Error('Google Forms URL är inte konfigurerad');
        }
        
        const response = await fetch(CONFIG.GOOGLE_FORMS_URL, {
            method: 'POST',
            mode: 'no-cors', // Google Forms kräver no-cors mode
            body: formData
        });
        
        // Med no-cors mode kan vi inte kontrollera response status,
        // så vi antar att det gick bra om inget error kastades
        return true;
    }
    
    setSubmitButtonLoading(loading) {
        if (loading) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
        } else {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }
    
    showSuccessMessage() {
        this.successMessage.style.display = 'block';
        this.form.style.display = 'none';
        this.successMessage.scrollIntoView({ behavior: 'smooth' });
    }
    
    showErrorMessage() {
        this.errorMessage.style.display = 'block';
        this.errorMessage.scrollIntoView({ behavior: 'smooth' });
    }
    
    hideMessages() {
        this.successMessage.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }
    
    resetForm() {
        this.form.reset();
        this.updatePriceCalculation();
        
        // Rensa alla felmeddelanden
        const errorElements = this.form.querySelectorAll('.error-message');
        const errorGroups = this.form.querySelectorAll('.form-group.error');
        
        errorElements.forEach(el => {
            el.textContent = '';
            el.classList.remove('show');
        });
        
        errorGroups.forEach(group => {
            group.classList.remove('error');
        });
    }
    
    scrollToFirstError() {
        const firstError = this.form.querySelector('.form-group.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Lösenordsskydd klass
class PasswordProtection {
    constructor() {
        this.passwordOverlay = document.getElementById('password-overlay');
        this.passwordForm = document.getElementById('password-form');
        this.passwordInput = document.getElementById('password-input');
        this.passwordError = document.getElementById('password-error');
        this.mainApp = document.getElementById('main-app');
        
        this.initializePasswordProtection();
    }
    
    initializePasswordProtection() {
        // Lyssna på formulärinlämning
        this.passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validatePassword();
        });
        
        // Lyssna på Enter-tangent i lösenordsfältet
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.validatePassword();
            }
        });
        
        // Fokusera på lösenordsfältet när sidan laddas
        setTimeout(() => {
            this.passwordInput.focus();
        }, 500);
    }
    
    validatePassword() {
        const enteredPassword = this.passwordInput.value;
        
        if (enteredPassword === PASSWORD_CONFIG.CORRECT_PASSWORD) {
            this.grantAccess();
        } else {
            this.showError();
        }
    }
    
    grantAccess() {
        // Dölj lösenordsskärm med animering
        this.passwordOverlay.style.animation = 'fadeOut 0.5s ease-out';
        
        setTimeout(() => {
            this.passwordOverlay.style.display = 'none';
            this.mainApp.style.display = 'block';
            this.mainApp.style.animation = 'fadeIn 0.5s ease-out';
            
            // Initialisera huvudapplikationen efter framgångsrik inloggning
            this.initializeMainApplication();
        }, 500);
    }
    
    showError() {
        // Visa felmeddelande
        this.passwordError.style.display = 'block';
        this.passwordInput.value = '';
        this.passwordInput.focus();
        
        // Dölj felmeddelandet efter 3 sekunder
        setTimeout(() => {
            this.passwordError.style.display = 'none';
        }, 3000);
        
        // Stäng sidan efter 5 sekunder om fel lösenord
        setTimeout(() => {
            window.close();
            // Om window.close() inte fungerar (t.ex. på grund av säkerhetsrestriktioner)
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #2c2c2c 0%, #404040 100%);
                    color: white;
                    font-family: Inter, sans-serif;
                    text-align: center;
                    padding: 2rem;
                ">
                    <div>
                        <h1 style="margin-bottom: 1rem;">Åtkomst nekad</h1>
                        <p>Kontakta Sternbecks Måleri & Fönsterhantverk för behörighet.</p>
                        <p style="margin-top: 2rem; opacity: 0.7;">Denna sida stängs automatiskt.</p>
                    </div>
                </div>
            `;
            
            // Försök stänga efter ytterligare 2 sekunder
            setTimeout(() => {
                window.close();
            }, 2000);
        }, 5000);
    }
    
    initializeMainApplication() {
        // Kontrollera att alla nödvändiga element finns
        const requiredElements = [
            'quote-form',
            'extra-hours',
            'base-components-price',
            'window-type-cost',
            'extras-cost',
            'submit-btn'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.error('Saknade element:', missingElements);
            return;
        }
        
        // Initialisera huvudklasser
        new QuoteCalculator();
        new AccessibilityEnhancer();
        
        console.log('Sternbecks Anbudsapplikation initialiserad framgångsrikt efter lösenordsvalidering!');
    }
}

// Utility functions för tillgänglighet och användbarhet
class AccessibilityEnhancer {
    constructor() {
        this.addKeyboardNavigation();
        this.addAriaLabels();
    }
    
    addKeyboardNavigation() {
        // Lägg till keyboard navigation för radio buttons och checkboxes
        const customInputs = document.querySelectorAll('.radio-label, .checkbox-label');
        
        customInputs.forEach(label => {
            label.setAttribute('tabindex', '0');
            
            label.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const input = label.querySelector('input');
                    if (input) {
                        input.checked = !input.checked;
                        input.dispatchEvent(new Event('change'));
                    }
                }
            });
        });
    }
    
    addAriaLabels() {
        // Lägg till aria-labels för bättre tillgänglighet
        const priceSection = document.querySelector('.price-section');
        if (priceSection) {
            priceSection.setAttribute('aria-label', 'Prisberäkning');
        }
        
        const form = document.getElementById('quote-form');
        if (form) {
            form.setAttribute('aria-label', 'Anbudsförfrågan formulär');
        }
    }
}

// Initialisera applikationen när DOM är redo
document.addEventListener('DOMContentLoaded', () => {
    // Starta med lösenordsskydd
    new PasswordProtection();
    
    // Lägg till smooth scrolling för alla interna länkar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});