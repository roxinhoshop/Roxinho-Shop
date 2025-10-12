/**
 * @file config.js
 * @description Arquivo de configuração centralizado para a Roxinho Shop
 */

const API_CONFIG = {
    // URL base da API - altere aqui para mudar em todo o sistema
    BASE_URL: 'https://roxinho-shop-backend.vercel.app',
    
    // Endpoints da API
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/auth/login',
            REGISTER: '/api/auth/register',
            VERIFY_EMAIL: '/api/auth/verify-email'
        },
        PRODUCTS: {
            LIST: '/api/products',
            GET: '/api/products',
            CREATE: '/api/products',
            UPDATE: '/api/products',
            DELETE: '/api/products'
        },
        CATEGORIES: {
            LIST: '/api/categories',
            GET: '/api/categories',
            CREATE: '/api/categories',
            UPDATE: '/api/categories',
            DELETE: '/api/categories',
            ALL: '/api/categories/all'
        }
    },
    
    // Configurações de timeout
    TIMEOUT: 30000, // 30 segundos
    
    // Configurações de upload
    UPLOAD: {
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
}

