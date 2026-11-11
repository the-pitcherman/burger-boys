"""Subset + restrict Archivo to the characters and axis ranges the site uses (90 KB -> ~50 KB).
Usage: python3 scripts/subset_font.py  (needs fonttools + brotli)"""
import subprocess
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
SRC = 'assets-src/fonts/archivo-latin-wdth-normal.woff2'
subprocess.run(['pyftsubset', SRC, '--unicodes=U+0020-007E,U+00A0-00FF,U+20AC,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+2192,U+2193,U+00D7,U+2212,U+2011',
                '--flavor=woff2', '--layout-features=*', '--output-file=/tmp/archivo-sub.woff2'], check=True)
f = instancer.instantiateVariableFont(TTFont('/tmp/archivo-sub.woff2'), {'wght': (400, 900), 'wdth': (100, 112)})
f.flavor = 'woff2'
f.save('public/fonts/archivo-latin-wdth.woff2')
print('saved')
