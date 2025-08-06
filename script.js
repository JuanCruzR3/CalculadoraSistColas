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
    static calculateMM2({ lambda, mu1, mu2, pn }) {
        if (lambda <= 0 || mu1 <= 0 || mu2 <= 0) {
            throw new Error('λ, μ1 y μ2 deben ser mayores que 0');
        }
        
        const muSum = mu1 + mu2;
        if (lambda >= muSum) {
            throw new Error('El sistema es inestable: λ debe ser menor que μ1 + μ2');
        }
        
        const rho = lambda / muSum;
        
        // Cálculo correcto para M/M/2
        const P0 = 1 / (1 + rho + (rho * rho) / (2 * (1 - rho)));
        const Lq = (rho * rho * rho) / (2 * (1 - rho) * (1 + rho + (rho * rho) / (2 * (1 - rho))));
        const L = Lq + rho;
        const Wq = Lq / lambda;
        const W = L / lambda;
        
        let results = { rho, P0, L, Lq, W, Wq };
        
        // Calcular Pn si se proporciona
        if (pn !== undefined && pn !== null && pn !== '') {
            const n = parseInt(pn, 10);
            if (!isNaN(n) && n >= 0) {
                let PnValue;
                if (n === 0) {
                    PnValue = P0;
                } else {
                    PnValue = Math.pow(rho, n) * P0;
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
        const lambda_r = lambdas[r];
        const rho_r = lambda_r / mu;
        const rho_acc = rhos[r];

        // Wq para clase r
        const Wq_r = rho_acc / (mu * (1 - rho_acc) * (1 - (r > 0 ? rhos[r - 1] : 0)));
        const W_r = Wq_r + (1 / mu);

        const Lq_r = lambda_r * Wq_r;
        const L_r = lambda_r * W_r;

        Lq_total += Lq_r;
        L_total += L_r;

        perClass.push({
            classIndex: r + 1,
            lambda: lambda_r,
            Lq: Lq_r,
            L: L_r,
            Wq: Wq_r,
            W: W_r
        });
    }

    const P0 = 1 - rho;
    const W_total = L_total / lambdaTot;
    const Wq_total = Lq_total / lambdaTot;

    return {
        rho,
        P0,
        L: L_total,
        Lq: Lq_total,
        W: W_total,
        Wq: Wq_total,
        perClass
    };
}
}

// Gestión de calculadoras y formularios
class CalculatorManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.bindNavClear();
        this.initTimeConverters();
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
        const formData = new FormData(e.target);
        const inputs = {};

        for (let [key, value] of formData.entries()) {
            if (value.trim() !== '') {
                // 👉 Si es calculationType, lo dejamos como texto
                if (key === 'calculationType') {
                    inputs[key] = value;
                } else {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue < 0) {
                        throw new Error(`Por favor ingrese un valor válido para ${key}`);
                    }
                    inputs[key] = numValue;
                }
            } else {
                inputs[key] = null; // campos opcionales
            }
        }

        // Validaciones específicas por modelo
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
        } else if (model !== 'mm2') {
            // Validaciones para otros modelos
            if (!inputs.lambda || inputs.lambda <= 0) {
                throw new Error('La tasa de arribos (λ) es obligatoria y debe ser mayor que 0');
            }
            if (!inputs.mu || inputs.mu <= 0) {
                throw new Error('La tasa de servicio (μ) es obligatoria y debe ser mayor que 0');
            }
            if (model === 'mm1n' && (!inputs.N || inputs.N <= 0)) {
                throw new Error('La capacidad máxima (N) es obligatoria y debe ser mayor que 0');
            }
        } else if (model === 'mm2') {
            // Validación extra para mm2
            if (!['standard', 'evaluate-third'].includes(inputs.calculationType)) {
                throw new Error('Por favor seleccione un tipo de cálculo válido.');
            }
            if (!inputs.lambda || !inputs.mu1 || !inputs.mu2) {
                throw new Error('Debe completar λ, μ1 y μ2');
            }
        }

        // Cálculo por modelo
        let results;
        switch (model) {
            case 'mm1':
                results = QueueCalculations.calculateMM1Updated(inputs);
                break;
            case 'mm2':
                results = QueueCalculations.calculateMM2(inputs);
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
            recomendacion: 'Recomendación',
            PaxValue: 'Probabilidad de al menos x clientes (Pax)',
            PnValue: 'Probabilidad de n clientes (Pn)',
        };
    
        resultsGrid.innerHTML = '';
    
        // Mostrar resultados numéricos
        Object.entries(results).forEach(([key, value]) => {
            if (typeof value === 'function') return;
            if (key === 'perClass') return;
            if (key === 'recomendacion') {
                const resultCard = document.createElement('div');
                resultCard.className = 'result-card';
                resultCard.innerHTML = `
                    <div class="result-label">${labels[key] || key}</div>
                    <div class="result-value" style="font-weight: bold; color: ${value.includes('Recomendado') ? '#10b981' : value.includes('Considerar') ? '#f59e0b' : '#ef4444'}">${value}</div>
                `;
                resultsGrid.appendChild(resultCard);
                return;
            }
    
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