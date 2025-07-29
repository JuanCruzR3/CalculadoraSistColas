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
    static calculateMM2({ lambda, mu }) {
        if (lambda >= 2 * mu1) {
            throw new Error('El sistema es inestable: λ debe ser menor que 2μ1');
        }

        const rho1 = lambda / mu1;
        const rho2 = lambda / mu2;
        const rho = (rho1 + rho2) / 2; // Promedio para compatibilidad
        const P0 = 1 / (1 + rho + (rho * rho) / (2 - rho));
       
        const Lq = (rho * rho * rho * P0) / (2 * (2 - rho) * (2 - rho));
        const L = Lq + rho;
        const Wq = Lq / lambda;
        const W = L / lambda;
       
        return { rho, P0, L, Lq, W, Wq };
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
    static calculateMG1({ lambda, mu, pax, pn }) {
        if (lambda >= mu) {
            throw new Error('El sistema es inestable: λ debe ser menor que μ');
        }
        
        const rho = lambda / mu;
        const P0 = 1 - rho;
       
        // Para M/G/1 sin varianza específica, usamos la fórmula básica
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
}

// Gestión de la calculadora y formularios
class CalculatorManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents(); // Asocia eventos a los formularios
    }

    bindEvents() {
        // Para cada modelo, asocia el evento submit del formulario
        const forms = ['mm1', 'mm2', 'mm1n', 'mg1', 'md1'];
        forms.forEach(model => {
            const form = document.getElementById(`${model}-form`);
            if (form) {
                form.addEventListener('submit', (e) => this.handleFormSubmit(e, model));
            }
        });
    }

    handleFormSubmit(e, model) {
        e.preventDefault(); // Evita recargar la página
        try {
            // Lee los datos del formulario y los convierte a números
            const formData = new FormData(e.target);
            const inputs = {};
           
            for (let [key, value] of formData.entries()) {
                // Solo validar campos requeridos
                if (value.trim() !== '') {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue < 0) {
                        throw new Error(`Por favor ingrese un valor válido para ${key}`);
                    }
                    inputs[key] = numValue;
                } else {
                    // Para campos opcionales, asignar null
                    inputs[key] = null;
                }
            }

            // Validar campos obligatorios
            if (!inputs.lambda || inputs.lambda <= 0) {
                throw new Error('La tasa de arribos (λ) es obligatoria y debe ser mayor que 0');
            }
            if (!inputs.mu || inputs.mu <= 0) {
                throw new Error('El tiempo de servicio (μ) es obligatorio y debe ser mayor que 0');
            }
            if (model === 'mm2' && (!inputs.mu1 || inputs.mu1 <= 0 || !inputs.mu2 || inputs.mu2 <= 0)) {
                throw new Error('Los tiempos de servicio μ1 y μ2 son obligatorios y deben ser mayores que 0');
            }
            if (model === 'mm1n' && (!inputs.N || inputs.N <= 0)) {
                throw new Error('La capacidad máxima (N) es obligatoria y debe ser mayor que 0');
            }
            // Llama al cálculo correspondiente según el modelo
            let results;
            switch (model) {
                case 'mm1':
                    results = QueueCalculations.calculateMM1Updated(inputs);
                    break;
                case 'mm2':
                    results = QueueCalculations.calculateMM2Updated(inputs);
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