"""Split the exploded anatomy photo (background already removed -> assets-src/anatomy-cut.png)
into six ingredient layers that share one coordinate system, and record each layer's box.
Usage: python3 scripts/cut_layers.py   (re-run rembg first if anatomy-exploded.png changes:
  python3 -c "from rembg import remove,new_session;from PIL import Image;remove(Image.open('assets-src/anatomy-exploded.png').convert('RGB'),session=new_session('isnet-general-use')).save('assets-src/anatomy-cut.png')")"""
import json
from PIL import Image
cut = Image.open('assets-src/anatomy-cut.png').convert('RGBA')
W, H = cut.size
# row splits found from alpha occupancy minima (see docs/assets.md)
splits = [('bun-top', 56, 362), ('lettuce', 366, 609), ('tomato', 611, 795), ('cheese', 798, 997), ('patty', 997, 1204), ('bun-bottom', 1204, 1470)]
boxes = {}
for name, y0, y1 in splits:
    band = cut.crop((0, y0, W, y1))
    bb = band.getbbox()
    piece = band.crop(bb)
    piece.save(f'assets-src/layer-{name}.png')
    boxes[name] = {'x': bb[0], 'y': y0 + bb[1], 'w': bb[2] - bb[0], 'h': bb[3] - bb[1]}
    print(name, boxes[name])
json.dump({'W': W, 'H': H, 'layers': boxes}, open('src/content/anatomy-boxes.json', 'w'), indent=1)
