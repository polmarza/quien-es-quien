"""Quita el fondo de una foto con rembg y la guarda como PNG con transparencia.

Uso: .venv-fotos/bin/python -I scripts/quitar-fondo.py <entrada> <salida.png>

Lo llama scripts/procesar-fotos.ts. Se ejecuta con -I para que Python no cargue módulos del
directorio del proyecto (la carpeta coverage/ de Vitest tapa un paquete del mismo nombre).
"""

import sys

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage


def main() -> None:
    entrada, salida = sys.argv[1], sys.argv[2]
    session = new_session("isnet-general-use")
    with Image.open(entrada) as imagen:
        resultado = remove(imagen.convert("RGB"), session=session, post_process_mask=True)
        solo_la_persona(resultado).save(salida)


def solo_la_persona(imagen: Image.Image) -> Image.Image:
    """Deja solo la mancha más grande de la máscara: quita restos sueltos del fondo."""
    rgba = np.array(imagen)
    etiquetas, n = ndimage.label(rgba[..., 3] > 16)
    if n > 1:
        tamanos = ndimage.sum(np.ones_like(etiquetas), etiquetas, index=range(1, n + 1))
        principal = 1 + int(np.argmax(tamanos))
        rgba[..., 3][etiquetas != principal] = 0
    return Image.fromarray(rgba)


if __name__ == "__main__":
    main()
