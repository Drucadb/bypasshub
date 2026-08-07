// ============================================
// PROXY SIMPLIFICADO PARA VERCEL
// ============================================

export default async function handler(req, res) {
    // Só aceita GET
    if (req.method !== 'GET') {
        return res.status(405).send('Método não permitido');
    }

    const urlParam = req.query.url;
    
    if (!urlParam) {
        return res.status(400).send(`
            <html><body style="font-family:Arial;text-align:center;padding:50px;background:#0a0a12;color:#fff;">
                <h1 style="color:#7b2ffc;">❌ Erro</h1>
                <p>Digite uma URL! Ex: /api/proxy?url=youtube.com</p>
                <a href="/" style="color:#7b2ffc;">← Voltar</a>
            </body></html>
        `);
    }

    try {
        // Monta a URL final
        let finalUrl = urlParam;
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }

        console.log('🔄 Acessando:', finalUrl);

        // Faz a requisição
        const response = await fetch(finalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Pega o conteúdo como texto
        let html = await response.text();

        // CORREÇÃO DE LINKS - a parte mais importante!
        const baseUrl = finalUrl.replace(/\/[^/]*$/, '/');

        // Corrige todos os links (src, href, action)
        html = html.replace(
            /(src|href|action)=["']([^"']*?)["']/gi,
            (match, attr, value) => {
                // Ignora links que já são absolutos ou javascript
                if (value.startsWith('http://') || 
                    value.startsWith('https://') || 
                    value.startsWith('javascript:') || 
                    value.startsWith('#')) {
                    return match;
                }
                // Se for protocolo relativo (//site.com)
                if (value.startsWith('//')) {
                    return `${attr}="https:${value}"`;
                }
                // Se for caminho absoluto (/caminho)
                if (value.startsWith('/')) {
                    return `${attr}="${baseUrl}${value.substring(1)}"`;
                }
                // Se for caminho relativo (caminho/outro)
                return `${attr}="${baseUrl}${value}"`;
            }
        );

        // Adiciona uma base tag no head
        html = html.replace(
            /<head>/i,
            `<head><base href="${finalUrl}/">`
        );

        // Remove políticas de segurança que quebram o proxy
        html = html.replace(/<meta[^>]*Content-Security-Policy[^>]*>/gi, '');
        html = html.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');

        // Adiciona um script para corrigir cliques em links
        html = html.replace(
            /<\/body>/i,
            `
            <script>
                document.addEventListener('click', function(e) {
                    const link = e.target.closest('a');
                    if (link && link.href && !link.href.startsWith('javascript:')) {
                        const url = link.href;
                        // Se não for do nosso domínio, redireciona pelo proxy
                        if (!url.includes(window.location.origin)) {
                            e.preventDefault();
                            window.open('/api/proxy?url=' + encodeURIComponent(url), '_blank');
                        }
                    }
                });
            </script>
            </body>
            `
        );

        // Retorna o HTML corrigido
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(html);

    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        // Se for erro de timeout ou conexão
        if (error.message.includes('timeout') || error.message.includes('fetch')) {
            return res.status(504).send(`
                <html><body style="font-family:Arial;text-align:center;padding:50px;background:#0a0a12;color:#fff;">
                    <h1 style="color:#f59e0b;">⏱️ Tempo esgotado</h1>
                    <p>O site demorou para responder. Tente novamente.</p>
                    <p style="color:#6b7280;font-size:0.8rem;">Dica: sites mais simples como google.com funcionam melhor</p>
                    <a href="/" style="color:#7b2ffc;">← Voltar</a>
                </body></html>
            `);
        }

        res.status(500).send(`
            <html><body style="font-family:Arial;text-align:center;padding:50px;background:#0a0a12;color:#fff;">
                <h1 style="color:#ef4444;">❌ Erro ao acessar</h1>
                <p>Não foi possível acessar: ${urlParam}</p>
                <p style="color:#6b7280;font-size:0.8rem;">Erro: ${error.message}</p>
                <br>
                <a href="/" style="color:#7b2ffc;">← Voltar para o Bypass</a>
            </body></html>
        `);
    }
}
