// ============================================
// PROXY QUE FUNCIONA NA VERCEL (VERSÃO CORRIGIDA)
// ============================================

export default async function handler(req, res) {
    // 1. Pega a URL da query string
    const urlParam = req.query.url;
    
    // 2. Se não tiver URL, mostra erro
    if (!urlParam) {
        return res.status(400).send(`
            <h1>❌ Erro</h1>
            <p>Digite uma URL! Ex: /api/proxy?url=youtube.com</p>
            <a href="/">Voltar</a>
        `);
    }
    
    try {
        // 3. Adiciona https:// se não tiver
        let finalUrl = urlParam;
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }
        
        console.log('🔄 Proxy acessando:', finalUrl);
        
        // 4. Faz a requisição pro site
        const response = await fetch(finalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 8000
        });
        
        // 5. Pega o conteúdo
        const text = await response.text();
        
        // 6. Corrige links relativos
        const baseUrl = finalUrl.replace(/\/[^/]*$/, '/');
        const fixedText = text.replace(
            /(src|href|action)=["']([^"']*?)["']/gi,
            (match, attr, value) => {
                if (value.startsWith('http') || value.startsWith('//')) {
                    return match;
                }
                if (value.startsWith('/')) {
                    return `${attr}="${baseUrl}${value.substring(1)}"`;
                }
                return `${attr}="${baseUrl}${value}"`;
            }
        );
        
        // 7. Manda o conteúdo de volta
        res.setHeader('Content-Type', response.headers.get('content-type') || 'text/html');
        res.status(200).send(fixedText);
        
    } catch (error) {
        console.error('❌ Erro no proxy:', error.message);
        res.status(500).send(`
            <h1>❌ Erro ao acessar</h1>
            <p>Não foi possível acessar: ${urlParam}</p>
            <p>Erro: ${error.message}</p>
            <a href="/">Voltar para o Bypass</a>
        `);
    }
}