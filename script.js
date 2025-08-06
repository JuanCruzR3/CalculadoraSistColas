// Gestión del tema (claro/oscuro)
class ThemeManager {
    constructor() {
        // Lee el tema guardado en localStorage
        this.isDarkMode = localStorage.getItem('theme') === 'dark';
        this.init();
    }

    init() {
        this.updateTheme(); // Aplica el tema al cargar
        this.bindEvents();  // Asocia eventos a los botones de tema
    }

    bindEvents() {
        // Botones para cambiar el tema en móvil y escritorio
        const mobileThemeBtn = document.getElementById('mobile-theme-btn');
        const desktopThemeBtn = document.getElementById('desktop-theme-btn');

        mobileThemeBtn.addEventListener('click', () => this.toggleTheme());
        desktopThemeBtn.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        // Cambia entre modo claro y oscuro y lo guarda
        this.isDarkMode = !this.isDarkMode;
        this.updateTheme();
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }

    updateTheme() {
        // Aplica la clase 'dark' al body si corresponde
        if (this.isDarkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }
}

// Gestión de la navegación entre páginas/modelos
class NavigationManager {
    constructor() {
        this.currentPage = 'home'; // Página inicial
        this.init();
    }

    init() {
        this.bindEvents(); // Asocia eventos a la navegación
        this.showPage(this.currentPage); // Muestra la página inicial
    }

    bindEvents() {
        // Botones y elementos para abrir/cerrar el menú lateral en móvil
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
        const overlay = document.getElementById('overlay');
        const sidebar = document.getElementById('sidebar');

        mobileMenuBtn.addEventListener('click', () => this.openSidebar());
        sidebarCloseBtn.addEventListener('click', () => this.closeSidebar());
        overlay.addEventListener('click', () => this.closeSidebar());

        // Botones de navegación entre modelos
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.navigateTo(page);
                this.closeSidebar();
            });
        });
    }

    openSidebar() {
        // Abre el menú lateral y muestra el overlay
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
       
        sidebar.classList.add('open');
        overlay.classList.add('active');
    }

    closeSidebar() {
        // Cierra el menú lateral y oculta el overlay
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
       
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }

    navigateTo(page) {
        // Cambia de página/modelo
        this.currentPage = page;
        this.showPage(page);
        this.updateActiveNavItem(page);
    }

    showPage(page) {
        // Oculta todas las páginas y muestra la seleccionada
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.classList.remove('active'));
       
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    updateActiveNavItem(page) {
        // Actualiza el botón activo en la barra lateral
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });
    }
}

// Cálculos de los modelos de colas
class QueueCalculations {
    // Modelo M/M/1
    static calculateMM1({ lambda, mu }) {
        if (lambda >= mu) {
            throw new Error('El sistema es inestable: λ debe ser menor que μ');
        }

        const rho = lambda / mu;
        const P0 = 1 - rho;
        const L = rho / (1 - rho);
        const Lq = (rho * rho) / (1 - rho);
        const W = 1 / (mu - lambda);
        const Wq = rho / (mu - lambda);
     
        return { rho, P0, L, Lq, W, Wq };
    }

    // Modelo M/M/2 
static calculateMM2Updated({ lambda, mu1, mu2, pn }) {
    // Reordenamos para identificar el servidor más rápido/lento
    const mu_fast = Math.max(mu1, mu2);
    const mu_slow = Math.min(mu1, mu2);
    const mu_sum  = mu_fast + mu_slow; // tasa combinada cuando hay ≥2 en el sistema
  
    if (lambda <= 0 || mu_fast <= 0 || mu_slow <= 0) {
      throw new Error('λ, μ1 y μ2 deben ser mayores que 0');
    }
    if (lambda >= mu_sum) {
      throw new Error('El sistema es inestable: λ debe ser menor que μ1 + μ2');
    }
  
    // Utilización total del sistema
    const rho = lambda / mu_sum;       
    const r   = lambda / mu_sum;       
  
    const P0 = 1 / (1 + (lambda / mu_fast) / (1 - r));
  
    
    const P1 = (lambda / mu_fast) * P0;
  
   
    const L  = (lambda / mu_fast) * P0 / ((1 - r) * (1 - r));
  
    //  promedio en servicio
    const Ls = P1 + 2 * (1 - P0 - P1);
  
    // Cola promedio y tiempos
    const Lq = L - Ls;
    const Wq = Lq / lambda;
    const W  = L  / lambda;
  
    const results = { rho, P0, L, Lq, W, Wq };
  
    // Pn opcional
    if (pn !== undefined && pn !== null && pn !== '') {
      const n = parseInt(pn, 10);
      if (!isNaN(n) && n >= 0) {
        let PnValue;
        if (n === 0) {
          PnValue = P0;
        } else if (n === 1) {
          PnValue = P1;
        } else {
          // Para n≥2: Pn = (λ/μ_fast) * P0 * r^{n-1}
          PnValue = (lambda / mu_fast) * P0 * Math.pow(r, n - 1);
        }
        results.PnValue = PnValue;
      }
    }
  
    return results;
  }
  

    // Modelo M/M/1/N (capacidad finita)
    static calculateMM1N({ lambda, mu, N }) {
        const rho = lambda / mu;
       
        let P0;
        if (rho === 1) {
            P0 = 1 / (N + 1);
        } else {
            P0 = (1 - rho) / (1 - Math.pow(rho, N + 1));
        }
       
        const lambdaEff = lambda * (1 - Math.pow(rho, N) * P0);
       
        let L;
        if (rho === 1) {
            L = N / 2;
        } else {
            L = (rho * (1 - (N + 1) * Math.pow(rho, N) + N * Math.pow(rho, N + 1))) / 
                ((1 - rho) * (1 - Math.pow(rho, N + 1)));
        }
       
        const Lq = L - (lambdaEff / mu);
        const W = L / lambdaEff;
        const Wq = Lq / lambdaEff;
       
        return { rho, P0, L, Lq, W, Wq, lambdaEff };
    }

    // Modelo M/G/1 (servicio general)
    static calculateMG1({ lambda, mu, sigma, pax, pn }) {
        if (lambda >= mu) {
            throw new Error('El sistema es inestable: λ debe ser menor que μ');
        }
        
        const rho = lambda / mu;
        const P0 = 1 - rho;
       
        // Para M/G/1 usamos la fórmula de Pollaczek-Khinchine
        // Si no se proporciona sigma, asumimos distribución exponencial (sigma = 1/mu)
        const sigmaValue = sigma !== null && sigma !== undefined && sigma !== '' ? sigma : (1 / mu);
        const variance = sigmaValue * sigmaValue;
        
        const Lq = (lambda * lambda * variance + rho * rho) / (2 * (1 - rho));
        const L = Lq + rho;
        const Wq = Lq / lambda;
        const W = L / lambda;
       
        let results = { rho, P0, L, Lq, W, Wq };

        // Calcular Pax si se proporciona
        if (pax !== undefined && pax !== null && pax !== '') {
            const x = parseInt(pax);
            if (!isNaN(x) && x >= 0) {
                const PaxValue = Math.pow(rho, x);
                results.PaxValue = PaxValue;
            }
        }

        // Calcular Pn si se proporciona
        if (pn !== undefined && pn !== null && pn !== '') {
            const n = parseInt(pn);
            if (!isNaN(n) && n >= 0) {
                const PnValue = Math.pow(rho, n) * P0;
                results.PnValue = PnValue;
            }
        }

        return results;
    }

    // Modelo M/D/1 (servicio determinístico)
    static calculateMD1({ lambda, mu, pax, pn }) {
        if (lambda >= mu) {
            throw new Error('El sistema es inestable: λ debe ser menor que μ');
        }
       
        const rho = lambda / mu;
        const P0 = 1 - rho;
       
        const Lq = (rho * rho) / (2 * (1 - rho));
        const L = Lq + rho;
        const Wq = Lq / lambda;
        const W = L / lambda;
       
        let results = { rho, P0, L, Lq, W, Wq };

        // Calcular Pax si se proporciona
        if (pax !== undefined && pax !== null && pax !== '') {
            const x = parseInt(pax);
            if (!isNaN(x) && x >= 0) {
                const PaxValue = Math.pow(rho, x);
                results.PaxValue = PaxValue;
            }
        }

        // Calcular Pn si se proporciona
        if (pn !== undefined && pn !== null && pn !== '') {
            const n = parseInt(pn);
            if (!isNaN(n) && n >= 0) {
                const PnValue = Math.pow(rho, n) * P0;
                results.PnValue = PnValue;
            }
        }

        return results;
    }

    // Modelo M/M/1 actualizado
    static calculateMM1Updated({ lambda, mu, pax, pn }) {
        if (lambda >= mu) {
            throw new Error('El sistema es inestable: λ debe ser menor que μ');
        }

        const rho = lambda / mu;
        const P0 = 1 - rho;
        const L = rho / (1 - rho);
        const Lq = (rho * rho) / (1 - rho);
        const W = 1 / (mu - lambda);
        const Wq = rho / (mu - lambda);
     
        let results = { rho, P0, L, Lq, W, Wq };

        // Calcular Pax si se proporciona
        if (pax !== undefined && pax !== null && pax !== '') {
            const x = parseInt(pax);
            if (!isNaN(x) && x >= 0) {
                const PaxValue = Math.pow(rho, x);
                results.PaxValue = PaxValue;
            }
        }

        // Calcular Pn si se proporciona
        if (pn !== undefined && pn !== null && pn !== '') {
            const n = parseInt(pn);
            if (!isNaN(n) && n >= 0) {
                const PnValue = Math.pow(rho, n) * P0;
                results.PnValue = PnValue;
            }
        }

        return results;
    }


   // --- PRIORIDADES M/M/1 (no expulsivo), Clase 1 > Clase 2 ---
static calculateMM1PriorityPR({ lambda1, lambda2, mu }) {
    if (!lambda1 || lambda1 < 0 || !lambda2 || lambda2 < 0) {
        throw new Error('λ1 y λ2 deben ser valores positivos.');
    }
    if (!mu || mu <= 0) {
        throw new Error('μ debe ser mayor que 0.');
    }

    const lambdas = [lambda1, lambda2];
    const R = lambdas.length;
    const lambdaTot = lambda1 + lambda2;
    const rho = lambdaTot / mu;
    if (rho >= 1) throw new Error('Sistema inestable: Σλ debe ser menor que μ.');

    // ρ acumulados por clase
    const rhos = [];
    let acc = 0;
    for (let r = 0; r < R; r++) {
        acc += lambdas[r] / mu;
        rhos.push(acc);
    }

    let Lq_total = 0, L_total = 0;
    const perClass = [];

    for (let r = 0; r < R; r++) {
        const rho_prev = r === 0 ? 0 : rhos[r - 1];
        const rho_curr = rhos[r];
        const Wq_r = rho_prev / (mu * (1 - rho_curr) * (1 - rho_prev));
        const W_r  = Wq_r + 1 / mu;
        const Lq_r = lambdas[r] * Wq_r;
        const L_r  = lambdas[r] * W_r;

        Lq_total += Lq_r;
        L_total  += L_r;

        perClass.push({ classIndex: r + 1, lambda: lambdas[r], Wq: Wq_r, W: W_r, Lq: Lq_r, L: L_r });
    }

    const P0     = 1 - rho;
    const Wq_avg = Lq_total / lambdaTot;
    const W_avg  = L_total / lambdaTot;

    return { rho, P0, L: L_total, Lq: Lq_total, W: W_avg, Wq: Wq_avg, perClass };
}


}

// Gestión de la calculadora y formularios
class CalculatorManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents(); // Asocia eventos a los formularios
        this.bindNavClear(); // Limpia formularios y resultados al cambiar de pestaña 
        this.initTimeConverters(); // Inicializa los conversores de tiempo
        this.initMM2CalculationType(); // Inicializa el selector de tipo de cálculo M/M/2
    }

    // Inicializa el selector de tipo de cálculo para M/M/2
    initMM2CalculationType() {
        const calculationTypeSelect = document.getElementById('mm2-calculation-type');
        if (calculationTypeSelect) {
            // Mostrar campos iniciales
            this.toggleMM2CalculationType(calculationTypeSelect.value);
            
            calculationTypeSelect.addEventListener('change', (e) => {
                this.toggleMM2CalculationType(e.target.value);
            });
        }
    }

    // Cambia los campos visibles según el tipo de cálculo M/M/2
    toggleMM2CalculationType(type) {
        const standardNote = document.getElementById('mm2-standard-note');
        const thirdServerNote = document.getElementById('mm2-third-server-note');
        const mu1Group = document.getElementById('mm2-mu1-group');
        const mu2Group = document.getElementById('mm2-mu2-group');
        const muActualGroup = document.getElementById('mm2-mu-actual-group');
        const mu3Group = document.getElementById('mm2-mu3-group');
        
        // Verificar que todos los elementos existen
        if (!standardNote || !thirdServerNote || !mu1Group || !mu2Group || !muActualGroup || !mu3Group) {
            return;
        }
        
        // Limpiar campos al cambiar tipo
        document.getElementById('mm2-mu1').value = '';
        document.getElementById('mm2-mu2').value = '';
        document.getElementById('mm2-mu-actual').value = '';
        document.getElementById('mm2-mu3').value = '';
        
        if (type === 'evaluate-third') {
            // Mostrar campos para evaluación de tercer servidor
            standardNote.style.display = 'none';
            thirdServerNote.style.display = 'block';
            mu1Group.style.display = 'none';
            mu2Group.style.display = 'none';
            muActualGroup.style.display = 'block';
            mu3Group.style.display = 'block';
            
            // Cambiar etiquetas y hacer campos requeridos
            document.getElementById('mm2-mu-actual').required = true;
            document.getElementById('mm2-mu1').required = false;
            document.getElementById('mm2-mu2').required = false;
        } else {
            // Mostrar campos estándar M/M/2
            standardNote.style.display = 'block';
            thirdServerNote.style.display = 'none';
            mu1Group.style.display = 'block';
            mu2Group.style.display = 'block';
            muActualGroup.style.display = 'none';
            mu3Group.style.display = 'none';
            
            // Restaurar campos requeridos
            document.getElementById('mm2-mu1').required = true;
            document.getElementById('mm2-mu2').required = true;
            document.getElementById('mm2-mu-actual').required = false;
        }
    }

    // Inicializa los conversores de tiempo para todos los modelos
    initTimeConverters() {
        const models = ['mm1', 'mm2', 'mm1n', 'mg1', 'md1'];
        models.forEach(model => {
            this.bindTimeConverter(model);
        });
    }

    // Asocia eventos al conversor de tiempo de un modelo específico
    bindTimeConverter(model) {
        const valueInput = document.getElementById(`${model}-converter-value`);
        const fromSelect = document.getElementById(`${model}-converter-from`);
        const toSelect = document.getElementById(`${model}-converter-to`);
        const resultSpan = document.getElementById(`${model}-converter-result`);

        if (!valueInput || !fromSelect || !toSelect || !resultSpan) return;

        const updateConversion = () => {
            const value = parseFloat(valueInput.value);
            if (isNaN(value) || value < 0) {
                resultSpan.textContent = 'Resultado: -';
                return;
            }

            const fromUnit = fromSelect.value;
            const toUnit = toSelect.value;
            const convertedValue = this.convertTime(value, fromUnit, toUnit);
            
            resultSpan.textContent = `Resultado: ${convertedValue.toFixed(6)} ${this.getUnitLabel(toUnit)}`;
        };

        valueInput.addEventListener('input', updateConversion);
        fromSelect.addEventListener('change', updateConversion);
        toSelect.addEventListener('change', updateConversion);
    }

    // Convierte tiempo entre diferentes unidades
    convertTime(value, fromUnit, toUnit) {
        // Primero convertir a segundos
        let valueInSeconds;
        switch (fromUnit) {
            case 'seconds':
                valueInSeconds = value;
                break;
            case 'minutes':
                valueInSeconds = value * 60;
                break;
            case 'hours':
                valueInSeconds = value * 3600;
                break;
            default:
                valueInSeconds = value;
        }

        // Luego convertir de segundos a la unidad deseada
        switch (toUnit) {
            case 'seconds':
                return valueInSeconds;
            case 'minutes':
                return valueInSeconds / 60;
            case 'hours':
                return valueInSeconds / 3600;
            default:
                return valueInSeconds;
        }
    }

    // Obtiene la etiqueta de la unidad
    getUnitLabel(unit) {
        switch (unit) {
            case 'seconds':
                return 'segundos';
            case 'minutes':
                return 'minutos';
            case 'hours':
                return 'horas';
            default:
                return '';
        }
    }

    bindEvents() {
        // Para cada modelo, asocia el evento submit del formulario
        const forms = ['mm1', 'mm2', 'mm1n', 'mg1', 'md1', 'priority'];
        forms.forEach(model => {
            const form = document.getElementById(`${model}-form`);
            if (form) {
                form.addEventListener('submit', (e) => this.handleFormSubmit(e, model));
            }
        });
    }

         // Limpia formularios y resultados al cambiar de pestaña
    bindNavClear() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                this.clearAllFormsAndResults();
            });
        });
    }

    clearAllFormsAndResults() {
        const forms = ['mm1', 'mm2', 'mm1n', 'mg1', 'md1', 'priority'];
        forms.forEach(model => {
            // Limpiar campos de texto
            const form = document.getElementById(`${model}-form`);
            if (form) {
                form.reset();
            }
            // Ocultar resultados
            this.hideResults(model);
            // Ocultar errores
            this.hideError(model);
        });
    }

    handleFormSubmit(e, model) {
        e.preventDefault(); // Evita recargar la página
        try {
            // Lee los datos del formulario y los convierte a números
            const formData = new FormData(e.target);
            const inputs = {};
    
            for (let [key, value] of formData.entries()) {
                if (value.trim() !== '') {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue < 0) {
                        throw new Error(`Por favor ingrese un valor válido para ${key}`);
                    }
                    inputs[key] = numValue;
                } else {
                    inputs[key] = null; // campos opcionales
                }
            }

            // Validaciones por modelo
            if (model === 'priority') {
                const lambda1 = inputs.lambda1 || 0;
                const lambda2 = inputs.lambda2 || 0;
                const mu = inputs.mu;
    
                if ((lambda1 <= 0 && lambda2 <= 0)) {
                    throw new Error('Al menos una de las tasas de arribos (λ₁ o λ₂) debe ser mayor que 0');
                }
                if (!mu || mu <= 0) {
                    throw new Error('La tasa de servicio (μ) es obligatoria y debe ser mayor que 0');
                }
    
                // Estabilidad para M/M/1 con prioridades: (λ1 + λ2) / μ < 1
                const rhoTotal = (lambda1 + lambda2) / mu;
                if (rhoTotal >= 1) {
                    throw new Error('El sistema es inestable: (λ₁ + λ₂) debe ser menor que μ');
                }
            } else if (model === 'mm2') {
                const calculationType = inputs.calculationType || 'standard';
                
                if (!inputs.lambda || inputs.lambda <= 0) {
                    throw new Error('La tasa de arribos (λ) es obligatoria y debe ser mayor que 0');
                }
                
                if (calculationType === 'evaluate-third') {
                    if (!inputs.muActual || inputs.muActual <= 0) {
                        throw new Error('μ actual es obligatorio y debe ser mayor que 0');
                    }
                } else {
                    if (!inputs.mu1 || inputs.mu1 <= 0 || !inputs.mu2 || inputs.mu2 <= 0) {
                        throw new Error('Los tiempos de servicio μ1 y μ2 son obligatorios y deben ser mayores que 0');
                    }
                }
            } else {
                // Modelos existentes
                if (!inputs.lambda || inputs.lambda <= 0) {
                    throw new Error('La tasa de arribos (λ) es obligatoria y debe ser mayor que 0');
                }
                if (!inputs.mu || inputs.mu <= 0) {
                    throw new Error('El tiempo de servicio (μ) es obligatorio y debe ser mayor que 0');
                }
                if (model === 'mm1n' && (!inputs.N || inputs.N <= 0)) {
                    throw new Error('La capacidad máxima (N) es obligatoria y debe ser mayor que 0');
                }
            }

            if (model === 'priority') {
                const lambda1 = inputs.lambda1 || 0;
                const lambda2 = inputs.lambda2 || 0;
                const mu = inputs.mu;
            
                if (lambda1 <= 0 && lambda2 <= 0) {
                    throw new Error('Al menos una de las tasas de arribos (λ₁ o λ₂) debe ser mayor que 0');
                }
                if (!mu || mu <= 0) {
                    throw new Error('La tasa de servicio (μ) es obligatoria y debe ser mayor que 0');
                }
                const rhoTotal = (lambda1 + lambda2) / mu;
                if (rhoTotal >= 1) {
                    throw new Error('El sistema es inestable: (λ₁ + λ₂) debe ser menor que μ');
                }
            } else {
                // (deja validaciones existentes para los otros modelos)
            }
            

            // Cálculo por modelo
            let results;
            switch (model) {
                case 'mm1':
                    results = QueueCalculations.calculateMM1Updated(inputs);
                    break;
                case 'mm2':
                    const calculationType = inputs.calculationType || 'standard';
                    if (calculationType === 'evaluate-third') {
                        results = QueueCalculations.evaluateThirdServer(inputs);
                    } else {
                        results = QueueCalculations.calculateMM2Updated(inputs);
                    }
                    break;
                case 'mm1n':
                    results = QueueCalculations.calculateMM1N(inputs);
                    break;
                case 'mg1':
                    results = QueueCalculations.calculateMG1(inputs);
                    break;
                case 'md1':
                    results = QueueCalculations.calculateMD1(inputs);
                    break;
                    case 'priority':
                        results = QueueCalculations.calculateMM1PriorityPR({
                            lambda1: inputs.lambda1 || 0,
                            lambda2: inputs.lambda2 || 0,
                            mu: inputs.mu
                        });
                        break;                    
                default:
                    throw new Error('Modelo no reconocido');
            }
    
            this.displayResults(model, results); // Muestra los resultados
            this.hideError(model);               // Oculta errores previos
        } catch (error) {
            this.showError(model, error.message); // Muestra el error
            this.hideResults(model);              // Oculta resultados previos
        }
    }
    

    displayResults(model, results) {
        // Muestra los resultados en la sección correspondiente
        const resultsSection = document.getElementById(`${model}-results`);
        const resultsGrid = document.getElementById(`${model}-results-grid`);
        if (!resultsSection || !resultsGrid) return;
    
        // Etiquetas para cada métrica
        const labels = {
            rho: 'Factor de utilización (ρ)',
            rhoActual: 'Factor de utilización actual (ρ)',
            rhoNew: 'Factor de utilización con 3er servidor (ρ)',
            P0: 'Probabilidad de sistema vacío (P₀)',
            P0Actual: 'Probabilidad sistema vacío actual (P₀)',
            P0New: 'Probabilidad sistema vacío con 3er servidor (P₀)',
            L: 'Número promedio de clientes en el sistema (L)',
            LActual: 'Clientes promedio en sistema actual (L)',
            LNew: 'Clientes promedio con 3er servidor (L)',
            Lq: 'Número promedio de clientes en cola (Lq)',
            LqActual: 'Clientes promedio en cola actual (Lq)',
            LqNew: 'Clientes promedio en cola con 3er servidor (Lq)',
            W: 'Tiempo promedio en el sistema (W)',
            WActual: 'Tiempo promedio en sistema actual (W)',
            WNew: 'Tiempo promedio en sistema con 3er servidor (W)',
            Wq: 'Tiempo promedio en cola (Wq)',
            WqActual: 'Tiempo promedio en cola actual (Wq)',
            WqNew: 'Tiempo promedio en cola con 3er servidor (Wq)',
            lambdaEff: 'Tasa efectiva de llegadas (λₑ)',
            PaxValue: 'Probabilidad de al menos x clientes (Pax)',
            PnValue: 'Probabilidad de n clientes (Pn)',
        };
    
        resultsGrid.innerHTML = '';
    
        // Mostrar resultados numéricos
        Object.entries(results).forEach(([key, value]) => {
            if (typeof value === 'function') return;
            if (key === 'perClass') return;
            if (key === 'thirdServerAnalysis') return;
            if (key === 'systemType') return;
    
            if (Number.isFinite(value)) {
                const resultCard = document.createElement('div');
                resultCard.className = 'result-card';
                resultCard.innerHTML = `
                    <div class="result-label">${labels[key] || key}</div>
                    <div class="result-value">${this.formatNumber(value)}</div>
                `;
                resultsGrid.appendChild(resultCard);
            }
        });
    
        // Mostrar análisis del tercer servidor si existe
        if (results.thirdServerAnalysis) {
            const analysisCard = document.createElement('div');
            analysisCard.className = 'result-card';
            analysisCard.style.gridColumn = 'span 2';
            
            if (results.thirdServerAnalysis.viable) {
                analysisCard.innerHTML = `
                    <div class="result-label">Análisis del Tercer Servidor</div>
                    <div class="result-value">
                        <strong>${results.thirdServerAnalysis.recommendation}</strong><br>
                        Mejora en Lq: ${results.thirdServerAnalysis.improvementLq.toFixed(2)}%<br>
                        Mejora en Wq: ${results.thirdServerAnalysis.improvementWq.toFixed(2)}%
                    </div>
                `;
            } else {
                analysisCard.innerHTML = `
                    <div class="result-label">Análisis del Tercer Servidor</div>
                    <div class="result-value">
                        <strong>No viable:</strong> ${results.thirdServerAnalysis.reason}
                    </div>
                `;
            }
            resultsGrid.appendChild(analysisCard);
        }

        // --- Bloque extra para Prioridades (por clase) ---
        if (model === 'priority' && Array.isArray(results.perClass)) {
            const classGrid = document.getElementById('priority-class-grid');
            if (classGrid) {
                classGrid.innerHTML = '';
                results.perClass.forEach(cls => {
                    const card = document.createElement('div');
                    card.className = 'result-card';
                    card.innerHTML = `
                        <div class="result-label">Clase ${cls.classIndex}</div>
                        <div class="result-value">
                            λ=${this.formatNumber(cls.lambda)} |
                            Lq=${this.formatNumber(cls.Lq)} |
                            L=${this.formatNumber(cls.L)} |
                            Wq=${this.formatNumber(cls.Wq)} |
                            W=${this.formatNumber(cls.W)}
                        </div>
                    `;
                    classGrid.appendChild(card);
                });
            }
        }

        // Render por clase solo para prioridades
if (model === 'priority' && Array.isArray(results.perClass)) {
    const classGrid = document.getElementById('priority-class-grid');
    if (classGrid) {
        classGrid.innerHTML = '';
        results.perClass.forEach(cls => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <div class="result-label">Clase ${cls.classIndex}</div>
                <div class="result-value">
                    λ=${this.formatNumber(cls.lambda)} |
                    Lq=${this.formatNumber(cls.Lq)} |
                    L=${this.formatNumber(cls.L)} |
                    Wq=${this.formatNumber(cls.Wq)} |
                    W=${this.formatNumber(cls.W)}
                </div>
            `;
            classGrid.appendChild(card);
        });
    }
}
    
        resultsSection.style.display = 'block';
    }
    

    // Modelo M/M/2 actualizado
    static calculateMM2Updated({ lambda, mu1, mu2, pn }) {
        const muTotal = mu1 + mu2;
        if (lambda >= muTotal) {
            throw new Error('El sistema es inestable: λ debe ser menor que μ1 + μ2');
        }

        const rho = lambda / muTotal;
        const P0 = 1 / (1 + rho + (rho * rho) / (2 - rho));
       
        const Lq = (rho * rho * rho * P0) / (2 * (2 - rho) * (2 - rho));
        const L = Lq + rho;
        const Wq = Lq / lambda;
        const W = L / lambda;

        let results = { rho, P0, L, Lq, W, Wq };

        // Calcular Pn si se proporciona
        if (pn !== undefined && pn !== null && pn !== '') {
            const n = parseInt(pn);
            if (!isNaN(n) && n >= 0) {
                let PnValue;
                if (n === 0) {
                    PnValue = P0;
                } else if (n === 1) {
                    PnValue = rho * P0;
                } else {
                    PnValue = (Math.pow(rho, n) / Math.pow(2, n - 1)) * P0;
                }
                results.PnValue = PnValue;
            }
        }

        return results;

        // Etiquetas para cada métrica
        const labels = {
            rho: 'Factor de utilización (ρ)',
            P0: 'Probabilidad de sistema vacío (P₀)',
            L: 'Número promedio de clientes en el sistema (L)',
            Lq: 'Número promedio de clientes en cola (Lq)',
            W: 'Tiempo promedio en el sistema (W)',
            Wq: 'Tiempo promedio en cola (Wq)',
            lambdaEff: 'Tasa efectiva de llegadas (λₑ)',
            PaxValue: 'Probabilidad de al menos x clientes (Pax)',
            PnValue: 'Probabilidad de n clientes (Pn)',
        };

        resultsGrid.innerHTML = '';
       
        Object.entries(results).forEach(([key, value]) => {
          
            if (typeof value === 'function') return;

            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
          
            resultCard.innerHTML = `
                <div class="result-label">${labels[key] || key}</div>
                <div class="result-value">${this.formatNumber(value)}</div>
            `;
          
            resultsGrid.appendChild(resultCard);
        });

        resultsSection.style.display = 'block';
    }

    hideResults(model) {
        // Oculta la sección de resultados
        const resultsSection = document.getElementById(`${model}-results`);
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
    }

    showError(model, message) {
        // Muestra un mensaje de error en el formulario
        const errorElement = document.getElementById(`${model}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    hideError(model) {
        // Oculta el mensaje de error
        const errorElement = document.getElementById(`${model}-error`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    formatNumber(num) {
        // Formatea los números a 6 decimales
        return num.toFixed(6);
    }
}

// Inicializa la aplicación cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new NavigationManager();
    new CalculatorManager();
});