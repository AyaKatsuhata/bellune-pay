from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.platypus import Paragraph, Frame
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.utils import ImageReader
import json
import sys
import os

# 画像サイズ（例：1080x1920に合わせる）
WIDTH, HEIGHT = 1080, 1920

# 各エリアの表示枠（x, y, width, height） ※左下原点
frames = {
    "personality": (40, 1340, 440, 500),
    "values": (520, 1340, 500, 240),
    "mission": (520, 1060, 500, 240),
    "love": (40, 920, 300, 240),
    "talent": (370, 920, 300, 240),
    "message": (700, 920, 300, 240),
    "challenge": (40, 600, 500, 240),
    "pattern": (560, 600, 500, 240),
}

def generate_pdf(data, bg_path, output_path):
    pdfmetrics.registerFont(UnicodeCIDFont('HeiseiKakuGo-W5'))
    c = canvas.Canvas(output_path, pagesize=(WIDTH, HEIGHT))
    bg = ImageReader(bg_path)
    c.drawImage(bg, 0, 0, width=WIDTH, height=HEIGHT)

    styles = getSampleStyleSheet()
    style = styles['Normal']
    style.fontName = "HeiseiKakuGo-W5"
    style.fontSize = 16
    style.leading = 20

    for key, (x, y, w, h) in frames.items():
        text = data.get(key, "")
        para = Paragraph(text, style)
        frame = Frame(x, y, w, h, showBoundary=0)
        frame.addFromList([para], c)

    c.save()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("使い方: python generate_user_guide.py data.json")
        sys.exit(1)

    input_json = sys.argv[1]
    with open(input_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    output_path = os.path.join("outputs", "personal.pdf")
    bg_path = os.path.join("public/template", "background.png")

    generate_pdf(data, bg_path, output_path)
    print(f"✅ PDF出力完了: {output_path}")