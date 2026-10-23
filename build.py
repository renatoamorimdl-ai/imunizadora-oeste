"""Gera index.html a partir de src/template.html.

Imagens: servidas pelo otimizador da Vercel (/_vercel/image -> WebP/AVIF) a partir das
fotos geradas no Morphix. Para hospedar localmente, troque MORPHIX pelos caminhos em assets/img/.
"""
import re, pathlib
from urllib.parse import quote
root = pathlib.Path(__file__).parent
tpl = (root / 'src/template.html').read_text()
MORPHIX = {
    'caminhao-limpa-fossa-mossoro': 'https://assets.morphix.pro/b5ifkhx3.png',
    'banheiro-quimico-eventos-mossoro': 'https://assets.morphix.pro/5854b3lp.png',
    'banheiro-quimico-obras-mossoro': 'https://assets.morphix.pro/w1a8wjmv.png',
    'limpeza-de-fossa-residencial-mossoro': 'https://assets.morphix.pro/se06aob0.png',
}
WIDTHS = [640, 1080, 1920]
def opt(name, w): return f'/_vercel/image?url={quote(MORPHIX[name], safe="")}&amp;w={w}&amp;q=75'
def img_attrs(m):
    name = m.group(1)
    sizes = '100vw' if name == 'caminhao-limpa-fossa-mossoro' else '(max-width: 1020px) 100vw, 50vw'
    srcset = ', '.join(f'{opt(name, w)} {w}w' for w in WIDTHS)
    return f'src="{opt(name, 1080)}" srcset="{srcset}" sizes="{sizes}"'
def strip(svg): return re.sub(r'<title>.*?</title>', '', svg).replace('role="img" ', 'aria-hidden="true" ')
logo = strip((root / 'assets/img/logo-imunizadora-oeste.svg').read_text())
logo_w = strip((root / 'assets/img/logo-imunizadora-oeste-branco.svg').read_text())
html = tpl.replace('{{LOGO}}', logo).replace('{{LOGO_WHITE}}', logo_w)
html = html.replace('<link rel="preload" as="image" href="{{IMG:caminhao-limpa-fossa-mossoro}}">',
    '<link rel="preload" as="image" imagesrcset="' + ', '.join(f'{opt("caminhao-limpa-fossa-mossoro", w)} {w}w' for w in WIDTHS) + '" imagesizes="100vw">')
html = re.sub(r'src="\{\{IMG:([\w-]+)\}\}"', img_attrs, html)
assert '{{' not in html
(root / 'index.html').write_text(html)
