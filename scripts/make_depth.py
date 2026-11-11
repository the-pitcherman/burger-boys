"""Bake a pseudo-depth map for the hero cutout from its alpha (rounded 'dome' + soft luminance detail).
Used by the Three.js parallax shader. Usage: python3 scripts/make_depth.py"""
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import distance_transform_edt
src = 'assets-src/hero-burger-cut.png'
im = Image.open(src).convert('RGBA')
a = np.array(im)[:, :, 3].astype(np.float32) / 255
d = distance_transform_edt(a > 0.5)
d = d / d.max()
dome = np.sqrt(np.clip(d, 0, 1))                      # rounded body
lum = np.array(im.convert('L')).astype(np.float32) / 255
detail = np.array(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255
depth = np.clip(dome * 0.85 + (detail - 0.5) * 0.25, 0, 1) * (a > 0.02)
out = Image.fromarray((depth * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))
out.save('assets-src/hero-burger-depth.png')
print('depth', out.size)
