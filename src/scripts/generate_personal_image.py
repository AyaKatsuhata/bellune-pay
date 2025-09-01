from PIL import Image, ImageDraw, ImageFont
import json
import sys
import os

# 画像サイズ：1080x1920（例）
WIDTH, HEIGHT = 1080, 1920

# 各エリアの表示位置（x, y, max_width, max_height）
positions = {
    "personality": (70, 170, 400, 600),
    "values": (605, 130, 420, 280),
    "mission": (605, 515, 420, 280),
    "love": (55, 970, 280, 450),
    "talent": (405, 970, 280, 450),
    "message": (760, 970, 280, 450),
    "challenge": (60, 1550, 420, 350),
    "pattern": (600, 1550, 420, 350),
}

def draw_multiline(draw, text, position, font, max_width, max_height):
    x, y = position
    line_height = font.size + 15
    current_line = ""
    lines = []
    for char in text:
        test_line = current_line + char
        if draw.textlength(test_line, font=font) <= max_width:
            current_line = test_line
        else:
            lines.append(current_line)
            current_line = char
    if current_line:
        lines.append(current_line)

    for line in lines:
        if y + line_height - position[1] > max_height:
            break
        draw.text((x, y), line, font=font, fill="black")
        y += line_height

def generate_image(data, bg_path, output_path):
    img = Image.open(bg_path).convert("RGBA")
    draw = ImageDraw.Draw(img)

    # フォント設定（Macで游ゴシックを使う例）
    font_path = "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc"
    font = ImageFont.truetype(font_path, 26)

    for key, (x, y, w, h) in positions.items():
        text = data.get(key, "")
        draw_multiline(draw, text, (x, y), font, max_width=w, max_height=h)

    img.save(output_path, format="PNG")

if __name__ == "__main__":
    input_json = sys.argv[1]
    with open(input_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    bg_path = "public/template/background.png"
    output_path = "outputs/personal.png"
    generate_image(data, bg_path, output_path)
    print(f"✅ 画像出力完了: {output_path}")