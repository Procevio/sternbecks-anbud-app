// Lösenordsskydd konfiguration
const PASSWORD_CONFIG = {
    CORRECT_PASSWORD: 'sternbecks2025',
    MAX_ATTEMPTS: 3,
    SESSION_KEY: 'sternbecks_auth_session'
};

// Konfiguration för applikationen
const CONFIG = {
    BASE_PRICE: 0, // Grundpris baserat på komponenter, inte fast summa
    HOURLY_RATE: 700, // Pris per extra timme
    
    // Prissättning per enhet (exkl. moms)
    UNIT_PRICES: {
        'antal_dorrpartier': 6000,  // Dörrpartier: 6000kr/st (exkl. moms)
        'antal_kallare_glugg': 3000, // Källare/Glugg: 3000kr/st (exkl. moms)
        'antal_pardorr_balkong': 10000, // Pardörr balkong/altan: 10000kr/st (exkl. moms)
        'antal_1_luftare': 3500,    // 1 luftare: 3500kr/st (exkl. moms)
        'antal_2_luftare': 5500,    // 2 luftare: 5500kr/st (exkl. moms)
        'antal_3_luftare': 6500,    // 3 luftare: 6500kr/st (exkl. moms)
        'antal_4_luftare': 8000,    // 4 luftare: 8000kr/st (exkl. moms)
        'antal_5_luftare': 9000,    // 5 luftare: 9000kr/st (exkl. moms)
        'antal_6_luftare': 11000    // 6 luftare: 11000kr/st (exkl. moms)
    },
    
    // Renoveringstyp-påslag (Typ av renovering dropdown)
    RENOVATION_TYPE_MULTIPLIERS: {
        'Traditionell - Linoljebehandling': 1.15,  // +15%
        'Modern - Alcro bestå': 1.0                // Standardpris
    },
    
    // Fönstertyp-påslag (checkboxes - kan välja flera)
    // Nya beräkningslogik: pris × antal luftare × totalt antal fönster
    // Fönstertyp rabatter per båge (negativa värden = rabatter)
    WINDOW_TYPE_DISCOUNTS_PER_BAGE: {
        'Kopplade standard': 0,                    // Standardpris (ingen rabatt)
        'Isolerglas': -400,                       // -400kr per båge
        'Kopplade isolerglas': 0,                 // Ingen rabatt (standardpris)
        'Insatsbågar yttre': -400,                // -400kr per båge
        'Insatsbågar inre': -1250,                // -1250kr per båge
        'Insatsbågar komplett': 0,                // Ingen rabatt (standardpris)
    },
    
    // Fönsteröppning-multiplikatorer (påverkar luftare-grundpriset)
    WINDOW_OPENING_MULTIPLIERS: {
        'Inåtgående': 1.0,                        // Ingen förändring
        'Utåtgående': 1.05                        // +5% på luftare-grundpris
    },
    
    // Arbetsbeskrivning-påslag
    WORK_DESCRIPTION_MULTIPLIERS: {
        'Utvändig renovering': 1.0,                // 100% av totalsumman
        'Invändig renovering': 1.25,               // +25%
        'Utvändig renovering samt målning av innerbågens insida': 1.05 // +5%
    },
    
    // Tillägg (exkl. moms)
    EXTRAS: {
        SPROJS_LOW_PRICE: 250,      // 250kr per ruta för 1-3 spröjs (exkl. moms)
        SPROJS_HIGH_PRICE: 400,     // 400kr per ruta för 4+ spröjs (exkl. moms)
        SPROJS_THRESHOLD: 3,        // Gräns för prisökning
        E_GLASS_PER_SQM: 2500,      // 2500kr/kvm (exkl. moms)
        VAT_RATE: 0.25,             // 25% moms
        ROT_DEDUCTION: 0.5          // 50% ROT-avdrag
    },
    
    // Webhook konfiguration
    WEBHOOK_URL: 'https://hooks.zapier.com/hooks/catch/24181254/utcf9ny/'
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
            'subtotal-price-display': this.subtotalPriceDisplayElement = document.getElementById('subtotal-price-display'),
            'vat-cost': this.vatCostElement = document.getElementById('vat-cost'),
            'total-with-vat': this.totalWithVatElement = document.getElementById('total-with-vat'),
            'rot-deduction': this.rotDeductionElement = document.getElementById('rot-deduction'),
            'rot-row': this.rotRowElement = document.getElementById('rot-row'),
            'material-row': this.materialRowElement = document.getElementById('material-row'),
            'final-customer-price': this.finalCustomerPriceElement = document.getElementById('final-customer-price'),
            'material-deduction': this.materialDeductionElement = document.getElementById('material-deduction'),
            'extra-hours-display': this.extraHoursDisplayElement = document.getElementById('extra-hours-display'),
            'kallare-glugg-cost': this.kallareGluggCostElement = document.getElementById('kallare-glugg-cost'),
            'kallare-glugg-row': this.kallareGluggRowElement = document.getElementById('kallare-glugg-row')
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
        
        // GDPR elements
        this.gdprConsent = document.getElementById('gdpr-consent');
        this.gdprConsentError = document.getElementById('gdpr-consent-error');
        this.gdprDetailsLink = document.getElementById('gdpr-details-link');
        this.gdprModal = document.getElementById('gdpr-modal');
        this.gdprModalClose = document.getElementById('gdpr-modal-close');
        this.gdprModalOk = document.getElementById('gdpr-modal-ok');
        
        console.log('CONFIG object:', CONFIG);
        
        this.initializeEventListeners();
        this.initializeFastighetsbeteckningAutoFill();
        this.initializeConditionalFields();
        this.initializeTabs();
        console.log('🔄 Running initial price calculation...');
        this.updatePriceCalculation();
        
        // Test basic functionality
        this.testBasicCalculation();
    }
    
    initializeEventListeners() {
        // Lyssna på alla ändringar som påverkar prissättning
        const priceAffectingFields = [
            'price_adjustment_plus', 'price_adjustment_minus', 'materialkostnad', 'window_sections', 'antal_dorrpartier',
            'antal_kallare_glugg', 'antal_pardorr_balkong', 'antal_1_luftare', 'antal_2_luftare', 'antal_3_luftare', 
            'antal_4_luftare', 'antal_5_luftare', 'antal_6_luftare',
            'antal_sprojs_per_bage', 'antal_fonster_med_sprojs', 'le_kvm', 'fastighetsbeteckning'
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
            'typ_av_renovering', 'arbetsbeskrivning', 'sprojs_choice', 'le_glas_choice', 
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
        
        // Lyssna på fönsteröppning och fönstertyp radiobuttons separat
        const windowOpeningRadios = this.form.querySelectorAll('input[name="fonsteroppning"]');
        windowOpeningRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                console.log('🔥 Window opening changed:', radio.value);
                this.updatePriceCalculation();
            });
        });
        
        const windowTypeRadios = this.form.querySelectorAll('input[name="typ_av_fonster"]');
        windowTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                console.log('🔥 Window type changed:', radio.value);
                this.updatePriceCalculation();
            });
        });
        
        // Lyssna på formulär submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });
        
        // Lyssna på arbetsbeskrivning formulär submission
        const arbetsForm = document.getElementById('arbetsbeskrivning-form');
        if (arbetsForm) {
            arbetsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleArbetsbeskrivningSubmission();
            });
        }
        
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
        
        // GDPR modal event listeners
        if (this.gdprDetailsLink) {
            this.gdprDetailsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showGdprModal();
            });
        }
        
        if (this.gdprModalClose) {
            this.gdprModalClose.addEventListener('click', () => {
                this.hideGdprModal();
            });
        }
        
        if (this.gdprModalOk) {
            this.gdprModalOk.addEventListener('click', () => {
                this.hideGdprModal();
            });
        }
        
        // Close modal on background click
        if (this.gdprModal) {
            this.gdprModal.addEventListener('click', (e) => {
                if (e.target === this.gdprModal) {
                    this.hideGdprModal();
                }
            });
        }
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
        const sprojsFonsterGroup = document.getElementById('sprojs-fonster-group');
        
        console.log('Sprojs radios found:', sprojsChoiceRadios.length);
        console.log('Sprojs antal group:', sprojsAntalGroup);
        console.log('Sprojs fönster group:', sprojsFonsterGroup);
        
        sprojsChoiceRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'Ja' && radio.checked) {
                    sprojsAntalGroup.style.display = 'block';
                    sprojsFonsterGroup.style.display = 'block';
                } else if (radio.value === 'Nej' && radio.checked) {
                    sprojsAntalGroup.style.display = 'none';
                    sprojsFonsterGroup.style.display = 'none';
                    // Reset värden när de döljs
                    document.getElementById('antal_sprojs_per_bage').value = '0';
                    document.getElementById('antal_fonster_med_sprojs').value = '0';
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
        
        // Hantera ROT-avdrag conditional materialkostnad field
        const rotChoiceRadios = this.form.querySelectorAll('input[name="är_du_berättigad_rot_avdrag"]');
        const materialkostnadSection = document.getElementById('materialkostnad-section');
        
        console.log('ROT choice radios found:', rotChoiceRadios.length);
        console.log('Materialkostnad section:', materialkostnadSection);
        
        rotChoiceRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'Ja - inkludera ROT-avdrag i anbudet' && radio.checked) {
                    materialkostnadSection.style.display = 'block';
                } else if (radio.value === 'Nej - visa fullpris utan avdrag' && radio.checked) {
                    materialkostnadSection.style.display = 'none';
                    // Reset värdet till 0% när det döljs
                    document.getElementById('materialkostnad').value = '0';
                    this.updatePriceCalculation();
                }
            });
        });
    }
    
    initializeTabs() {
        console.log('🔧 Initializing tabs...');
        
        // Get tab elements
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        console.log('Tab buttons found:', this.tabButtons.length);
        console.log('Tab contents found:', this.tabContents.length);
        
        // Add click event listeners to tab buttons
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = button.getAttribute('data-tab');
                this.switchTab(targetTab);
                
                // Copy customer data when switching to arbetsbeskrivning
                if (targetTab === 'arbetsbeskrivning') {
                    this.copyCustomerData();
                }
            });
        });
        
        // Load data from localStorage on init
        this.loadTabData();
        
        // Save data on form changes
        this.initializeDataSaving();
    }
    
    switchTab(targetTab) {
        console.log('🔄 Switching to tab:', targetTab);
        
        // Update active states
        this.tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === targetTab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        this.tabContents.forEach(content => {
            if (content.id === targetTab + '-tab') {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }
    
    copyCustomerData() {
        console.log('📋 Copying customer data to arbetsbeskrivning tab...');
        
        // Customer info mapping
        const dataMapping = [
            ['company', 'arb_company'],
            ['email', 'arb_email'],
            ['phone', 'arb_phone'],
            ['address', 'arb_address']
        ];
        
        dataMapping.forEach(([sourceId, targetId]) => {
            const sourceElement = document.getElementById(sourceId);
            const targetElement = document.getElementById(targetId);
            
            if (sourceElement && targetElement) {
                targetElement.value = sourceElement.value || '';
                console.log(`✓ Copied ${sourceId} -> ${targetId}:`, sourceElement.value);
            }
        });
    }
    
    loadTabData() {
        console.log('📥 Loading tab data from localStorage...');
        
        try {
            // Load anbud data
            const anbudData = localStorage.getItem('sternbecks_anbud_data');
            if (anbudData) {
                const data = JSON.parse(anbudData);
                this.loadFormData('quote-form', data);
            }
            
            // Load arbetsbeskrivning data
            const arbetsData = localStorage.getItem('sternbecks_arbetsbeskrivning_data');
            if (arbetsData) {
                const data = JSON.parse(arbetsData);
                this.loadFormData('arbetsbeskrivning-form', data);
            }
        } catch (error) {
            console.error('Error loading tab data:', error);
        }
    }
    
    saveTabData(tabName) {
        try {
            const formId = tabName === 'anbud' ? 'quote-form' : 'arbetsbeskrivning-form';
            const form = document.getElementById(formId);
            
            if (form) {
                const formData = new FormData(form);
                const data = {};
                
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                
                localStorage.setItem(`sternbecks_${tabName}_data`, JSON.stringify(data));
                console.log(`💾 Saved ${tabName} data:`, data);
            }
        } catch (error) {
            console.error(`Error saving ${tabName} data:`, error);
        }
    }
    
    loadFormData(formId, data) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        Object.entries(data).forEach(([key, value]) => {
            const element = form.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'radio' || element.type === 'checkbox') {
                    if (element.value === value) {
                        element.checked = true;
                    }
                } else {
                    element.value = value;
                }
            }
        });
    }
    
    initializeDataSaving() {
        // Save anbud data on changes
        const anbudForm = document.getElementById('quote-form');
        if (anbudForm) {
            anbudForm.addEventListener('input', () => {
                this.saveTabData('anbud');
            });
            anbudForm.addEventListener('change', () => {
                this.saveTabData('anbud');
            });
        }
        
        // Save arbetsbeskrivning data on changes
        const arbetsForm = document.getElementById('arbetsbeskrivning-form');
        if (arbetsForm) {
            arbetsForm.addEventListener('input', () => {
                this.saveTabData('arbetsbeskrivning');
            });
            arbetsForm.addEventListener('change', () => {
                this.saveTabData('arbetsbeskrivning');
            });
        }
        
        // Add event listener for renoveringstyp dropdown
        const renovationTypeSelect = document.getElementById('arb_typ_av_renovering');
        if (renovationTypeSelect) {
            renovationTypeSelect.addEventListener('change', () => {
                this.updateMomentChecklista(renovationTypeSelect.value);
            });
        }
    }
    
    updateMomentChecklista(renovationType) {
        console.log('🔄 Updating moment checklista for:', renovationType);
        
        const checklistaSection = document.getElementById('moment-checklista-section');
        const checklistaContainer = document.getElementById('moment-checklista-container');
        
        if (!checklistaSection || !checklistaContainer) {
            console.error('Checklista elements not found');
            return;
        }
        
        if (!renovationType) {
            checklistaSection.style.display = 'none';
            return;
        }
        
        checklistaSection.style.display = 'block';
        
        // Get moment data
        const momentData = this.getMomentData(renovationType);
        
        // Clear existing content
        checklistaContainer.innerHTML = '';
        
        // Build checklista HTML
        Object.entries(momentData).forEach(([category, items]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'moment-category';
            
            const categoryTitle = document.createElement('h4');
            categoryTitle.textContent = category;
            categoryDiv.appendChild(categoryTitle);
            
            items.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'moment-item';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `moment_${category.replace(/\s/g, '_')}_${index}`;
                checkbox.name = `moment_${category.replace(/\s/g, '_')}_${index}`;
                checkbox.value = item;
                
                const label = document.createElement('label');
                label.htmlFor = checkbox.id;
                label.textContent = item;
                
                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(label);
                categoryDiv.appendChild(itemDiv);
            });
            
            checklistaContainer.appendChild(categoryDiv);
        });
        
        console.log('✅ Moment checklista updated for:', renovationType);
    }
    
    getMomentData(renovationType) {
        if (renovationType === 'Traditionell - Linoljebehandling') {
            return {
                'Fönsterkarm': [
                    'Tvättning',
                    'Skrapning/slipning',
                    'Färgkanter',
                    'Demontering beslag/tätningslist',
                    'Montering ny tätningslist',
                    'Uppskrapning fönsterbleck',
                    'Grundning Engwall & Claesson Linoljefärg',
                    'Fogning',
                    '2 ggr strykning'
                ],
                'Ytterbåge': [
                    'Rengöring till träyta',
                    'Kittborttagning',
                    'Kittning linoljekitt',
                    'Grundning/strykning Engwall & Claesson'
                ],
                'Innerbågens kanter': [
                    'Skrapning/slipning',
                    'Grundning/strykning Engwall & Claesson'
                ],
                'Mellansidor': [
                    'Ytterbåge (skrapning, toppförsegling, grundning/strykning Alcro Bestå)',
                    'Innerbåge (skrapning, grundning Alcro, strykning Alcro Bestå)'
                ],
                'Invändigt karm': [
                    'Ingen åtgärd',
                    'Alt. skrapning/grundning/strykning Alcro vslip/Vmill'
                ],
                'Invändigt fönsterbågar': [
                    'Ingen åtgärd',
                    'Alt. skrapning/påspackling/grundning/strykning Alcro'
                ],
                'Fönsterfoder': [
                    'Ingen åtgärd',
                    'Alt. skrapning/grundning/strykning Engwall & Claesson'
                ]
            };
        } else if (renovationType === 'Modern - Alcro bestå') {
            return {
                'Fönsterkarm': [
                    'Tvättning',
                    'Skrapning/slipning',
                    'Färgkanter',
                    'Demontering beslag/tätningslist',
                    'Montering ny tätningslist',
                    'Uppskrapning fönsterbleck',
                    'Grundning/strykning Alcro/Alcro Bestå Utsikt',
                    'Fogning',
                    '2 ggr strykning'
                ],
                'Ytterbåge': [
                    'Rengöring',
                    'Komplettering kittning',
                    'Kittning LASeal',
                    'Grundning/strykning Alcro Bestå'
                ],
                'Innerbågens kanter': [
                    'Skrapning/grundning/strykning Alcro Bestå'
                ],
                'Mellansidor': [
                    'Ytterbåge (skrapning, toppförsegling, grundning/strykning Alcro)',
                    'Innerbåge (skrapning, grundning Alcro, strykning Alcro)'
                ],
                'Invändigt karm': [
                    'Mer omfattande arbete med Alcro Vslip/V mill'
                ],
                'Invändigt fönsterbågar': [
                    'Skrapning/påspackling/grundning/strykning Alcro'
                ],
                'Fönsterfoder': [
                    'Skrapning/grundning/strykning Alcro Bestå',
                    'Extra foder enligt samtal'
                ],
                'Övrigt': [
                    'Demontage gamla persienner'
                ]
            };
        }
        
        return {};
    }
    
    testBasicCalculation() {
        console.log('🧪 Testing basic calculation...');
        
        // Set a simple test value
        const testData = {
            doorSections: 1,
            kallareGlugg: 0,
            luftare1: 1,
            luftare2: 0,
            luftare3: 0,
            luftare4: 0,
            luftare5: 0,
            luftare6: 0,
            totalWindows: 1,
            renovationType: 'Modern - Alcro bestå',
            workDescription: 'Utvändig renovering',
            windowOpening: 'Inåtgående',
            windowType: 'Kopplade standard',
            priceAdjustmentPlus: 0,
            priceAdjustmentMinus: 0,
            materialPercentage: 0,
            hasSprojs: false,
            sprojsPerWindow: 0,
            windowsWithSprojs: 0,
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
        
        // Kör även spröjs-tester
        this.testSprojsCalculations();
    }
    
    testSprojsCalculations() {
        console.log('🧪 Testing new Spröjs calculations...');
        
        // Test 1: Lågt pris (≤3 spröjs) - 2st 3-luftare, 2 spröjs, 2 fönster med spröjs
        const testData1 = {
            luftare1: 0, luftare2: 0, luftare3: 2, luftare4: 0, luftare5: 0, luftare6: 0,
            hasSprojs: true,
            sprojsPerWindow: 2,
            windowsWithSprojs: 2,
            kallareGlugg: 0
        };
        const result1 = this.calculateExtrasCost(testData1);
        const expected1 = 250 * 2 * 3 * 2; // 250kr × 2 spröjs × 3 luftare/fönster × 2 fönster = 3,000kr
        console.log(`Test 1 - 2st 3-luftare med 2 spröjs på 2 fönster: ${result1}kr (förväntat: ${expected1}kr) - ${result1 === expected1 ? 'PASS' : 'FAIL'}`);
        
        // Test 2: Högt pris (>3 spröjs) - 1st 3-luftare, 4 spröjs, 1 fönster med spröjs  
        const testData2 = {
            luftare1: 0, luftare2: 0, luftare3: 1, luftare4: 0, luftare5: 0, luftare6: 0,
            hasSprojs: true,
            sprojsPerWindow: 4,
            windowsWithSprojs: 1,
            kallareGlugg: 0
        };
        const result2 = this.calculateExtrasCost(testData2);
        const expected2 = 400 * 4 * 3 * 1; // 400kr × 4 spröjs × 3 luftare/fönster × 1 fönster = 4,800kr
        console.log(`Test 2 - 1st 3-luftare med 4 spröjs på 1 fönster: ${result2}kr (förväntat: ${expected2}kr) - ${result2 === expected2 ? 'PASS' : 'FAIL'}`);
        
        // Test 3: Gränsvärde (=3 spröjs) - blandade luftare
        const testData3 = {
            luftare1: 0, luftare2: 2, luftare3: 2, luftare4: 0, luftare5: 0, luftare6: 0,
            hasSprojs: true,
            sprojsPerWindow: 3,
            windowsWithSprojs: 1,
            kallareGlugg: 0
        };
        const result3 = this.calculateExtrasCost(testData3);
        // Genomsnitt: (2×2 + 2×3)/(2+2) = 10/4 = 2.5 luftare/fönster
        const expected3 = 250 * 3 * 2.5 * 1; // 250kr × 3 spröjs × 2.5 luftare/fönster × 1 fönster = 1,875kr
        console.log(`Test 3 - Blandade luftare med 3 spröjs på 1 fönster: ${result3}kr (förväntat: ${expected3}kr) - ${result3 === expected3 ? 'PASS' : 'FAIL'}`);
        
        // Test 4: Exempel från specifikationen: 3 spröjs på 2st av 4st 3-luftare = 4,500kr
        const testData4 = {
            luftare1: 0, luftare2: 0, luftare3: 4, luftare4: 0, luftare5: 0, luftare6: 0,
            hasSprojs: true,
            sprojsPerWindow: 3,
            windowsWithSprojs: 2,
            kallareGlugg: 0
        };
        const result4 = this.calculateExtrasCost(testData4);
        const expected4 = 250 * 3 * 3 * 2; // 250kr × 3 spröjs × 3 luftare/fönster × 2 fönster = 4,500kr
        console.log(`Test 4 - Exempel från spec: ${result4}kr (förväntat: ${expected4}kr) - ${result4 === expected4 ? 'PASS' : 'FAIL'}`);
        
        console.log('🧪 Spröjs calculation tests completed');
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
        
        // Beräkna summa utan materialkostnad (material bara för ROT-beräkning)
        const subtotalBeforeMaterial = baseComponentsPrice + renovationTypeCost + windowTypeCost + extrasCost + priceAdjustment;
        console.log('Subtotal before work markup:', subtotalBeforeMaterial);
        
        // Beräkna arbetsbeskrivning-pålägg (utan materialavdrag)
        const workDescriptionMarkup = this.calculateWorkDescriptionMarkup(data, subtotalBeforeMaterial, priceAdjustment, 0);
        console.log('Work description markup:', workDescriptionMarkup);
        
        // Total summa exklusive moms (utan materialkostnad)
        const subtotalExclVat = subtotalBeforeMaterial + workDescriptionMarkup;
        console.log('Subtotal excl VAT:', subtotalExclVat);
        
        // Moms
        const vatCost = subtotalExclVat * CONFIG.EXTRAS.VAT_RATE;
        console.log('VAT cost:', vatCost);
        
        // Total inklusive moms (det kunden betalar utan ROT)
        const totalInclVat = subtotalExclVat + vatCost;
        console.log('Total incl VAT (full customer price):', totalInclVat);
        
        // Materialkostnad för ROT-beräkning (endast för att identifiera materialandel)
        const materialCostForRot = totalInclVat * (data.materialPercentage / 100);
        console.log('Material cost for ROT calculation:', materialCostForRot, '(' + data.materialPercentage + '% of total)');
        
        // Arbetskostnad för ROT-beräkning = totalt - material
        const workCostForRot = totalInclVat - materialCostForRot;
        console.log('Work cost for ROT calculation:', workCostForRot);
        
        // ROT-avdrag = 50% av arbetskostnaden
        const rotDeduction = data.hasRotDeduction ? workCostForRot * CONFIG.EXTRAS.ROT_DEDUCTION : 0;
        console.log('ROT deduction (50% of work cost):', rotDeduction);
        
        // Slutligt kundpris = totalt inkl moms - ROT-avdrag
        const finalCustomerPrice = totalInclVat - rotDeduction;
        console.log('Final customer price:', finalCustomerPrice);
        
        // Uppdatera alla priselement
        this.updatePriceDisplay({
            baseComponentsPrice,
            windowTypeCost: renovationTypeCost + windowTypeCost,
            extrasCost,
            renovationMarkup: workDescriptionMarkup,
            priceAdjustment,
            materialCost: materialCostForRot,
            subtotalExclVat,
            vatCost,
            totalInclVat,
            materialDeduction: materialCostForRot, // För ROT-visning
            rotDeduction,
            finalCustomerPrice,
            hasRotDeduction: data.hasRotDeduction,
            kallareGluggCount: data.kallareGlugg
        });
        
        console.log('=== PRICE CALCULATION COMPLETE ===');
    }
    
    collectPricingData() {
        // Hjälpfunktion för att hämta numeriska värden säkert
        const getNumericValue = (id) => {
            const element = document.getElementById(id);
            const value = element?.value?.trim();
            if (!value || value === '') return 0;
            
            // Hantera både komma och punkt som decimalavskiljare
            const normalizedValue = value.replace(',', '.');
            const parsedValue = parseFloat(normalizedValue);
            
            // Returnera 0 om värdet inte är ett giltigt nummer
            return isNaN(parsedValue) ? 0 : Math.round(parsedValue);
        };
        
        return {
            // Antal enheter
            doorSections: getNumericValue('antal_dorrpartier'),
            kallareGlugg: getNumericValue('antal_kallare_glugg'),
            pardorrBalkong: getNumericValue('antal_pardorr_balkong'),
            luftare1: getNumericValue('antal_1_luftare'),
            luftare2: getNumericValue('antal_2_luftare'),
            luftare3: getNumericValue('antal_3_luftare'),
            luftare4: getNumericValue('antal_4_luftare'),
            luftare5: getNumericValue('antal_5_luftare'),
            luftare6: getNumericValue('antal_6_luftare'),
            
            // Totalt antal fönster (för vissa beräkningar)
            totalWindows: getNumericValue('window_sections'),
            
            // Renoveringstyp (dropdown)
            renovationType: document.getElementById('typ_av_renovering')?.value || '',
            
            // Arbetsbeskrivning (radio buttons)
            workDescription: this.form.querySelector('input[name="arbetsbeskrivning"]:checked')?.value || '',
            
            // Fönsteröppning (radio buttons)
            windowOpening: this.form.querySelector('input[name="fonsteroppning"]:checked')?.value || 'Inåtgående',
            
            // Fönstertyp (radio buttons - endast en kan väljas)
            windowType: this.form.querySelector('input[name="typ_av_fonster"]:checked')?.value || 'Kopplade standard',
            
            // Prisjustering och material
            priceAdjustmentPlus: getNumericValue('price_adjustment_plus'),
            priceAdjustmentMinus: getNumericValue('price_adjustment_minus'),
            materialPercentage: getNumericValue('materialkostnad') || 0, // Standardvärde 0 om tomt
            
            // Spröjs
            hasSprojs: this.form.querySelector('input[name="sprojs_choice"]:checked')?.value === 'Ja',
            sprojsPerWindow: getNumericValue('antal_sprojs_per_bage'),
            windowsWithSprojs: getNumericValue('antal_fonster_med_sprojs'),
            
            // E-glas
            hasEGlass: this.form.querySelector('input[name="le_glas_choice"]:checked')?.value === 'Ja',
            eGlassSqm: getNumericValue('le_kvm'),
            
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
        
        // Källare/Glugg
        const kallareCost = data.kallareGlugg * CONFIG.UNIT_PRICES['antal_kallare_glugg'];
        console.log(`🏠 Källare/Glugg: ${data.kallareGlugg} × ${CONFIG.UNIT_PRICES['antal_kallare_glugg']} = ${kallareCost}`);
        total += kallareCost;
        
        // Pardörr balkong/altan
        const pardorrCost = data.pardorrBalkong * CONFIG.UNIT_PRICES['antal_pardorr_balkong'];
        console.log(`🚪 Pardörr balkong/altan: ${data.pardorrBalkong} × ${CONFIG.UNIT_PRICES['antal_pardorr_balkong']} = ${pardorrCost}`);
        total += pardorrCost;
        
        // Luftare - med fönsteröppning-multiplikator
        const windowOpeningMultiplier = CONFIG.WINDOW_OPENING_MULTIPLIERS[data.windowOpening] || 1.0;
        console.log(`🪟 Fönsteröppning: ${data.windowOpening} (multiplikator: ${windowOpeningMultiplier})`);
        
        const luftare1Cost = data.luftare1 * CONFIG.UNIT_PRICES['antal_1_luftare'] * windowOpeningMultiplier;
        const luftare2Cost = data.luftare2 * CONFIG.UNIT_PRICES['antal_2_luftare'] * windowOpeningMultiplier;
        const luftare3Cost = data.luftare3 * CONFIG.UNIT_PRICES['antal_3_luftare'] * windowOpeningMultiplier;
        const luftare4Cost = data.luftare4 * CONFIG.UNIT_PRICES['antal_4_luftare'] * windowOpeningMultiplier;
        const luftare5Cost = data.luftare5 * CONFIG.UNIT_PRICES['antal_5_luftare'] * windowOpeningMultiplier;
        const luftare6Cost = data.luftare6 * CONFIG.UNIT_PRICES['antal_6_luftare'] * windowOpeningMultiplier;
        
        console.log(`🪟 Luftare 1: ${data.luftare1} × ${CONFIG.UNIT_PRICES['antal_1_luftare']} × ${windowOpeningMultiplier} = ${luftare1Cost}`);
        console.log(`🪟 Luftare 2: ${data.luftare2} × ${CONFIG.UNIT_PRICES['antal_2_luftare']} × ${windowOpeningMultiplier} = ${luftare2Cost}`);
        console.log(`🪟 Luftare 3: ${data.luftare3} × ${CONFIG.UNIT_PRICES['antal_3_luftare']} × ${windowOpeningMultiplier} = ${luftare3Cost}`);
        console.log(`🪟 Luftare 4: ${data.luftare4} × ${CONFIG.UNIT_PRICES['antal_4_luftare']} × ${windowOpeningMultiplier} = ${luftare4Cost}`);
        console.log(`🪟 Luftare 5: ${data.luftare5} × ${CONFIG.UNIT_PRICES['antal_5_luftare']} × ${windowOpeningMultiplier} = ${luftare5Cost}`);
        console.log(`🪟 Luftare 6: ${data.luftare6} × ${CONFIG.UNIT_PRICES['antal_6_luftare']} × ${windowOpeningMultiplier} = ${luftare6Cost}`);
        
        const totalLuftareCost = luftare1Cost + luftare2Cost + luftare3Cost + luftare4Cost + luftare5Cost + luftare6Cost;
        total += totalLuftareCost;
        
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
        
        // Beräkna totalt antal bågar: (antal 1-luftare × 1) + (antal 2-luftare × 2) + osv
        const totalBagar = (data.luftare1 || 0) * 1 + (data.luftare2 || 0) * 2 + (data.luftare3 || 0) * 3 + 
                           (data.luftare4 || 0) * 4 + (data.luftare5 || 0) * 5 + (data.luftare6 || 0) * 6;
        
        console.log('📊 Fönstertyp calculation - Total bågar:', totalBagar);
        console.log('📊 Vald fönstertyp:', data.windowType);
        
        // Hämta rabatt per båge för den valda fönstertypen
        const discountPerBage = CONFIG.WINDOW_TYPE_DISCOUNTS_PER_BAGE[data.windowType] || 0;
        
        if (discountPerBage !== 0) {
            const totalDiscount = discountPerBage * totalBagar;
            console.log(`📊 ${data.windowType}: ${discountPerBage}kr × ${totalBagar} bågar = ${totalDiscount}kr (rabatt)`);
            return totalDiscount; // Returnerar negativ värde för rabatter
        } else {
            console.log(`📊 ${data.windowType}: Ingen rabatt (standardpris)`);
            return 0;
        }
    }
    
    calculateExtrasCost(data) {
        console.log('💎 calculateExtrasCost called with data:', data);
        console.log('💎 CONFIG.EXTRAS:', CONFIG.EXTRAS);
        
        let total = 0;
        
        // Spröjs: Ny beräkningslogik baserad på antal luftare och antal fönster med spröjs
        if (data.hasSprojs && data.sprojsPerWindow > 0 && data.windowsWithSprojs > 0) {
            let sprojsCost = 0;
            
            // Beräkna genomsnittligt antal luftare per fönster
            const totalWindowCount = (data.luftare1 || 0) + (data.luftare2 || 0) + (data.luftare3 || 0) + 
                                   (data.luftare4 || 0) + (data.luftare5 || 0) + (data.luftare6 || 0);
            const totalLuftare = (data.luftare1 || 0) * 1 + (data.luftare2 || 0) * 2 + (data.luftare3 || 0) * 3 + 
                                (data.luftare4 || 0) * 4 + (data.luftare5 || 0) * 5 + (data.luftare6 || 0) * 6;
            
            // Om vi har fönster och fönster med spröjs
            if (totalWindowCount > 0 && data.windowsWithSprojs > 0) {
                // Beräkna genomsnittligt antal luftare per fönster
                const avgLuftarePerWindow = totalLuftare / totalWindowCount;
                
                // Ny tierad beräkning (inte kumulativ)
                let sprojsLowTier = Math.min(data.sprojsPerWindow, CONFIG.EXTRAS.SPROJS_THRESHOLD); // Första 1-3 spröjs
                let sprojsHighTier = Math.max(0, data.sprojsPerWindow - CONFIG.EXTRAS.SPROJS_THRESHOLD); // 4+ spröjs
                
                // Beräkna kostnad för varje tier
                const lowTierCost = sprojsLowTier * CONFIG.EXTRAS.SPROJS_LOW_PRICE * avgLuftarePerWindow * data.windowsWithSprojs;
                const highTierCost = sprojsHighTier * CONFIG.EXTRAS.SPROJS_HIGH_PRICE * avgLuftarePerWindow * data.windowsWithSprojs;
                
                sprojsCost = lowTierCost + highTierCost;
                
                console.log(`🖼️ Spröjs-beräkning (tierad):`);
                console.log(`   Tier 1 (1-3): ${sprojsLowTier} × ${CONFIG.EXTRAS.SPROJS_LOW_PRICE}kr × ${avgLuftarePerWindow.toFixed(1)} × ${data.windowsWithSprojs} = ${lowTierCost}kr`);
                console.log(`   Tier 2 (4+): ${sprojsHighTier} × ${CONFIG.EXTRAS.SPROJS_HIGH_PRICE}kr × ${avgLuftarePerWindow.toFixed(1)} × ${data.windowsWithSprojs} = ${highTierCost}kr`);
                console.log(`   Total: ${sprojsCost}kr`);
            }
            
            console.log(`🖼️ Total spröjs-kostnad: ${sprojsCost}kr (tierad: 1-3 = 250kr/ruta, 4+ = 400kr/ruta)`);
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
    
    calculateMaterialCost(data, subtotal, priceAdjustment) {
        // Materialkostnad som procent av subtotal (innan priceAdjustment)
        const baseForMaterial = subtotal - priceAdjustment;
        const materialCost = baseForMaterial * (data.materialPercentage / 100);
        console.log(`Material cost calculation: ${baseForMaterial} × ${data.materialPercentage}% = ${materialCost}`);
        return Math.round(materialCost);
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
        this.subtotalPriceDisplayElement.textContent = this.formatPrice(prices.subtotalExclVat);
        this.vatCostElement.textContent = this.formatPrice(prices.vatCost);
        this.totalWithVatElement.innerHTML = `<strong>${this.formatPrice(prices.totalInclVat)}</strong>`;
        this.finalCustomerPriceElement.innerHTML = `<strong>${this.formatPrice(prices.finalCustomerPrice)}</strong>`;
        this.materialDeductionElement.textContent = this.formatPrice(prices.materialDeduction);
        
        // Källare/Glugg - visa/dölj beroende på om det finns några
        if (prices.kallareGluggCount && prices.kallareGluggCount > 0) {
            this.kallareGluggRowElement.style.display = 'block';
            const kallareCost = prices.kallareGluggCount * CONFIG.UNIT_PRICES['antal_kallare_glugg'];
            this.kallareGluggCostElement.textContent = this.formatPrice(kallareCost);
        } else {
            this.kallareGluggRowElement.style.display = 'none';
        }
        
        // ROT-avdrag - visa/dölj beroende på om det är valt
        if (prices.hasRotDeduction && prices.rotDeduction > 0) {
            this.rotRowElement.style.display = 'block';
            this.rotDeductionElement.textContent = `-${this.formatPrice(prices.rotDeduction)}`;
        } else {
            this.rotRowElement.style.display = 'none';
        }
        
        // Materialkostnad avdrag - visa ENDAST om ROT-avdrag är aktivt
        if (prices.hasRotDeduction) {
            this.materialRowElement.style.display = 'block';
            this.materialDeductionElement.textContent = this.formatPrice(prices.materialDeduction);
        } else {
            this.materialRowElement.style.display = 'none';
        }
    }
    
    formatPrice(amount) {
        return new Intl.NumberFormat('sv-SE', {
            style: 'currency',
            currency: 'SEK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
          .replace('SEK', 'kr')
          .replace(/\u00A0/g, ' '); // Replace non-breaking spaces with regular spaces
    }
    
    showGdprModal() {
        if (this.gdprModal) {
            this.gdprModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }
    }
    
    hideGdprModal() {
        if (this.gdprModal) {
            this.gdprModal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scroll
        }
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
        
        // Kontrollera att minst ett antal-fält har värde > 0
        const quantityFields = [
            'window_sections', 'antal_dorrpartier', 'antal_kallare_glugg', 'antal_1_luftare', 'antal_2_luftare',
            'antal_3_luftare', 'antal_4_luftare', 'antal_5_luftare', 'antal_6_luftare'
        ];
        
        const hasQuantityValues = quantityFields.some(fieldId => {
            const field = document.getElementById(fieldId);
            return field && parseInt(field.value) > 0;
        });
        
        if (!hasQuantityValues) {
            // Visa felmeddelande för partier
            this.partiesValidationText.textContent = 
                'Du måste ange minst ett antal för fönsterpartier, dörrpartier eller luftare';
            this.partiesValidation.className = 'validation-message error';
            this.partiesValidation.style.display = 'block';
            isFormValid = false;
        }
        
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
        
        // Validera GDPR-godkännande
        if (this.gdprConsent && !this.gdprConsent.checked) {
            isFormValid = false;
            if (this.gdprConsentError) {
                this.gdprConsentError.textContent = 'Du måste godkänna behandling av personuppgifter för att skicka förfrågan';
                this.gdprConsentError.classList.add('show');
            }
            const gdprSection = this.gdprConsent.closest('.form-group');
            if (gdprSection) {
                gdprSection.classList.add('error');
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
            // Skicka till webhook
            await this.submitToWebhook();
            
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
    
    // BORTTAGET: collectFormData() ersatt med webhook-funktionalitet
    /*collectFormData() {
        const formData = new FormData();
        
        // Auto-fill fastighetsbeteckning om tomt
        const fastighetsbeteckningField = document.getElementById('fastighetsbeteckning');
        if (fastighetsbeteckningField && !fastighetsbeteckningField.value.trim()) {
            fastighetsbeteckningField.value = '-';
        }
        
        // Auto-fill alla numeriska fält med 0 om de är tomma
        const numericFields = [
            'window_sections',
            'antal_dorrpartier', 
            'antal_1_luftare',
            'antal_2_luftare',
            'antal_3_luftare', 
            'antal_4_luftare',
            'antal_5_luftare',
            'antal_6_luftare',
            'antal_sprojs_per_bage',
            'le_kvm',
            'price_adjustment_plus',
            'price_adjustment_minus'
        ];
        
        numericFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && (!field.value || field.value.trim() === '')) {
                field.value = '0';
            }
        });
        
        // Samla in alla formulärfält
        Object.keys(CONFIG.FORM_FIELDS).forEach(fieldName => {
            // Special hantering för typ_av_fonster radiobuttons
            if (fieldName === 'typ_av_fonster') {
                const checkedRadio = this.form.querySelector(`input[name="typ_av_fonster"]:checked`);
                if (checkedRadio) {
                    formData.append(CONFIG.FORM_FIELDS[fieldName], checkedRadio.value);
                }
                return;
            }
            
            // Hoppa över fält som inte finns i formuläret (nya mappade fält)
            if (['fukt', 'våning', 'fastighetstyp'].includes(fieldName)) {
                return;
            }
            
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
        const workDescriptionMarkup = this.calculateWorkDescriptionMarkup(data, subtotalBeforeMaterial, extraHoursCost, 0);
        const subtotalExclVat = subtotalBeforeMaterial + workDescriptionMarkup;
        const vatCost = subtotalExclVat * CONFIG.EXTRAS.VAT_RATE;
        const totalInclVat = subtotalExclVat + vatCost;
        const materialCostForRot = totalInclVat * (data.materialPercentage / 100);
        const workCostForRot = totalInclVat - materialCostForRot;
        const rotDeduction = data.hasRotDeduction ? workCostForRot * CONFIG.EXTRAS.ROT_DEDUCTION : 0;
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
- Fönsteröppning (${data.windowOpening}): Inkluderat i grundpris
- Fönstertyp (${data.windowType || 'Ingen vald'}): ${this.formatPrice(windowTypeCost)}
- Spröjs/E-glas: ${this.formatPrice(extrasCost)}
- Extra timmar (${data.extraHours}h × 700kr): ${this.formatPrice(extraHoursCost)}
- Material (endast för ROT-beräkning): -
- Arbetsbeskrivning (${data.workDescription}): ${this.formatPrice(workDescriptionMarkup)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summa exkl. moms: ${this.formatPrice(subtotalExclVat)}
Moms (25%): ${this.formatPrice(vatCost)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Totalt inkl. moms: ${this.formatPrice(totalInclVat)}

ROT-AVDRAG INFORMATION:
- Fastighet berättigad: ${data.propertyRotEligible}
- Kund berättigad: ${data.customerRotEligible}
${data.hasRotDeduction ? `- Materialkostnad (${data.materialPercentage}%): ${this.formatPrice(materialCostForRot)}\n- Arbetskostnad: ${this.formatPrice(workCostForRot)}\n- ROT-avdrag (50% på arbetskostnad): -${this.formatPrice(rotDeduction)}` : '- ROT-avdrag: Ej tillämpligt'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KUNDEN BETALAR: ${this.formatPrice(finalCustomerPrice)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        
        formData.append('entry.calculated_price', priceBreakdown);
        
        return formData;
    }*/
    
    async submitToWebhook() {
        // Hämta alla beräknade värden
        const data = this.collectPricingData();
        const baseComponentsPrice = this.calculateBaseComponents(data);
        const renovationTypeCost = this.calculateRenovationTypeCost(data, baseComponentsPrice);
        const windowTypeCost = this.calculateWindowTypeCost(data, baseComponentsPrice);
        const extrasCost = this.calculateExtrasCost(data);
        const extraHoursCost = data.extraHours * CONFIG.HOURLY_RATE;
        const subtotalBeforeMaterial = baseComponentsPrice + renovationTypeCost + windowTypeCost + extrasCost + extraHoursCost;
        const workDescriptionMarkup = this.calculateWorkDescriptionMarkup(data, subtotalBeforeMaterial, extraHoursCost, 0);
        const subtotalExclVat = subtotalBeforeMaterial + workDescriptionMarkup;
        const vatCost = subtotalExclVat * CONFIG.EXTRAS.VAT_RATE;
        const totalInclVat = subtotalExclVat + vatCost;
        const materialCostForRot = totalInclVat * (data.materialPercentage / 100);
        const workCostForRot = totalInclVat - materialCostForRot;
        const rotDeduction = data.hasRotDeduction ? workCostForRot * CONFIG.EXTRAS.ROT_DEDUCTION : 0;
        const finalCustomerPrice = totalInclVat - rotDeduction;

        // Skapa webhook data-struktur
        const webhookData = {
            // Kunduppgifter
            kundNamn: document.getElementById('name').value || '',
            adress: document.getElementById('address').value || '',
            telefon: document.getElementById('phone').value || '',
            email: document.getElementById('email').value || '',
            
            // Projektdetaljer
            antalLuftare1: parseInt(document.getElementById('antal_1_luftare').value || 0),
            antalLuftare2: parseInt(document.getElementById('antal_2_luftare').value || 0),
            antalLuftare3: parseInt(document.getElementById('antal_3_luftare').value || 0),
            antalLuftare4: parseInt(document.getElementById('antal_4_luftare').value || 0),
            antalLuftare5: parseInt(document.getElementById('antal_5_luftare').value || 0),
            antalLuftare6: parseInt(document.getElementById('antal_6_luftare').value || 0),
            antalDörrpartier: parseInt(document.getElementById('antal_dorrpartier').value || 0),
            
            renoveringstyp: document.querySelector('input[name="arbetsbeskrivning"]:checked')?.value || '',
            fönsteröppning: document.querySelector('input[name="fonsteroppning"]:checked')?.value || '',
            fönstertyp: document.querySelector('input[name="typ_av_fonster"]:checked')?.value || '',
            
            // FÄRDIGA BERÄKNINGAR från appen
            grundprisExklMoms: Math.round(baseComponentsPrice),
            renoveringsPålägg: Math.round(renovationTypeCost),
            fönsterTypKostnad: Math.round(windowTypeCost),
            totaltExklMoms: Math.round(subtotalExclVat),
            moms: Math.round(vatCost),
            totaltInklMoms: Math.round(totalInclVat),
            materialkostnad: Math.round(materialCostForRot),
            rotAvdrag: Math.round(rotDeduction),
            slutpris: Math.round(finalCustomerPrice),
            
            // Meta
            timestamp: new Date().toISOString(),
            anbudsNummer: "SB-" + Date.now()
        };

        console.log('Skickar webhook data:', webhookData);

        // Webhook submission
        const response = await fetch(CONFIG.WEBHOOK_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(webhookData)
        });

        if (!response.ok) {
            throw new Error(`Webhook submission failed: ${response.status}`);
        }

        return true;
    }
    
    async handleArbetsbeskrivningSubmission() {
        const arbetsForm = document.getElementById('arbetsbeskrivning-form');
        if (!arbetsForm) return;
        
        // Validera formuläret
        if (!this.validateArbetsbeskrivningForm()) {
            return;
        }
        
        const submitBtn = document.getElementById('arb-submit-btn');
        const loadingSpinner = document.getElementById('arb-loading-spinner');
        
        this.setSubmitButtonLoading(true, submitBtn, loadingSpinner);
        
        try {
            // BORTTAGET: Google Forms arbetsbeskrivning submission
            // TODO: Implementera webhook för arbetsbeskrivningar om behövs
            /*
            const formData = this.collectArbetsbeskrivningData();
            await this.submitArbetsbeskrivningToGoogleForms(formData);
            */
            
            // Visa framgångsmeddelande
            this.showArbetsbeskrivningSuccessMessage();
            this.resetBothForms();
            
        } catch (error) {
            console.error('Fel vid skickning av arbetsbeskrivning:', error);
            this.showArbetsbeskrivningErrorMessage();
        } finally {
            this.setSubmitButtonLoading(false, submitBtn, loadingSpinner);
        }
    }
    
    validateArbetsbeskrivningForm() {
        const arbetsForm = document.getElementById('arbetsbeskrivning-form');
        if (!arbetsForm) return false;
        
        let isValid = true;
        
        // Validera obligatoriska fält
        const requiredFields = [
            { id: 'arb_typ_av_renovering', message: 'Vänligen välj renoveringstyp' },
            { id: 'arb-gdpr-consent', message: 'Du måste godkänna behandling av personuppgifter', type: 'checkbox' }
        ];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            const errorElement = document.getElementById(field.id + '-error');
            
            if (!element) return;
            
            let hasError = false;
            
            if (field.type === 'checkbox') {
                hasError = !element.checked;
            } else {
                hasError = !element.value || element.value.trim() === '';
            }
            
            if (hasError) {
                isValid = false;
                if (errorElement) {
                    errorElement.textContent = field.message;
                    errorElement.classList.add('show');
                }
                element.closest('.form-group')?.classList.add('error');
            } else {
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.classList.remove('show');
                }
                element.closest('.form-group')?.classList.remove('error');
            }
        });
        
        // Validera arbetsbeskrivning radio buttons
        const arbetsRadios = arbetsForm.querySelectorAll('input[name="arb_arbetsbeskrivning"]');
        const arbetsSelected = Array.from(arbetsRadios).some(radio => radio.checked);
        const arbetsErrorElement = document.getElementById('arb_arbetsbeskrivning-error');
        
        if (!arbetsSelected) {
            isValid = false;
            if (arbetsErrorElement) {
                arbetsErrorElement.textContent = 'Vänligen välj arbetsbeskrivning';
                arbetsErrorElement.classList.add('show');
            }
        } else {
            if (arbetsErrorElement) {
                arbetsErrorElement.textContent = '';
                arbetsErrorElement.classList.remove('show');
            }
        }
        
        return isValid;
    }
    
    // BORTTAGET: Google Forms arbetsbeskrivning data collection
    /*collectArbetsbeskrivningData() {
        const formData = new FormData();
        const arbetsForm = document.getElementById('arbetsbeskrivning-form');
        
        if (!arbetsForm) return formData;
        
        // Samla in alla arbetsbeskrivning fält
        Object.keys(CONFIG.ARBETSBESKRIVNING_FIELDS).forEach(fieldName => {
            let value = '';
            
            if (fieldName === 'arb-gdpr-consent') {
                const field = document.getElementById('arb-gdpr-consent');
                value = field && field.checked ? 'Ja' : 'Nej';
            } else {
                const field = arbetsForm.querySelector(`[name="${fieldName}"]`);
                
                if (field) {
                    if (field.type === 'radio') {
                        const selectedRadio = arbetsForm.querySelector(`input[name="${fieldName}"]:checked`);
                        value = selectedRadio ? selectedRadio.value : '';
                    } else {
                        value = field.value || '';
                    }
                }
            }
            
            if (value !== '') {
                formData.append(CONFIG.ARBETSBESKRIVNING_FIELDS[fieldName], value);
            }
        });
        
        // Samla in moment checklista data
        const momentData = this.collectMomentChecklistaData();
        if (momentData) {
            formData.append('entry.MOMENT_CHECKLISTA', momentData);
        }
        
        return formData;
    }*/
    
    collectMomentChecklistaData() {
        const checklistaContainer = document.getElementById('moment-checklista-container');
        if (!checklistaContainer) return '';
        
        const checkedItems = [];
        const checkboxes = checklistaContainer.querySelectorAll('input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            checkedItems.push(checkbox.value);
        });
        
        return checkedItems.length > 0 ? checkedItems.join('\n') : '';
    }
    
    // BORTTAGET: Google Forms arbetsbeskrivning submission
    /*async submitArbetsbeskrivningToGoogleForms(formData) {
        // Hämta renoveringstyp för att välja rätt form
        const renovationTypeSelect = document.getElementById('arb_typ_av_renovering');
        const renovationType = renovationTypeSelect ? renovationTypeSelect.value : '';
        
        // Välj rätt Google Forms URL
        let formUrl = CONFIG.ARBETSBESKRIVNING_FORMS[renovationType];
        
        if (!formUrl || formUrl.includes('EXAMPLE_')) {
            throw new Error('Google Forms URL är inte konfigurerad för denna renoveringstyp');
        }
        
        const response = await fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });
        
        return true;
    }*/
    
    showArbetsbeskrivningSuccessMessage() {
        const successMessage = document.getElementById('arb-success-message');
        if (successMessage) {
            successMessage.style.display = 'block';
            successMessage.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    showArbetsbeskrivningErrorMessage() {
        const errorMessage = document.getElementById('arb-error-message');
        if (errorMessage) {
            errorMessage.style.display = 'block';
            errorMessage.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    resetBothForms() {
        // Reset both forms
        this.resetForm();
        
        const arbetsForm = document.getElementById('arbetsbeskrivning-form');
        if (arbetsForm) {
            arbetsForm.reset();
        }
        
        // Clear localStorage data
        localStorage.removeItem('sternbecks_anbud_data');
        localStorage.removeItem('sternbecks_arbetsbeskrivning_data');
        
        // Hide moment checklista
        const checklistaSection = document.getElementById('moment-checklista-section');
        if (checklistaSection) {
            checklistaSection.style.display = 'none';
        }
        
        // Switch back to anbud tab
        this.switchTab('anbud');
        
        console.log('✅ Both forms reset and data cleared');
    }
    
    setSubmitButtonLoading(loading, submitBtn = null, loadingSpinner = null) {
        // Använd specifika knappar om angivna, annars använd default anbud-knappen
        const btn = submitBtn || this.submitBtn;
        const spinner = loadingSpinner || document.getElementById('loading-spinner');
        
        if (loading) {
            btn.classList.add('loading');
            btn.disabled = true;
            if (spinner) {
                spinner.style.display = 'block';
            }
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
            if (spinner) {
                spinner.style.display = 'none';
            }
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
        
        // Återställ materialkostnad till 0% (visas bara vid ROT)
        document.getElementById('materialkostnad').value = '0';
        
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
        
        // Försöksräknare
        this.attempts = 0;
        this.isLocked = false;
        
        this.initializePasswordProtection();
    }
    
    initializePasswordProtection() {
        // Kontrollera om användaren redan är inloggad
        if (this.checkExistingSession()) {
            this.grantAccess();
            return;
        }
        
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
    
    checkExistingSession() {
        try {
            const session = localStorage.getItem(PASSWORD_CONFIG.SESSION_KEY);
            if (session) {
                const sessionData = JSON.parse(session);
                // Kontrollera om sessionen fortfarande är giltig (lösenord matchar)
                return sessionData.authenticated === true && sessionData.password === PASSWORD_CONFIG.CORRECT_PASSWORD;
            }
        } catch (error) {
            console.warn('Fel vid kontroll av befintlig session:', error);
            localStorage.removeItem(PASSWORD_CONFIG.SESSION_KEY);
        }
        return false;
    }
    
    validatePassword() {
        if (this.isLocked) return;
        
        const enteredPassword = this.passwordInput.value;
        
        if (enteredPassword === PASSWORD_CONFIG.CORRECT_PASSWORD) {
            // Spara session i localStorage
            this.saveSession();
            this.grantAccess();
        } else {
            this.attempts++;
            this.showError();
            
            if (this.attempts >= PASSWORD_CONFIG.MAX_ATTEMPTS) {
                this.lockPassword();
            }
        }
    }
    
    saveSession() {
        try {
            const sessionData = {
                authenticated: true,
                password: PASSWORD_CONFIG.CORRECT_PASSWORD,
                timestamp: Date.now()
            };
            localStorage.setItem(PASSWORD_CONFIG.SESSION_KEY, JSON.stringify(sessionData));
        } catch (error) {
            console.warn('Kunde inte spara session:', error);
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
        let errorMessage = `Fel lösenord, försök igen (${this.attempts} av ${PASSWORD_CONFIG.MAX_ATTEMPTS} försök)`;
        
        if (this.attempts >= PASSWORD_CONFIG.MAX_ATTEMPTS) {
            errorMessage = `För många felaktiga försök. Klicka på "Försök igen" för att återställa.`;
        }
        
        this.passwordError.textContent = errorMessage;
        this.passwordError.style.display = 'block';
        this.passwordInput.value = '';
        
        if (!this.isLocked) {
            this.passwordInput.focus();
        }
    }
    
    lockPassword() {
        this.isLocked = true;
        this.passwordInput.disabled = true;
        
        // Kontrollera om reset-knappen redan finns
        let resetButton = document.getElementById('password-reset-btn');
        if (resetButton) {
            resetButton.remove();
        }
        
        // Skapa "Försök igen" knapp
        resetButton = document.createElement('button');
        resetButton.textContent = 'Försök igen';
        resetButton.id = 'password-reset-btn';
        resetButton.style.cssText = `
            background: #6c757d;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 1rem;
            display: block;
            width: 100%;
            transition: background-color 0.3s ease;
        `;
        
        resetButton.addEventListener('mouseenter', () => {
            resetButton.style.backgroundColor = '#5a6268';
        });
        
        resetButton.addEventListener('mouseleave', () => {
            resetButton.style.backgroundColor = '#6c757d';
        });
        
        resetButton.addEventListener('click', () => {
            this.resetPassword();
        });
        
        // Lägg till knappen efter lösenordsfältet
        this.passwordInput.parentNode.appendChild(resetButton);
    }
    
    resetPassword() {
        this.attempts = 0;
        this.isLocked = false;
        this.passwordInput.disabled = false;
        this.passwordError.style.display = 'none';
        this.passwordInput.focus();
        
        // Ta bort resetknappen
        const resetButton = document.getElementById('password-reset-btn');
        if (resetButton) {
            resetButton.remove();
        }
    }
    
    logout() {
        // Rensa localStorage session
        localStorage.removeItem(PASSWORD_CONFIG.SESSION_KEY);
        
        // Visa lösenordsskärmen igen
        this.mainApp.style.display = 'none';
        this.passwordOverlay.style.display = 'flex';
        
        // Återställ lösenordshantering
        this.attempts = 0;
        this.isLocked = false;
        this.passwordInput.disabled = false;
        this.passwordInput.value = '';
        this.passwordError.style.display = 'none';
        
        // Ta bort eventuell resetknapp
        const resetButton = document.getElementById('password-reset-btn');
        if (resetButton) {
            resetButton.remove();
        }
        
        // Fokusera på lösenordsfält
        setTimeout(() => {
            this.passwordInput.focus();
        }, 100);
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
        
        // Initialisera logout-knapp
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Är du säker på att du vill logga ut?')) {
                    this.logout();
                }
            });
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