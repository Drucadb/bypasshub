// ============================================
// BYPASS - SISTEMA DE PROXY (VERSÃO CORRIGIDA)
// ============================================

(function() {
    'use strict';

    const CONFIG = {
        baseUrl: window.location.origin,
        proxyPath: '/api/proxy?url=',
        debug: false
    };

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
        const proxyUrl = CONFIG.baseUrl + CONFIG.proxyPath + encodeURIComponent(clean);
        
        // Abre em nova aba
        window.open(proxyUrl, '_blank');
        
        if (CONFIG.debug) {
            console.log('[Bypass] Redirecionando para:', proxyUrl);
        }
    }

    function init() {
        console.log('🚀 Bypass iniciado!');

        // Botão "Ir"
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

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    goBtn.click();
                }
            });
        }

        // Atalhos
        document.querySelectorAll('.shortcut').forEach(function(el) {
            el.addEventListener('click', function() {
                const url = this.dataset.url;
                if (url) {
                    navigateTo(url);
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
