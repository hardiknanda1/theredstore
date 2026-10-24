"""Crops on-model product images (4:5, 960x1200) from the campaign film frames.

Usage: python3 scripts/product_crops.py <frames-dir> public/products <contact-sheet.jpg>
"""
import sys, json
from PIL import Image, ImageFilter
src, out, sheet = sys.argv[1], sys.argv[2], sys.argv[3]
# name: (frame, cx, cy, w)  -- 1280x720 frame coords, output 4:5
C = {
 'filament-gown-1': (90, 640, 362, 520),
 'filament-gown-2': (88, 640, 220, 300),
 'filament-gown-3': (95, 640, 560, 300),
 'brim-hat-1': (92, 640, 120, 230),
 'brim-hat-2': (99, 640, 160, 330),
 'top-handle-bag-1': (93, 808, 330, 150),
 'top-handle-bag-2': (90, 760, 300, 300),
 'boxy-tee-1': (106, 640, 250, 400),
 'boxy-tee-2': (110, 640, 360, 540),
 'cargo-short-1': (107, 640, 470, 300),
 'cargo-short-2': (112, 640, 400, 480),
 'messenger-sling-1': (106, 700, 280, 190),
 'messenger-sling-2': (128, 700, 330, 220),
 'six-panel-cap-1': (108, 632, 90, 170),
 'six-panel-cap-2': (114, 632, 160, 300),
 'platform-trainer-1': (106, 630, 640, 230),
 'platform-trainer-2': (125, 630, 640, 240),
 'tailored-blazer-1': (128, 640, 330, 440),
 'tailored-blazer-2': (124, 640, 370, 560),
 'wide-cargo-trouser-1': (140, 640, 520, 340),
 'wide-cargo-trouser-2': (138, 640, 370, 540),
 'satin-tie-1': (130, 630, 250, 200),
 'luminous-tie-1': (140, 630, 250, 220),
 'luminous-tie-2': (138, 640, 300, 420),
 'bridal-lehenga-1': (150, 640, 380, 520),
 'bridal-lehenga-2': (146, 640, 560, 300),
 'tulle-dupatta-1': (147, 640, 230, 330),
 'tulle-dupatta-2': (149, 640, 300, 420),
 'second-skin-1': (30, 438, 245, 240),
 'second-skin-2': (32, 520, 370, 480),
}
names=[]
for name,(f,cx,cy,w) in C.items():
    im=Image.open(f'{src}/frame-{f:04d}.jpg').convert('RGB')
    h=round(w*1.25)
    x0=max(0,min(1280-w,cx-w//2)); y0=max(0,min(720-h,cy-h//2))
    if h>720: raise SystemExit(name+' too tall')
    c=im.crop((x0,y0,x0+w,y0+h)).resize((960,1200),Image.LANCZOS)
    if w<480: c=c.filter(ImageFilter.UnsharpMask(radius=2,percent=60,threshold=2))
    c.save(f'{out}/{name}.jpg',quality=86,optimize=True,progressive=True)
    names.append(name)
cols=8; tw=200; th=250
sh=Image.new('RGB',(cols*tw,((len(names)+cols-1)//cols)*th))
for i,n in enumerate(names):
    sh.paste(Image.open(f'{out}/{n}.jpg').resize((tw,th)),((i%cols)*tw,(i//cols)*th))
sh.save(sheet,quality=80)
print(len(names))
