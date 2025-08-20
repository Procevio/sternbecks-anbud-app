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
        'antal_dorrpartier': 6000,  // Dörrpartier: 6000kr/st
        'antal_1_luftare': 3500,    // 1 luftare: 3500kr/st
        'antal_2_luftare': 5000,    // 2 luftare: 5000kr/st
        'antal_3_luftare': 6500,    // 3 luftare: 6500kr/st
        'antal_4_luftare': 8000,    // 4 luftare: 8000kr/st
        'antal_5_luftare': 9000,    // 5 luftare: 9000kr/st
        'antal_6_luftare': 11000    // 6 luftare: 11000kr/st
    },
    
    // Renoveringstyp-påslag (Typ av renovering dropdown)
    RENOVATION_TYPE_MULTIPLIERS: {
        'Traditionell - Linoljebehandling': 1.15,  // +15%
        'Modern - Alcro bestå': 1.0                // Standardpris
    },
    
    // Fönstertyp-påslag
    WINDOW_TYPE_MULTIPLIERS: {
        'Kopplade standard': 1.0,                  // Standardpris
        'Isolerglas': 'per_window_400',            // +400kr per fönster
        'Insatsbågar': 'per_window_300',           // +300kr per fönster
        'Inåtgående': 0.95,                       // -5%
        'Utåtgående': 1.0                         // Standardpris
    },
    
    // Arbetsbeskrivning-påslag
    WORK_DESCRIPTION_MULTIPLIERS: {
        'Utvändig renovering': 1.0,                // 100% av totalsumman
        'Invändig renovering': 1.25,               // +25%
        'Utvändig renovering samt målning av innerbågens insida': 1.05 // +5%
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
        'contact_person': 'entry.840064910',    // Använder samma som kundnamn (kan justeras om separata fält finns)
        'email': 'entry.34850442',             // E-post
        'phone': 'entry.1576794399',           // Telefonnummer
        'address': 'entry.451691303',          // Adress
        'postal_code': 'entry.183003918',      // Postnummer
        'city': 'entry.1773944220',            // Ort
        'fastighetsbeteckning': 'entry.1947831774', // Fastighetsbeteckning
        'typ_av_renovering': 'entry.1001679891',   // Typ av renovering (dropdown)
        'arbetsbeskrivning': 'entry.987654321',    // Arbetsbeskrivning (radio buttons)
        'typ_av_fonster': 'entry.1431165045',      // Typ av fönster
        'extra_hours': 'entry.280137558',          // Extra timmar
        'materialkostnad': 'entry.1087712385',     // Materialkostnad (procent)
        'window_sections': 'entry.1428207307',     // Antal fönsterpartier
        'antal_dorrpartier': 'entry.15247411',     // Antal dörrpartier
        'antal_1_luftare': 'entry.1346898155',     // Antal 1 luftare
        'antal_2_luftare': 'entry.994599656',      // Antal 2 luftare
        'antal_3_luftare': 'entry.882686399',      // Antal 3 luftare
        'antal_4_luftare': 'entry.421567894',      // Antal 4 luftare
        'antal_5_luftare': 'entry.15154510',       // Antal 5 luftare
        'antal_6_luftare': 'entry.904743569',      // Antal 6 luftare
        'sprojs': 'entry.105600632',               // Spröjs
        'antal_sprojs_per_bage': 'entry.1553251704', // Antal spröjs per båge
        'byte_till_le_glas': 'entry.1641252616',   // Byte till LE-glas
        'le_kvm': 'entry.1217325448',              // LE-glas kvm
        'fastighet_rot_berättigad': 'entry.1617253565', // Fastighet ROT-berättigad
        'är_du_berättigad_rot_avdrag': 'entry.234567890' // Kund ROT-berättigad (UPPDATERA MED KORREKT ENTRY ID)
    }
};

class QuoteCalculator {
    constructor() {
        console.log('🚀 Initializing QuoteCalculator...');
        this.form = document.getElementById('quote-form');
        console.log('Form element:', this.form);
        
        // Alla priselement
        const priceElements = {
            'base-components-price': this.baseComponentsPriceElement = document.getElementById('base-components-price'),
            'window-type-cost': this.windowTypeCostElement = document.getElementById('window-type-cost'),
            'extras-cost': this.extrasCostElement = document.getElementById('extras-cost'),
            'renovation-markup': this.renovationMarkupElement = document.getElementById('renovation-markup'),
            'extra-hours-cost': this.extraHoursCostElement = document.getElementById('extra-hours-cost'),
            'material-cost-display': this.materialCostDisplayElement = document.getElementById('material-cost-display'),
            'subtotal-price': this.subtotalPriceElement = document.getElementById('subtotal-price'),
            'vat-cost': this.vatCostElement = document.getElementById('vat-cost'),
            'total-with-vat': this.totalWithVatElement = document.getElementById('total-with-vat'),
            'rot-deduction': this.rotDeductionElement = document.getElementById('rot-deduction'),
            'rot-row': this.rotRowElement = document.getElementById('rot-row'),
            'final-customer-price': this.finalCustomerPriceElement = document.getElementById('final-customer-price'),
            'material-deduction': this.materialDeductionElement = document.getElementById('material-deduction'),
            'extra-hours-display': this.extraHoursDisplayElement = document.getElementById('extra-hours-display')
        };
        
        // Kontrollera att alla priselement hittades
        Object.entries(priceElements).forEach(([id, element]) => {
            if (element) {
                console.log(`✓ Found price element: ${id}`, element);
            } else {
                console.error(`❌ Missing price element: ${id}`);
            }
        });
        
        // Input elements för prisjustering
        this.priceAdjustmentPlusInput = document.getElementById('price_adjustment_plus');
        this.priceAdjustmentMinusInput = document.getElementById('price_adjustment_minus');
        
        // Form controls
        this.submitBtn = document.getElementById('submit-btn');
        this.successMessage = document.getElementById('success-message');
        this.errorMessage = document.getElementById('error-message');
        
        // Validation elements
        this.partiesValidation = document.getElementById('parties-validation');
        this.partiesValidationText = document.getElementById('parties-validation-text');
        
        console.log('CONFIG object:', CONFIG);
        
        this.initializeEventListeners();
        this.initializeFastighetsbeteckningAutoFill();
        this.initializeConditionalFields();
        console.log('🔄 Running initial price calculation...');
        this.updatePriceCalculation();
        
        // Test basic functionality
        this.testBasicCalculation();
    }
    
    initializeEventListeners() {
        // Lyssna på alla ändringar som påverkar prissättning
        const priceAffectingFields = [
            'price_adjustment_plus', 'price_adjustment_minus', 'materialkostnad', 'window_sections', 'antal_dorrpartier',
            'antal_1_luftare', 'antal_2_luftare', 'antal_3_luftare', 
            'antal_4_luftare', 'antal_5_luftare', 'antal_6_luftare',
            'antal_sprojs_per_bage', 'le_kvm', 'fastighetsbeteckning'
        ];
        
        priceAffectingFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                console.log(`✓ Found price affecting field: ${fieldId}`, field);
                field.addEventListener('input', () => {
                    console.log(`🔥 Price affecting field INPUT changed: ${fieldId}`, field.value);
                    this.updatePriceCalculation();
                    this.validateParties(); // Validera partier vid ändringar
                });
                field.addEventListener('change', () => {
                    console.log(`🔥 Price affecting field CHANGE changed: ${fieldId}`, field.value);
                    this.updatePriceCalculation();
                    this.validateParties(); // Validera partier vid ändringar
                });
            } else {
                console.error(`❌ Could not find price affecting field: ${fieldId}`);
            }
        });
        
        // Lyssna på ändringar i checkboxes och select
        const priceAffectingControls = [
            'typ_av_renovering', 'arbetsbeskrivning', 'typ_av_fonster', 'sprojs_choice', 'le_glas_choice', 
            'fastighet_rot_berättigad', 'är_du_berättigad_rot_avdrag'
        ];
        
        priceAffectingControls.forEach(name => {
            const fields = this.form.querySelectorAll(`[name="${name}"]`);
            if (fields.length > 0) {
                console.log(`✓ Found ${fields.length} controls for: ${name}`, fields);
            } else {
                console.error(`❌ Could not find controls for: ${name}`);
            }
            
            fields.forEach(field => {
                if (field.type === 'radio' || field.type === 'checkbox') {
                    field.addEventListener('change', () => {
                        console.log(`🔥 Price affecting control CHANGE: ${name}`, field.value, 'checked:', field.checked);
                        this.updatePriceCalculation();
                        this.clearFieldError(field);
                    });
                } else {
                    field.addEventListener('change', () => {
                        console.log(`🔥 Price affecting control CHANGE: ${name}`, field.value);
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
    
    initializeFastighetsbeteckningAutoFill() {
        const fastighetsbeteckningField = document.getElementById('fastighetsbeteckning');
        if (fastighetsbeteckningField) {
            // Auto-fill med "-" när användaren lämnar fältet tomt
            fastighetsbeteckningField.addEventListener('blur', () => {
                if (!fastighetsbeteckningField.value.trim()) {
                    fastighetsbeteckningField.value = '-';
                }
            });
        }
    }
    
    initializeConditionalFields() {
        console.log('🔧 Initializing conditional fields...');
        
        // Hantera Spröjs conditional field
        const sprojsChoiceRadios = this.form.querySelectorAll('input[name="sprojs_choice"]');
        const sprojsAntalGroup = document.getElementById('sprojs-antal-group');
        
        console.log('Sprojs radios found:', sprojsChoiceRadios.length);
        console.log('Sprojs antal group:', sprojsAntalGroup);
        
        sprojsChoiceRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'Ja' && radio.checked) {
                    sprojsAntalGroup.style.display = 'block';
                } else if (radio.value === 'Nej' && radio.checked) {
                    sprojsAntalGroup.style.display = 'none';
                    // Reset värdet när det döljs
                    document.getElementById('antal_sprojs_per_bage').value = '0';
                    this.updatePriceCalculation();
                }
            });
        });
        
        // Hantera LE-glas conditional field
        const leGlasChoiceRadios = this.form.querySelectorAll('input[name="le_glas_choice"]');
        const leGlasKvmGroup = document.getElementById('le-glas-kvm-group');
        
        console.log('LE-glas radios found:', leGlasChoiceRadios.length);
        console.log('LE-glas kvm group:', leGlasKvmGroup);
        
        leGlasChoiceRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'Ja' && radio.checked) {
                    leGlasKvmGroup.style.display = 'block';
                } else if (radio.value === 'Nej' && radio.checked) {
                    leGlasKvmGroup.style.display = 'none';
                    // Reset värdet när det döljs
                    document.getElementById('le_kvm').value = '0';
                    this.updatePriceCalculation();
                }
            });
        });
    }
    
    testBasicCalculation() {
        console.log('🧪 Testing basic calculation...');
        
        // Set a simple test value
        const testData = {
            doorSections: 1,
            luftare1: 1,
            luftare2: 0,
            luftare3: 0,
            luftare4: 0,
            luftare5: 0,
            luftare6: 0,
            totalWindows: 1,
            renovationType: 'Modern - Alcro bestå',
            workDescription: 'Utvändig renovering',
            windowType: 'Kopplade standard',
            priceAdjustmentPlus: 0,
            priceAdjustmentMinus: 0,
            materialPercentage: 10,
            hasSprojs: false,
            sprojsPerWindow: 0,
            hasEGlass: false,
            eGlassSqm: 0,
            propertyRotEligible: 'Nej - Hyresrätt/Kommersiell fastighet',
            customerRotEligible: 'Nej - visa fullpris utan avdrag',
            hasRotDeduction: false
        };
        
        console.log('🧪 Test data:', testData);
        const result = this.calculateBaseComponents(testData);
        console.log('🧪 Test result (should be 9500):', result);
        
        if (result === 9500) {
            console.log('✅ Basic calculation test PASSED');
        } else {
            console.error('❌ Basic calculation test FAILED');
        }
    }
    
    validateParties() {
        const windowSections = parseInt(document.getElementById('window_sections')?.value) || 0;
        const totalLuftare = 
            (parseInt(document.getElementById('antal_1_luftare')?.value) || 0) +
            (parseInt(document.getElementById('antal_2_luftare')?.value) || 0) +
            (parseInt(document.getElementById('antal_3_luftare')?.value) || 0) +
            (parseInt(document.getElementById('antal_4_luftare')?.value) || 0) +
            (parseInt(document.getElementById('antal_5_luftare')?.value) || 0) +
            (parseInt(document.getElementById('antal_6_luftare')?.value) || 0);
        
        console.log('Validating parties:', { windowSections, totalLuftare });
        
        if (windowSections > 0 || totalLuftare > 0) {
            if (windowSections !== totalLuftare) {
                // Visa felmeddelande
                this.partiesValidationText.textContent = 
                    `Totalt antal luftare (${totalLuftare}) matchar inte antal fönsterpartier (${windowSections})`;
                this.partiesValidation.className = 'validation-message error';
                this.partiesValidation.style.display = 'block';
                
                // Blockera submit
                this.submitBtn.disabled = true;
                this.submitBtn.style.opacity = '0.5';
                
                return false;
            } else if (windowSections > 0 && totalLuftare > 0) {
                // Visa framgångsmeddelande
                this.partiesValidationText.textContent = 
                    `✓ Antal luftare (${totalLuftare}) matchar antal fönsterpartier (${windowSections})`;
                this.partiesValidation.className = 'validation-message success';
                this.partiesValidation.style.display = 'block';
                
                // Aktivera submit
                this.submitBtn.disabled = false;
                this.submitBtn.style.opacity = '1';
                
                return true;
            }
        }
        
        // Dölj meddelande om båda är 0 eller tomma
        this.partiesValidation.style.display = 'none';
        this.submitBtn.disabled = false;
        this.submitBtn.style.opacity = '1';
        
        return true;
    }
    
    updatePriceCalculation() {
        console.log('=== STARTING PRICE CALCULATION ===');
        
        // Samla in alla värden
        const data = this.collectPricingData();
        console.log('Collected data:', data);
        
        // Beräkna grundkomponenter (luftare + dörrar)
        const baseComponentsPrice = this.calculateBaseComponents(data);
        console.log('Base components price:', baseComponentsPrice);
        
        // Beräkna renoveringstyp-tillägg (från dropdown)
        const renovationTypeCost = this.calculateRenovationTypeCost(data, baseComponentsPrice);
        console.log('Renovation type cost:', renovationTypeCost);
        
        // Beräkna fönstertyp-tillägg
        const windowTypeCost = this.calculateWindowTypeCost(data, baseComponentsPrice);
        console.log('Window type cost:', windowTypeCost);
        
        // Beräkna spröjs och E-glas
        const extrasCost = this.calculateExtrasCost(data);
        console.log('Extras cost:', extrasCost);
        
        // Beräkna prisjusteringar
        const priceAdjustment = data.priceAdjustmentPlus - data.priceAdjustmentMinus;
        console.log('Price adjustment:', priceAdjustment);
        
        // Beräkna summa innan materialavdrag
        const subtotalBeforeMaterial = baseComponentsPrice + renovationTypeCost + windowTypeCost + extrasCost + priceAdjustment;
        console.log('Subtotal before material:', subtotalBeforeMaterial);
        
        // Materialkostnad som procent av subtotal
        const materialCost = subtotalBeforeMaterial * (data.materialPercentage / 100);
        console.log('Material cost:', materialCost);
        
        // Summa innan arbetsbeskrivning-pålägg
        const subtotalBeforeWork = subtotalBeforeMaterial + materialCost;
        console.log('Subtotal before work:', subtotalBeforeWork);
        
        // Beräkna arbetsbeskrivning-pålägg
        const workDescriptionMarkup = this.calculateWorkDescriptionMarkup(data, subtotalBeforeWork, priceAdjustment, materialCost);
        console.log('Work description markup:', workDescriptionMarkup);
        
        // Total summa exklusive moms
        const subtotalExclVat = subtotalBeforeWork + workDescriptionMarkup;
        console.log('Subtotal excl VAT:', subtotalExclVat);
        
        // Moms
        const vatCost = subtotalExclVat * CONFIG.EXTRAS.VAT_RATE;
        console.log('VAT cost:', vatCost);
        
        // Total inklusive moms
        const totalInclVat = subtotalExclVat + vatCost;
        console.log('Total incl VAT:', totalInclVat);
        
        // ROT-avdrag (endast på arbetskostnad, inte material)
        const workCost = subtotalExclVat - materialCost;
        const rotDeduction = data.hasRotDeduction ? workCost * CONFIG.EXTRAS.ROT_DEDUCTION : 0;
        console.log('Work cost for ROT:', workCost, 'ROT deduction:', rotDeduction);
        
        // Slutligt kundpris
        const finalCustomerPrice = totalInclVat - rotDeduction;
        console.log('Final customer price:', finalCustomerPrice);
        
        // Uppdatera alla priselement
        this.updatePriceDisplay({
            baseComponentsPrice,
            windowTypeCost: renovationTypeCost + windowTypeCost,
            extrasCost,
            renovationMarkup: workDescriptionMarkup,
            priceAdjustment,
            materialCost,
            subtotalExclVat,
            vatCost,
            totalInclVat,
            rotDeduction,
            finalCustomerPrice,
            hasRotDeduction: data.hasRotDeduction
        });
        
        console.log('=== PRICE CALCULATION COMPLETE ===');
    }
    
    collectPricingData() {
        return {
            // Antal enheter
            doorSections: parseInt(document.getElementById('antal_dorrpartier')?.value) || 0,
            luftare1: parseInt(document.getElementById('antal_1_luftare')?.value) || 0,
            luftare2: parseInt(document.getElementById('antal_2_luftare')?.value) || 0,
            luftare3: parseInt(document.getElementById('antal_3_luftare')?.value) || 0,
            luftare4: parseInt(document.getElementById('antal_4_luftare')?.value) || 0,
            luftare5: parseInt(document.getElementById('antal_5_luftare')?.value) || 0,
            luftare6: parseInt(document.getElementById('antal_6_luftare')?.value) || 0,
            
            // Totalt antal fönster (för vissa beräkningar)
            totalWindows: parseInt(document.getElementById('window_sections')?.value) || 0,
            
            // Renoveringstyp (dropdown)
            renovationType: document.getElementById('typ_av_renovering')?.value || '',
            
            // Arbetsbeskrivning (radio buttons)
            workDescription: this.form.querySelector('input[name="arbetsbeskrivning"]:checked')?.value || '',
            
            // Fönstertyp
            windowType: document.getElementById('typ_av_fonster')?.value || '',
            
            // Prisjustering och material
            priceAdjustmentPlus: parseInt(document.getElementById('price_adjustment_plus')?.value) || 0,
            priceAdjustmentMinus: parseInt(document.getElementById('price_adjustment_minus')?.value) || 0,
            materialPercentage: parseInt(document.getElementById('materialkostnad')?.value) || 10,
            
            // Spröjs
            hasSprojs: this.form.querySelector('input[name="sprojs_choice"]:checked')?.value === 'Ja',
            sprojsPerWindow: parseInt(document.getElementById('antal_sprojs_per_bage')?.value) || 0,
            
            // E-glas
            hasEGlass: this.form.querySelector('input[name="le_glas_choice"]:checked')?.value === 'Ja',
            eGlassSqm: parseFloat(document.getElementById('le_kvm')?.value) || 0,
            
            // ROT-avdrag
            propertyRotEligible: this.form.querySelector('input[name="fastighet_rot_berättigad"]:checked')?.value || '',
            customerRotEligible: this.form.querySelector('input[name="är_du_berättigad_rot_avdrag"]:checked')?.value || '',
            hasRotDeduction: this.form.querySelector('input[name="är_du_berättigad_rot_avdrag"]:checked')?.value === 'Ja - inkludera ROT-avdrag i anbudet'
        };
    }
    
    calculateBaseComponents(data) {
        console.log('📊 calculateBaseComponents called with data:', data);
        console.log('📊 CONFIG.UNIT_PRICES:', CONFIG.UNIT_PRICES);
        
        let total = 0;
        
        // Dörrpartier
        const doorCost = data.doorSections * CONFIG.UNIT_PRICES['antal_dorrpartier'];
        console.log(`🚪 Door sections: ${data.doorSections} × ${CONFIG.UNIT_PRICES['antal_dorrpartier']} = ${doorCost}`);
        total += doorCost;
        
        // Luftare
        const luftare1Cost = data.luftare1 * CONFIG.UNIT_PRICES['antal_1_luftare'];
        const luftare2Cost = data.luftare2 * CONFIG.UNIT_PRICES['antal_2_luftare'];
        const luftare3Cost = data.luftare3 * CONFIG.UNIT_PRICES['antal_3_luftare'];
        const luftare4Cost = data.luftare4 * CONFIG.UNIT_PRICES['antal_4_luftare'];
        const luftare5Cost = data.luftare5 * CONFIG.UNIT_PRICES['antal_5_luftare'];
        const luftare6Cost = data.luftare6 * CONFIG.UNIT_PRICES['antal_6_luftare'];
        
        console.log(`🪟 Luftare 1: ${data.luftare1} × ${CONFIG.UNIT_PRICES['antal_1_luftare']} = ${luftare1Cost}`);
        console.log(`🪟 Luftare 2: ${data.luftare2} × ${CONFIG.UNIT_PRICES['antal_2_luftare']} = ${luftare2Cost}`);
        console.log(`🪟 Luftare 3: ${data.luftare3} × ${CONFIG.UNIT_PRICES['antal_3_luftare']} = ${luftare3Cost}`);
        console.log(`🪟 Luftare 4: ${data.luftare4} × ${CONFIG.UNIT_PRICES['antal_4_luftare']} = ${luftare4Cost}`);
        console.log(`🪟 Luftare 5: ${data.luftare5} × ${CONFIG.UNIT_PRICES['antal_5_luftare']} = ${luftare5Cost}`);
        console.log(`🪟 Luftare 6: ${data.luftare6} × ${CONFIG.UNIT_PRICES['antal_6_luftare']} = ${luftare6Cost}`);
        
        total += luftare1Cost + luftare2Cost + luftare3Cost + luftare4Cost + luftare5Cost + luftare6Cost;
        
        console.log(`📊 Total base components: ${total}`);
        return total;
    }
    
    calculateRenovationTypeCost(data, basePrice) {
        if (!data.renovationType) return 0;
        
        const multiplier = CONFIG.RENOVATION_TYPE_MULTIPLIERS[data.renovationType];
        
        if (typeof multiplier === 'number') {
            // Procentuell ökning/minskning
            return basePrice * (multiplier - 1);
        }
        
        return 0;
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
        console.log('💎 calculateExtrasCost called with data:', data);
        console.log('💎 CONFIG.EXTRAS:', CONFIG.EXTRAS);
        
        let total = 0;
        
        // Spröjs: 300kr per ruta × antal spröjs × antal fönster
        if (data.hasSprojs && data.sprojsPerWindow > 0) {
            const sprojsCost = CONFIG.EXTRAS.SPROJS_PER_RUTA * data.sprojsPerWindow * data.totalWindows;
            console.log(`🖼️ Spröjs: ${data.sprojsPerWindow} × ${data.totalWindows} × ${CONFIG.EXTRAS.SPROJS_PER_RUTA} = ${sprojsCost}`);
            total += sprojsCost;
        }
        
        // E-glas: 2500kr/kvm
        if (data.hasEGlass && data.eGlassSqm > 0) {
            const eGlassCost = CONFIG.EXTRAS.E_GLASS_PER_SQM * data.eGlassSqm;
            console.log(`✨ LE-glas: ${data.eGlassSqm} kvm × ${CONFIG.EXTRAS.E_GLASS_PER_SQM} = ${eGlassCost}`);
            total += eGlassCost;
        }
        
        console.log(`💎 Total extras cost: ${total}`);
        return total;
    }
    
    calculateWorkDescriptionMarkup(data, subtotal, priceAdjustment, materialCost) {
        if (!data.workDescription) return 0;
        
        const multiplier = CONFIG.WORK_DESCRIPTION_MULTIPLIERS[data.workDescription];
        
        // Pålägg på allt utom prisjustering och material
        const baseForMarkup = subtotal - priceAdjustment - materialCost;
        return baseForMarkup * (multiplier - 1);
    }
    
    updatePriceDisplay(prices) {
        // Uppdatera alla priselement
        this.baseComponentsPriceElement.textContent = this.formatPrice(prices.baseComponentsPrice);
        this.windowTypeCostElement.textContent = this.formatPrice(prices.windowTypeCost);
        this.extrasCostElement.textContent = this.formatPrice(prices.extrasCost);
        this.renovationMarkupElement.textContent = this.formatPrice(prices.renovationMarkup);
        this.extraHoursCostElement.textContent = this.formatPrice(prices.priceAdjustment);
        this.materialCostDisplayElement.textContent = this.formatPrice(prices.materialCost);
        this.subtotalPriceElement.innerHTML = `<strong>${this.formatPrice(prices.subtotalExclVat)}</strong>`;
        this.vatCostElement.textContent = this.formatPrice(prices.vatCost);
        this.totalWithVatElement.innerHTML = `<strong>${this.formatPrice(prices.totalInclVat)}</strong>`;
        this.finalCustomerPriceElement.innerHTML = `<strong>${this.formatPrice(prices.finalCustomerPrice)}</strong>`;
        this.materialDeductionElement.textContent = this.formatPrice(prices.materialCost);
        
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
                    if (field.name === 'postal_code') {
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
        
        // Validera dropdown och radio buttons
        const requiredSelects = [
            { name: 'typ_av_renovering', message: 'Vänligen välj typ av renovering' }
        ];
        
        requiredSelects.forEach(select => {
            const element = document.getElementById(select.name);
            if (!element || !element.value) {
                isFormValid = false;
                const groupElement = element?.closest('.form-group');
                const errorElement = groupElement?.querySelector('.error-message');
                if (groupElement) groupElement.classList.add('error');
                if (errorElement) {
                    errorElement.textContent = select.message;
                    errorElement.classList.add('show');
                }
            }
        });
        
        const radioGroups = [
            { name: 'arbetsbeskrivning', message: 'Vänligen välj arbetsbeskrivning' },
            { name: 'fastighet_rot_berättigad', message: 'Vänligen ange om fastigheten är berättigad ROT-avdrag' },
            { name: 'är_du_berättigad_rot_avdrag', message: 'Vänligen ange om kunden är berättigad ROT-avdrag' }
        ];
        
        radioGroups.forEach(group => {
            const radios = this.form.querySelectorAll(`input[name="${group.name}"]`);
            const isSelected = Array.from(radios).some(radio => radio.checked);
            if (!isSelected) {
                isFormValid = false;
                const groupElement = radios[0].closest('.form-group');
                const errorElement = groupElement.querySelector('.error-message');
                groupElement.classList.add('error');
                if (errorElement) {
                    errorElement.textContent = group.message;
                    errorElement.classList.add('show');
                }
            }
        });
        
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
        
        // Auto-fill fastighetsbeteckning om tomt
        const fastighetsbeteckningField = document.getElementById('fastighetsbeteckning');
        if (fastighetsbeteckningField && !fastighetsbeteckningField.value.trim()) {
            fastighetsbeteckningField.value = '-';
        }
        
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
                
                // Endast lägg till fält med värden (undvik tomma radio buttons)
                if (value !== '') {
                    formData.append(CONFIG.FORM_FIELDS[fieldName], value);
                }
            } else {
                // Hantera radio buttons som kanske inte hittas med querySelector direkt
                if (fieldName === 'fastighet_rot_berättigad' || fieldName === 'är_du_berättigad_rot_avdrag') {
                    const selectedRadio = this.form.querySelector(`input[name="${fieldName}"]:checked`);
                    if (selectedRadio) {
                        formData.append(CONFIG.FORM_FIELDS[fieldName], selectedRadio.value);
                    }
                }
            }
        });
        
        // Lägg till detaljerad prisberäkning och ROT-avdrag information
        const data = this.collectPricingData();
        const baseComponentsPrice = this.calculateBaseComponents(data);
        const renovationTypeCost = this.calculateRenovationTypeCost(data, baseComponentsPrice);
        const windowTypeCost = this.calculateWindowTypeCost(data, baseComponentsPrice);
        const extrasCost = this.calculateExtrasCost(data);
        const extraHoursCost = data.extraHours * CONFIG.HOURLY_RATE;
        const subtotalBeforeMaterial = baseComponentsPrice + renovationTypeCost + windowTypeCost + extrasCost + extraHoursCost;
        const materialCost = subtotalBeforeMaterial * (data.materialPercentage / 100);
        const subtotalBeforeWork = subtotalBeforeMaterial + materialCost;
        const workDescriptionMarkup = this.calculateWorkDescriptionMarkup(data, subtotalBeforeWork, extraHoursCost, materialCost);
        const subtotalExclVat = subtotalBeforeWork + workDescriptionMarkup;
        const vatCost = subtotalExclVat * CONFIG.EXTRAS.VAT_RATE;
        const totalInclVat = subtotalExclVat + vatCost;
        const workCost = subtotalExclVat - materialCost;
        const rotDeduction = data.hasRotDeduction ? workCost * CONFIG.EXTRAS.ROT_DEDUCTION : 0;
        const finalCustomerPrice = totalInclVat - rotDeduction;
        
        // Lägg till beräknat ROT-avdrag som separat fält
        if (data.hasRotDeduction && rotDeduction > 0) {
            formData.append('entry.ROT_CALCULATED_AMOUNT', this.formatPrice(rotDeduction));
        }
        
        // Skapa detaljerad prissammanfattning för Google Forms
        const priceBreakdown = `
PRISBERÄKNING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Grundkomponenter:
- Luftare och dörrar: ${this.formatPrice(baseComponentsPrice)}
- Renoveringstyp (${data.renovationType}): ${this.formatPrice(renovationTypeCost)}
- Fönstertyp (${data.windowType}): ${this.formatPrice(windowTypeCost)}
- Spröjs/E-glas: ${this.formatPrice(extrasCost)}
- Extra timmar (${data.extraHours}h × 700kr): ${this.formatPrice(extraHoursCost)}
- Material (${data.materialPercentage}%): ${this.formatPrice(materialCost)}
- Arbetsbeskrivning (${data.workDescription}): ${this.formatPrice(workDescriptionMarkup)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summa exkl. moms: ${this.formatPrice(subtotalExclVat)}
Moms (25%): ${this.formatPrice(vatCost)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Totalt inkl. moms: ${this.formatPrice(totalInclVat)}

ROT-AVDRAG INFORMATION:
- Fastighet berättigad: ${data.propertyRotEligible}
- Kund berättigad: ${data.customerRotEligible}
${data.hasRotDeduction ? `- ROT-avdrag (50% på arbetskostnad ${this.formatPrice(workCost)}): -${this.formatPrice(rotDeduction)}` : '- ROT-avdrag: Ej tillämpligt'}
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
        
        // Återställ materialkostnad till standard 10%
        document.getElementById('materialkostnad').value = '10';
        
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
        
        // Visa formuläret igen efter 3 sekunder för att ge användaren tid att läsa meddelandet
        setTimeout(() => {
            this.successMessage.style.display = 'none';
            this.form.style.display = 'block';
            
            // Scrolla tillbaka till toppen av formuläret
            this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 3000);
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
            'extra_hours',
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
        new ThemeToggle();
        
        console.log('Sternbecks Anbudsapplikation initialiserad framgångsrikt efter lösenordsvalidering!');
    }
}

// Tema toggle klass
class ThemeToggle {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.body = document.body;
        
        // Ladda sparat tema från localStorage
        const savedTheme = localStorage.getItem('sternbecks-theme');
        if (savedTheme === 'dark') {
            this.body.classList.add('dark');
        }
        
        this.initializeThemeToggle();
    }
    
    initializeThemeToggle() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
    
    toggleTheme() {
        this.body.classList.toggle('dark');
        
        // Spara tema i localStorage
        const isDark = this.body.classList.contains('dark');
        localStorage.setItem('sternbecks-theme', isDark ? 'dark' : 'light');
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
    console.log('🚀 DOM Content Loaded - Starting application...');
    
    // Starta med lösenordsskydd
    new PasswordProtection();
    
    // Initialisera prisberäkning
    console.log('🧮 Initializing QuoteCalculator...');
    new QuoteCalculator();
    
    // Initialisera tema toggle
    console.log('🎨 Initializing ThemeToggle...');
    new ThemeToggle();
    
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