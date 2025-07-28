// Theme Management
class ThemeManager {
    constructor() {
        this.isDarkMode = localStorage.getItem('theme') === 'dark';
        this.init();
    }

    init() {
        this.updateTheme();
        this.bindEvents();
    }

    bindEvents() {
        const mobileThemeBtn = document.getElementById('mobile-theme-btn');
        const desktopThemeBtn = document.getElementById('desktop-theme-btn');

        mobileThemeBtn.addEventListener('click', () => this.toggleTheme());
        desktopThemeBtn.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.updateTheme();
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }

    updateTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.bindEvents();
        this.showPage(this.currentPage);
    }

    bindEvents() {
        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
        const overlay = document.getElementById('overlay');
        const sidebar = document.getElementById('sidebar');

        mobileMenuBtn.addEventListener('click', () => this.openSidebar());
        sidebarCloseBtn.addEventListener('click', () => this.closeSidebar());
        overlay.addEventListener('click', () => this.closeSidebar());

        // Navigation items
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
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        sidebar.classList.add('open');
        overlay.classList.add('active');
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }

    navigateTo(page) {
        this.currentPage = page;
        this.showPage(page);
        this.updateActiveNavItem(page);
    }

    showPage(page) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.classList.remove('active'));

        // Show selected page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    updateActiveNavItem(page) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });
    }
}

// Queue Calculations
class QueueCalculations {
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

    static calculateMM2({ lambda, mu }) {
        if (lambda >= 2 * mu) {
            throw new Error('El sistema es inestable: λ debe ser menor que 2μ');
        }

        const rho = lambda / mu;
        const P0 = 1 / (1 + rho + (rho * rho) / (2 - rho));
        
        const Lq = (rho * rho * rho * P0) / (2 * (2 - rho) * (2 - rho));
        const L = Lq + rho;
        const Wq = Lq / lambda;
        const W = L / lambda;

        return { rho, P0, L, Lq, W, Wq };
    }

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

    static calculateMG1({ lambda, mu, sigma2 }) {
        if (lambda >= mu) {
            throw new Error('El sistema es inestable: λ debe ser menor que μ');
        }

        const rho = lambda / mu;
        const P0 = 1 - rho;
        
        const Lq = (lambda * lambda * sigma2 + rho * rho) / (2 * (1 - rho));
        const L = Lq + rho;
        const Wq = Lq / lambda;
        const W = L / lambda;

        return { rho, P0, L, Lq, W, Wq };
    }

    static calculateMD1({ lambda, mu }) {
        if (lambda >= mu) {
            throw new Error('El sistema es inestable: λ debe ser menor que μ');
        }

        const rho = lambda / mu;
        const P0 = 1 - rho;
        
        const Lq = (rho * rho) / (2 * (1 - rho));
        const L = Lq + rho;
        const Wq = Lq / lambda;
        const W = L / lambda;

        return { rho, P0, L, Lq, W, Wq };
    }
}

// Calculator Management
class CalculatorManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Bind form submissions
        const forms = ['mm1', 'mm2', 'mm1n', 'mg1', 'md1'];
        forms.forEach(model => {
            const form = document.getElementById(`${model}-form`);
            if (form) {
                form.addEventListener('submit', (e) => this.handleFormSubmit(e, model));
            }
        });
    }

    handleFormSubmit(e, model) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const inputs = {};
            
            for (let [key, value] of formData.entries()) {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue <= 0) {
                    throw new Error(`Por favor ingrese un valor válido para ${key}`);
                }
                inputs[key] = numValue;
            }

            let results;
            switch (model) {
                case 'mm1':
                    results = QueueCalculations.calculateMM1(inputs);
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
                default:
                    throw new Error('Modelo no reconocido');
            }

            this.displayResults(model, results);
            this.hideError(model);

        } catch (error) {
            this.showError(model, error.message);
            this.hideResults(model);
        }
    }

    displayResults(model, results) {
        const resultsSection = document.getElementById(`${model}-results`);
        const resultsGrid = document.getElementById(`${model}-results-grid`);
        
        if (!resultsSection || !resultsGrid) return;

        const labels = {
            rho: 'Factor de utilización (ρ)',
            P0: 'Probabilidad de sistema vacío (P₀)',
            L: 'Número promedio de clientes en el sistema (L)',
            Lq: 'Número promedio de clientes en cola (Lq)',
            W: 'Tiempo promedio en el sistema (W)',
            Wq: 'Tiempo promedio en cola (Wq)',
            lambdaEff: 'Tasa efectiva de llegadas (λₑ)',
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
        const resultsSection = document.getElementById(`${model}-results`);
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
    }

    showError(model, message) {
        const errorElement = document.getElementById(`${model}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    hideError(model) {
        const errorElement = document.getElementById(`${model}-error`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    formatNumber(num) {
        return num.toFixed(6);
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new NavigationManager();
    new CalculatorManager();
});