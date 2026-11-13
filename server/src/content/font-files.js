// ─────────────────────────────────────────────────────────────
// The font files behind every choice in fonts.js (client/public/fonts/lettering).
// The website needs these only when a font is shown at a size other than
// "Normal": it then redraws that font a little smaller or larger.
//   adjust  how much the font is resized to take the room of the original (%)
//   faces   [file, weights, style, l = Latin | e = Latin Extended]
// ─────────────────────────────────────────────────────────────

export const FONT_FILES = {
  'alex-brush': { adjust: 82, faces: [['alex-brush-400-latin-ext.woff2', '400', 'normal', 'e'], ['alex-brush-400-latin.woff2', '400', 'normal', 'l']] },
  'antonio': { adjust: 91, faces: [['antonio-latin-ext.woff2', '100 900', 'normal', 'e'], ['antonio-latin.woff2', '100 900', 'normal', 'l']] },
  'architects-daughter': { adjust: 130, faces: [['architects-daughter-400-latin-ext.woff2', '400', 'normal', 'e'], ['architects-daughter-400-latin.woff2', '400', 'normal', 'l']] },
  'barlow': { adjust: 100, faces: [['barlow-400-latin-ext.woff2', '400', 'normal', 'e'], ['barlow-400-latin.woff2', '400', 'normal', 'l'], ['barlow-500-latin-ext.woff2', '500', 'normal', 'e'], ['barlow-500-latin.woff2', '500', 'normal', 'l'], ['barlow-600-latin-ext.woff2', '600', 'normal', 'e'], ['barlow-600-latin.woff2', '600', 'normal', 'l']] },
  'barlow-condensed': { adjust: 100, faces: [['barlow-condensed-500-latin-ext.woff2', '500', 'normal', 'e'], ['barlow-condensed-500-latin.woff2', '500', 'normal', 'l'], ['barlow-condensed-600-latin-ext.woff2', '600', 'normal', 'e'], ['barlow-condensed-600-latin.woff2', '600', 'normal', 'l'], ['barlow-condensed-700-latin-ext.woff2', '700', 'normal', 'e'], ['barlow-condensed-700-latin.woff2', '700', 'normal', 'l'], ['barlow-condensed-800-latin-ext.woff2', '800', 'normal', 'e'], ['barlow-condensed-800-latin.woff2', '800', 'normal', 'l']] },
  'bebas-neue': { adjust: 107, faces: [['bebas-neue-400-latin-ext.woff2', '100 900', 'normal', 'e'], ['bebas-neue-400-latin.woff2', '100 900', 'normal', 'l']] },
  'big-shoulders-display': { adjust: 96, faces: [['big-shoulders-display-latin-ext.woff2', '100 900', 'normal', 'e'], ['big-shoulders-display-latin.woff2', '100 900', 'normal', 'l']] },
  'cabin': { adjust: 103, faces: [['cabin-latin-ext.woff2', '400 700', 'normal', 'e'], ['cabin-latin.woff2', '400 700', 'normal', 'l']] },
  'caveat': { adjust: 140, faces: [['caveat-latin-ext.woff2', '400 700', 'normal', 'e'], ['caveat-latin.woff2', '400 700', 'normal', 'l']] },
  'cormorant-garamond': { adjust: 108, faces: [['cormorant-garamond-500-italic-latin-ext.woff2', '400', 'italic', 'e'], ['cormorant-garamond-500-italic-latin.woff2', '400', 'italic', 'l'], ['cormorant-garamond-500-latin-ext.woff2', '400', 'normal', 'e'], ['cormorant-garamond-500-latin.woff2', '400', 'normal', 'l']] },
  'crimson-text': { adjust: 105, faces: [['crimson-text-400-italic-latin-ext.woff2', '400', 'italic', 'e'], ['crimson-text-400-italic-latin.woff2', '400', 'italic', 'l'], ['crimson-text-400-latin-ext.woff2', '400', 'normal', 'e'], ['crimson-text-400-latin.woff2', '400', 'normal', 'l']] },
  'dancing-script': { adjust: 80, faces: [['dancing-script-latin-ext.woff2', '400 700', 'normal', 'e'], ['dancing-script-latin.woff2', '400 700', 'normal', 'l']] },
  'dm-sans': { adjust: 96, faces: [['dm-sans-latin-ext.woff2', '100 1000', 'normal', 'e'], ['dm-sans-latin.woff2', '100 1000', 'normal', 'l']] },
  'eb-garamond': { adjust: 108, faces: [['eb-garamond-400-italic-latin-ext.woff2', '400', 'italic', 'e'], ['eb-garamond-400-italic-latin.woff2', '400', 'italic', 'l'], ['eb-garamond-400-latin-ext.woff2', '400', 'normal', 'e'], ['eb-garamond-400-latin.woff2', '400', 'normal', 'l']] },
  'fjalla-one': { adjust: 90, faces: [['fjalla-one-400-latin-ext.woff2', '100 900', 'normal', 'e'], ['fjalla-one-400-latin.woff2', '100 900', 'normal', 'l']] },
  'great-vibes': { adjust: 85, faces: [['great-vibes-400-latin-ext.woff2', '400', 'normal', 'e'], ['great-vibes-400-latin.woff2', '400', 'normal', 'l']] },
  'homemade-apple': { adjust: 100, faces: [['homemade-apple-400-latin.woff2', '400', 'normal', 'l']] },
  'im-fell-english': { adjust: 100, faces: [['im-fell-english-400-italic-latin.woff2', '400', 'italic', 'l'], ['im-fell-english-400-latin.woff2', '400', 'normal', 'l']] },
  'indie-flower': { adjust: 150, faces: [['indie-flower-400-latin-ext.woff2', '400', 'normal', 'e'], ['indie-flower-400-latin.woff2', '400', 'normal', 'l']] },
  'kalam': { adjust: 115, faces: [['kalam-400-latin-ext.woff2', '400', 'normal', 'e'], ['kalam-400-latin.woff2', '400', 'normal', 'l'], ['kalam-700-latin-ext.woff2', '700', 'normal', 'e'], ['kalam-700-latin.woff2', '700', 'normal', 'l']] },
  'karla': { adjust: 98, faces: [['karla-latin-ext.woff2', '200 800', 'normal', 'e'], ['karla-latin.woff2', '200 800', 'normal', 'l']] },
  'libre-caslon-text': { adjust: 85, faces: [['libre-caslon-text-400-italic-latin-ext.woff2', '400', 'italic', 'e'], ['libre-caslon-text-400-italic-latin.woff2', '400', 'italic', 'l'], ['libre-caslon-text-400-latin-ext.woff2', '400', 'normal', 'e'], ['libre-caslon-text-400-latin.woff2', '400', 'normal', 'l']] },
  'mrs-saint-delafield': { adjust: 100, faces: [['mrs-saint-delafield-400-latin-ext.woff2', '400', 'normal', 'e'], ['mrs-saint-delafield-400-latin.woff2', '400', 'normal', 'l']] },
  'mulish': { adjust: 96, faces: [['mulish-latin-ext.woff2', '200 1000', 'normal', 'e'], ['mulish-latin.woff2', '200 1000', 'normal', 'l']] },
  'nothing-you-could-do': { adjust: 125, faces: [['nothing-you-could-do-400-latin.woff2', '400', 'normal', 'l']] },
  'old-standard-tt': { adjust: 96, faces: [['old-standard-tt-400-italic-latin-ext.woff2', '400', 'italic', 'e'], ['old-standard-tt-400-italic-latin.woff2', '400', 'italic', 'l'], ['old-standard-tt-400-latin-ext.woff2', '400', 'normal', 'e'], ['old-standard-tt-400-latin.woff2', '400', 'normal', 'l']] },
  'oswald': { adjust: 88, faces: [['oswald-latin-ext.woff2', '200 900', 'normal', 'e'], ['oswald-latin.woff2', '200 900', 'normal', 'l']] },
  'parisienne': { adjust: 78, faces: [['parisienne-400-latin-ext.woff2', '400', 'normal', 'e'], ['parisienne-400-latin.woff2', '400', 'normal', 'l']] },
  'patrick-hand': { adjust: 135, faces: [['patrick-hand-400-latin-ext.woff2', '400', 'normal', 'e'], ['patrick-hand-400-latin.woff2', '400', 'normal', 'l']] },
  'pinyon-script': { adjust: 85, faces: [['pinyon-script-400-latin-ext.woff2', '400', 'normal', 'e'], ['pinyon-script-400-latin.woff2', '400', 'normal', 'l']] },
  'satisfy': { adjust: 80, faces: [['satisfy-400-latin.woff2', '400', 'normal', 'l']] },
  'sorts-mill-goudy': { adjust: 99, faces: [['sorts-mill-goudy-400-italic-latin-ext.woff2', '400', 'italic', 'e'], ['sorts-mill-goudy-400-italic-latin.woff2', '400', 'italic', 'l'], ['sorts-mill-goudy-400-latin-ext.woff2', '400', 'normal', 'e'], ['sorts-mill-goudy-400-latin.woff2', '400', 'normal', 'l']] },
  'source-sans-3': { adjust: 104, faces: [['source-sans-3-latin-ext.woff2', '200 900', 'normal', 'e'], ['source-sans-3-latin.woff2', '200 900', 'normal', 'l']] },
  'teko': { adjust: 98, faces: [['teko-latin-ext.woff2', '300 900', 'normal', 'e'], ['teko-latin.woff2', '300 900', 'normal', 'l']] },
  'work-sans': { adjust: 90, faces: [['work-sans-latin-ext.woff2', '100 900', 'normal', 'e'], ['work-sans-latin.woff2', '100 900', 'normal', 'l']] },
};
