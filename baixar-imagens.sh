#!/usr/bin/env bash
# Baixa as fotos geradas no Morphix e converte para WebP (requer curl e cwebp ou ImageMagick)
set -e
cd "$(dirname "$0")/assets/img"
declare -A IMGS=(
  [caminhao-limpa-fossa-mossoro]=b5ifkhx3
  [banheiro-quimico-eventos-mossoro]=5854b3lp
  [banheiro-quimico-obras-mossoro]=w1a8wjmv
  [limpeza-de-fossa-residencial-mossoro]=se06aob0
)
for name in "${!IMGS[@]}"; do
  curl -sSL -o "$name.png" "https://assets.morphix.pro/${IMGS[$name]}.png"
  if command -v cwebp >/dev/null; then cwebp -q 80 "$name.png" -o "$name.webp"; else magick "$name.png" -quality 80 "$name.webp"; fi
done
magick caminhao-limpa-fossa-mossoro.png -resize 1200x630^ -gravity center -extent 1200x630 og-image.jpg
echo "Imagens prontas."
