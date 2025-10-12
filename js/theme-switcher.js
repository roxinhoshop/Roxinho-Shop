/**
 * @file theme-switcher.js
 * @description Sistema de alternância entre Dark Mode e Light Mode
 */

/**
 * Inicializa o tema baseado na preferência salva ou do sistema
 */
function initTheme() {
    // Verificar se há tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // Usar tema salvo
        setTheme(savedTheme);
    } else {
        // Detectar preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Atualizar ícone do botão
    updateThemeIcon();
}

/**
 * Define o tema
 * @param {string} theme - 'light' ou 'dark'
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon();
}

/**
 * Alterna entre light e dark mode
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    setTheme(newTheme);
    
    // Mostrar notificação
    const themeName = newTheme === 'dark' ? 'Modo Escuro' : 'Modo Claro';
    if (typeof showNotification === 'function') {
        showNotification(`${themeName} ativado!`, 'info', 2000);
    }
}

/**
 * Atualiza o ícone do botão de tema
 */
function updateThemeIcon() {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) {
        // Se o ícone não existe ainda, tentar novamente em 100ms
        setTimeout(updateThemeIcon, 100);
        return;
    }
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    if (currentTheme === 'dark') {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
}

/**
 * Observa quando o header é carregado e atualiza o ícone
 */
function observeHeaderLoad() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                // Header foi adicionado, atualizar ícone
                updateThemeIcon();
            }
        });
    });
    
    observer.observe(headerPlaceholder, {
        childList: true,
        subtree: true
    });
}

/**
 * Detecta mudanças na preferência do sistema
 */
function watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
        // Apenas atualizar se não houver preferência salva
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// Inicializar tema ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    watchSystemTheme();
    observeHeaderLoad();
});

// Também atualizar quando a página for mostrada (navegação back/forward)
window.addEventListener('pageshow', () => {
    updateThemeIcon();
});

// Exportar funções
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;

