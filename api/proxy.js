// ============================================
// PROXY OTIMIZADO PARA VERCEL
// ============================================

export default async function handler(req, res) {
    // 1. Pega a URL da query string
    const urlParam = req.query.url;
    
    // 2. Se não tiver URL, mostra erro
    if (!urlParam) {
        return res.status(400).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Erro - Bypass</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; background: #0a0a12; color: #fff; }
                    h1 { color: #7b2ffc; }
                    a { color: #7b2ffc; text-decoration: none; }
                </style>
            </head>
            <body>
                <h1>❌ Erro</h1>
                <p>Digite uma URL! Ex: /api/proxy?url=youtube.com</p>
                <a href="/">← Voltar para o Bypass</a>
            </body>
            </html>
        `);
    }
    
    try {
        // 3. Limpa a URL
        let finalUrl = urlParam;
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }
        
        console.log('🔄 Proxy acessando:', finalUrl);
        
        // 4. Faz a requisição com headers realistas
        const response = await fetch(finalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            // Timeout maior
            signal: AbortSignal.timeout(15000)
        });
        
        // 5. Pega o conteúdo
        let text = await response.text();
        
        // 6. CORRIGE LINKS RELATIVOS (a parte mais importante!)
        const baseUrl = finalUrl.replace(/\/[^/]*$/, '/');
        const baseDomain = finalUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        
        // Adiciona <base> tag no head pra resolver links relativos
        text = text.replace(
            /<head>/i,
            `<head>
            <base href="${finalUrl}/">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script>
                // Força links a abrir no proxy
                document.addEventListener('click', function(e) {
                    const link = e.target.closest('a');
                    if (link && link.href && !link.href.startsWith('javascript:')) {
                        e.preventDefault();
                        const url = link.href;
                        if (!url.includes('bypasshub')) {
                            window.open('/api/proxy?url=' + encodeURIComponent(url), '_blank');
                        } else {
                            window.open(url, '_blank');
                        }
                    }
                });
            </script>`
        );
        
        // Corrige links relativos no HTML
        text = text.replace(
            /(src|href|action)=["']([^"']*?)["']/gi,
            (match, attr, value) => {
                // Se já for URL absoluta, mantém
                if (value.startsWith('http://') || value.startsWith('https://')) {
                    // Se for do mesmo domínio, redireciona pelo proxy
                    if (value.includes(baseDomain) && !value.includes('/api/proxy')) {
                        return `${attr}="/api/proxy?url=${encodeURIComponent(value)}"`;
                    }
                    return match;
                }
                // Se for protocolo relativo (//exemplo.com)
                if (value.startsWith('//')) {
                    return `${attr}="/api/proxy?url=https:${value}"`;
                }
                // Se for caminho absoluto (/caminho)
                if (value.startsWith('/')) {
                    return `${attr}="${baseUrl}${value.substring(1)}"`;
                }
                // Se for caminho relativo (caminho)
                if (!value.startsWith('#') && !value.startsWith('javascript:')) {
                    return `${attr}="${baseUrl}${value}"`;
                }
                return match;
            }
        );
        
        // 7. Remove políticas de segurança que bloqueiam
        text = text.replace(
            /<meta[^>]*Content-Security-Policy[^>]*>/gi,
            ''
        );
        text = text.replace(
            /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
            ''
        );
        
        // 8. Manda o conteúdo de volta
        const contentType = response.headers.get('content-type') || 'text/html';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.status(200).send(text);
        
    } catch (error) {
        console.error('❌ Erro no proxy:', error.message);
        
        // Erro específico de timeout
        if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
            return res.status(504).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Timeout - Bypass</title>
                    <style>
                        body { font-family: Arial; text-align: center; padding: 50px; background: #0a0a12; color: #fff; }
                        h1 { color: #f59e0b; }
                        a { color: #7b2ffc; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <h1>⏱️ Tempo esgotado</h1>
                    <p>O site demorou muito para responder. Tente novamente.</p>
                    <a href="/">← Voltar para o Bypass</a>
                </body>
                </html>
            `);
        }
        
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Erro - Bypass</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; background: #0a0a12; color: #fff; }
                    h1 { color: #ef4444; }
                    a { color: #7b2ffc; text-decoration: none; }
                    .error { color: #6b7280; font-size: 0.9rem; margin-top: 10px; }
                </style>
            </head>
            <body>
                <h1>❌ Erro ao acessar</h1>
                <p>Não foi possível acessar: ${urlParam}</p>
                <p class="error">Erro: ${error.message}</p>
                <br>
                <a href="/">← Voltar para o Bypass</a>
            </body>
            </html>
        `);
    }
}
