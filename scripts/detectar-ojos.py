"""Propone el recorte de cada foto (`photo.crop` de deck.json) a partir de la cara detectada.

Uso: .venv-fotos/bin/python -I scripts/detectar-ojos.py <carpeta-originales> <salida.json> [ids…]

Para cada `<id>.<ext>` de la carpeta (sin contar los `.sin-fondo.png`) detecta la cara más grande
con los clasificadores Haar de OpenCV y, dentro de ella, los ojos. Devuelve el punto medio entre
los ojos (fracción del ancho y del alto) y la escala del recorte para que la cara ocupe la misma
proporción en todas las fotos. Es una propuesta: el resultado se revisa en la hoja de contactos y
se corrige a mano en deck.json si hace falta.
"""

import json
import pathlib
import sys

import cv2

# Alto de la cara (caja de OpenCV) respecto al alto de la foto final.
FACE_SHARE = 0.30
# Altura de los ojos en la foto final (igual que EYES.y en procesar-fotos.ts).
EYES_Y = 0.40


def detect(path: pathlib.Path) -> dict:
    image = cv2.imread(str(path))
    h, w = image.shape[:2]
    gray = cv2.equalizeHist(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY))
    faces = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml").detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=6, minSize=(w // 10, w // 10)
    )
    if len(faces) == 0:
        return {"error": "sin cara"}
    fx, fy, fw, fh = max(faces, key=lambda f: f[2] * f[3])

    eyes = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml").detectMultiScale(
        gray[fy : fy + fh // 2, fx : fx + fw], scaleFactor=1.1, minNeighbors=8, minSize=(fw // 10, fw // 10)
    )
    if len(eyes) >= 2:
        two = sorted(eyes, key=lambda e: e[2] * e[3], reverse=True)[:2]
        ex = fx + sum(e[0] + e[2] / 2 for e in two) / 2
        ey = fy + sum(e[1] + e[3] / 2 for e in two) / 2
        method = "ojos"
    else:
        ex, ey, method = fx + fw / 2, fy + fh * 0.42, "cara"

    # Alto del recorte deseado, limitado para que no se salga de la foto: con los ojos al 40 % del
    # alto y centrados, el recorte 3:4 tiene que caber arriba, abajo y a los lados.
    wanted = fh / FACE_SHARE
    fits = min(h, ey / EYES_Y, (h - ey) / (1 - EYES_Y), 2 * min(ex, w - ex) / 0.75)
    return {
        "eyeX": round(float(ex) / w, 4),
        "eyeY": round(float(ey) / h, 4),
        "scale": round(float(min(wanted, fits)) / h, 4),
        "method": method,
    }


def main() -> None:
    folder, out = pathlib.Path(sys.argv[1]), sys.argv[2]
    only = set(sys.argv[3:])
    result = {}
    for path in sorted(folder.iterdir()):
        if ".sin-fondo." in path.name or path.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            continue
        if only and path.stem not in only:
            continue
        result[path.stem] = detect(path)
        print(path.stem, result[path.stem])
    pathlib.Path(out).write_text(json.dumps(result, indent=1))


if __name__ == "__main__":
    main()
