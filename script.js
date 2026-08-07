// ============================================
// BYPASS - SISTEMA DE PROXY (VERSÃO SIMPLIFICADA)
// ============================================

(function() {
    'use strict';

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
        const proxyUrl = '/api/proxy?url=' + encodeURIComponent(clean);
        
        // Abre em nova aba
        window.open(proxyUrl, '_blank');
    }

    // Inicialização
    function init() {
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

        console.log('🚀 Bypass pronto!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
