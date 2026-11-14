# Raster provenance

## Light-theme plates (2026-11-14)

The page’s current light theme uses five pale prints. They are local duotone/tone-mapped derivatives; no generative model was used. The earlier night-graded files (`bg-ridge.webp`, `bg-land.webp`, `bg-dawn.webp`, `bg-cosmos.webp`) remain beside them as the previous edition and are no longer loaded by the page.

- `bg-ridge-light.webp` — source: Unsplash photo `photo-1469474968028-56623f02e42e` (a mountain ridge under sun rays), downloaded 2026-11-14 from `https://images.unsplash.com/photo-1469474968028-56623f02e42e`. Used under the Unsplash License; credit “摄影 Unsplash” in the footer. Processing: centre crop to 1920×1200, luminance autocontrast, shadows lifted toward paper, mapped to a paper/umber duotone, 0.5px Gaussian blur, WebP quality 82. Hero background at 86% desktop / 82% mobile.
- `bg-land-light.webp` — source: Unsplash photo `photo-1470071459604-3b5ec3a7fe05` (see `bg-land.webp`). Processing: 1600×1000 crop, shadows lifted further, paper/umber duotone, 0.8px blur, WebP quality 82. About background at 84%.
- `bg-dawn-light.webp` — source: Unsplash photo `photo-1506905925346-21bda4d32df4` (see `bg-dawn.webp`). Processing: 1920×1200 crop, paper/umber duotone, 0.6px blur, WebP quality 82. Motto background at 88% desktop / 84% mobile.
- `bg-cosmos-light.webp` — derived from `bg-cosmos.webp` (NASA/ESA Hubble eXtreme Deep Field, credit in that section below). The luminance is inverted and lifted toward paper, then mapped to an ink/paper duotone and given a 0.25px blur; 1920×1200, WebP quality 82. It reads as ink specks on paper behind the poem star map at 62%, multiply.
- `bg-paper.webp` — unchanged; see below.

## avatar.webp

- Source: the public Bilibili profile avatar of UID `3546669826181699` (`https://space.bilibili.com/3546669826181699`), downloaded 2026-11-14 from `i2.hdslb.com`.
- Processing: converted locally from the downloaded JPEG to WebP (quality 90, method 6) with Pillow. No generative model.
- Usage: the site owner's own avatar; displayed in the About section.

## bg-cosmos.webp

- Source: NASA image `GSFC_20171208_Archive_e001651`, “Hubble Goes to the eXtreme to Assemble Farthest-Ever View of the Universe” (the Hubble eXtreme Deep Field), NASA/GSFC, 2012 image release; downloaded 2026-11-14 from `https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001651/GSFC_20171208_Archive_e001651~large.jpg`. Credit: NASA; ESA; G. Illingworth, D. Magee, and P. Oesch, University of California, Santa Cruz; R. Bouwens, Leiden University; and the HUDF09 Team. Used under NASA’s media usage guidelines.
- Processing: grayscale duotone map to the site palette (#07080a / #1a2230 / #c47a4d / #ece7db), 0.8px Gaussian blur, 1920×1200 crop, WebP quality 82. No generative model.
- Usage: the poem stage background (opacity .36, mobile .32), behind the star map; not presented as the owner’s photograph.

## bg-paper.webp

- Source: derived from `assets/avatar.webp` (the owner’s Bilibili profile avatar, see above).
- Processing: page crop, upscale to 1400×1400, 20px Gaussian blur, warm paper LUT, 1600×1000 crop, WebP quality 78. No generative model.
- Usage: a faint paper texture on the contact section (opacity .16, mobile .16, multiply).

## bg-ridge.webp

- Source: Unsplash photo `photo-1519681393784-d120267933ba` (snow-covered mountains under the Milky Way), downloaded 2026-11-14 from `https://images.unsplash.com/photo-1519681393784-d120267933ba`. Used under the Unsplash License (`https://unsplash.com/license`); credit “摄影 Unsplash” in the footer.
- Processing: duotone map to the site palette, 0.6px Gaussian blur, 1920×1200 crop, WebP quality 82. No generative model.
- Usage: the hero background (opacity .40 desktop / .36 mobile).

## bg-land.webp

- Source: Unsplash photo `photo-1470071459604-3b5ec3a7fe05` (green mountain valley under cloud), downloaded 2026-11-14 from `https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05`. Used under the Unsplash License.
- Processing: green-grey duotone, 0.9px blur, 1600×1000 crop, WebP quality 80. No generative model.
- Usage: a very low-opacity layer behind the About section (opacity .16 / .16), masked away from the type.

## bg-dawn.webp

- Source: Unsplash photo `photo-1506905925346-21bda4d32df4` (snowy peaks above a sea of clouds at dawn), downloaded 2026-11-14 from `https://images.unsplash.com/photo-1506905925346-21bda4d32df4`. Used under the Unsplash License.
- Processing: dawn duotone, 0.6px blur, 1920×1200 crop, WebP quality 82. No generative model.
- Usage: the motto background at 18% (15% mobile), behind the vertical couplet.

## share.jpg

- Source: a Firefox headless screenshot of the built light hero at 1440×900 with `?static=1`, taken 2026-11-14 from the light mountain-light plate.
- Processing: cropped to 1200×630 and saved as JPEG (quality 88) with Pillow. No generative model.
- Usage: Open Graph / Twitter share image (`og:image`).

## Gloock

- Latin display face, `assets/fonts/gloock-latin.woff2`, by Duarte Pinto.
- Licensed under the SIL Open Font License 1.1; full text in `assets/fonts/OFL-Gloock.txt`.
