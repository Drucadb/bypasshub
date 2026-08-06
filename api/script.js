// ============================================
// BYPASS - SISTEMA DE PROXY
// ============================================

(function() {
    'use strict';

    // ============================================
    // CONFIGURAÇÕES
    // ============================================
    const CONFIG = {
        baseUrl: window.location.origin,
        proxyPath: '/proxy/',
        debug: false
    };

    // ============================================
    // FUNÇÃO PRINCIPAL - REDIRECIONAR
    // ============================================
    function navigateTo(url) {
        // Limpa a URL
        let clean = url
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/+$/, '');
        
        // Se não tiver domínio, adiciona .com
        if (!clean.includes('.')) {
            clean += '.com';
        }
        
        // Monta a URL do proxy
        const proxyUrl = CONFIG.baseUrl + CONFIG.proxyPath + clean;
        
        // Abre em nova aba
        window.open(proxyUrl, '_blank');
        
        // Log de debug
        if (CONFIG.debug) {
            console.log('[Bypass] Redirecionando para:', proxyUrl);
        }
    }

    // ============================================
    // INICIALIZAÇÃO DOS ELEMENTOS
    // ============================================
    function init() {
        // 1. Botão "Ir"
        const goBtn = document.getElementById('goButton');
        const input = document.getElementById('urlInput');

        if (goBtn && input) {
            goBtn.addEventListener('click', function() {
                const url = input.value.trim();
                if (url) {
                    navigateTo(url);
                    input.value = '';
                }
            });

            // Tecla Enter
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    goBtn.click();
                }
            });
        }

        // 2. Atalhos
        document.querySelectorAll('.shortcut').forEach(function(el) {
            el.addEventListener('click', function() {
                const url = this.dataset.url;
                if (url) {
                    navigateTo(url);
                }
            });
        });

        // 3. Partículas
        createParticles();

        // Mensagem no console
        console.log('🚀 Bypass ativado!');
        console.log('📡 Proxy em:', CONFIG.baseUrl);
    }

    // ============================================
    // PARTÍCULAS
    // ============================================
    function createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        const count = 50;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            const size = Math.random() * 4 + 2;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.animationDuration = (Math.random() * 15 + 10) + 's';
            p.style.animationDelay = (Math.random() * 10) + 's';
            p.style.opacity = Math.random() * 0.5 + 0.1;
            container.appendChild(p);
        }
    }

    // ============================================
    // INICIA QUANDO A PÁGINA CARREGAR
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();