# Imunizadora Oeste – site institucional

Site estático (HTML/CSS/JS puro) da Imunizadora Oeste, Mossoró-RN. Hospedado na Vercel.

## Editar
1. Edite `src/template.html`.
2. Rode `python3 build.py` para gerar o `index.html`.
3. Faça commit e push: a Vercel publica automaticamente.

## Configuração (bloco `SITE_CONFIG` no `src/template.html`)
- `gtmId`, `ga4Id`, `metaPixelId`: IDs de rastreamento (com placeholder, nada carrega até trocar).
- `whatsapp`: número do WhatsApp comercial.
- `leadWebhook`: URL opcional para receber os leads em JSON.

## Eventos no dataLayer
`generate_lead`, `click_whatsapp`, `click_phone`, `form_start`, `form_error`, `cta_click`,
`service_click`, `section_view`, `scroll_depth`, `faq_open`, `click_directions`, `click_reviews`, `consent_update`.

## Domínio próprio
Ao conectar o domínio, troque `imunizadoraoeste.vercel.app` em `src/template.html`, `robots.txt` e `sitemap.xml`.
