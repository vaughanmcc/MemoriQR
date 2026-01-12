#!/usr/bin/env python3
from PIL import Image
import os

os.chdir('/workspaces/MemoriQR/public')

# Fix logo-badge.png
img = Image.open('logo-badge.png').convert('RGBA')
datas = img.getdata()

new_data = []
for item in datas:
    # Change all white/near-white pixels to transparent
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)

img.putdata(new_data)
img.save('logo-badge.png')
print(f'logo-badge.png: Made background transparent ({os.path.getsize("logo-badge.png")} bytes)')

# Also fix logo-stacked.png and logo.png
for filename in ['logo-stacked.png', 'logo.png']:
    if os.path.exists(filename):
        img = Image.open(filename).convert('RGBA')
        datas = img.getdata()
        
        new_data = []
        for item in datas:
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        
        img.putdata(new_data)
        img.save(filename)
        print(f'{filename}: Made background transparent ({os.path.getsize(filename)} bytes)')

print('Done!')
