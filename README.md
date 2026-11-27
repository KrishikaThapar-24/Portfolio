# Krishika Thapar | Portfolio

A static portfolio site. No build step and no installs: upload the folder as it is.

```
index.html
css/styles.css
js/main.js           GSAP + ScrollTrigger animations, Lenis smooth scrolling
js/particles.js      hero particle network
js/vendor/           gsap, ScrollTrigger, Lenis (bundled, no CDN needed)
assets/              resume PDF and favicon
```

## Deploy
- **GitHub Pages:** push the whole folder to a repo, then Settings > Pages > Deploy from branch `main`, root folder.
- **Vercel or Netlify:** import the repo or drag the folder in. Leave build command and output directory empty.

## Edit
- Text and links: `index.html`
- Colours and layout: `css/styles.css` (colour tokens are at the top)
- To replace the resume, overwrite `assets/Krishika_Thapar_Resume.pdf`, keeping the same file name.

Fonts (Space Grotesk, Inter, JetBrains Mono) load from Google Fonts, so the site needs an internet connection to look its best.

GSAP is used under its standard no-charge licence (gsap.com/standard-license).
