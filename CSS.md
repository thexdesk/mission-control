# PostCSS

## [PreCSS](https://github.com/jonathantneal/precss/blob/master/README.md)
- Variables (`$foo`)
- Conditionals (`@if`, `@else`)
- Loops (`@for`)
- Mixins (`@define-mixin`)
- Extends (`@extend`)
- Imports (`@import`)
- Property lookup (`@margin`)
- At-root (`@at-root`)

## [Short](https://github.com/jonathantneal/postcss-short/blob/master/README.md)
- Margin & Padding (`margin: * 0` -> `margin-right: 0; margin-left: auto;`)
- Position (`position: fixed * 0` -> `position: fixed; right: 0; left: 0;`)
- Overflow (`overflow: hidden auto` -> `overflow-x: hidden; overflow-y: auto;`)
- Border radius (`border-bottom-radius: 3px` -> `border-bottom-left-radius: 3px; border-bottom-right-radius: 3px;`)
- Font size (`font-size: 1.25em / 2` -> `font-size: 1.25em; line-height: 2;`)
- Font weight (`font-weight: light` -> `font-weight: 300`)

Disabled:
- Size
- Color
- Border

## [Modern Properties](https://www.npmjs.com/package/postcss-modern-properties)
- Size (`size: width / height / padding / margin`)
- Width (`width: width min-width max-width`)
- Height (`height: height min-height max-height`)
- Border (`border: 1px solid #000 3px` -> `border: 1px solid #000; border-radius: 3px`)
- Color (`color: #000 #fff` -> `color: #000; background: #fff`)
- Hanging indent (`hanging-indent: 1em` -> `text-indent: -1em; margin-left: 1em;`)
- Unset (`unset: color background` -> `color: unset; background: unset;`)

## [Font Magician](https://github.com/jonathantneal/postcss-font-magician/blob/master/README.md)
"Just use the font and font-family properties as if they were magic."

## [HexRGBA](https://github.com/seaneking/postcss-hexrgba/blob/master/README.md)
`rgba(#fff, 0.5)` -> `rgba(255, 255, 255, 0.5)`

## [calc](https://github.com/postcss/postcss-calc/blob/master/README.md)
Reduce calc() references whenever it's possible.

## [color-hex-alpha](https://github.com/postcss/postcss-color-hex-alpha/blob/master/README.md)
Transform [W3C RGBA hexadecimal notations (#RRGGBBAA or #RGBA)](https://drafts.csswg.org/css-color/#hex-notation) to more compatible CSS (`rgba()`).

## [Will Change](https://github.com/postcss/postcss-will-change/blob/master/README.md)
"This plugin uses backface-visibility to force the browser to create a new layer, without overriding existing backface-visibility properties. This 3D CSS hack is commonly done with transform: translateZ(0), but backface-visibility is used here to avoid overriding the more popular transform property."

Basically, it's a cool hack to force `will-change` to work properly in browsers without support.

## [color-mix](https://github.com/iamstarkov/postcss-color-mix/blob/master/README.md)
Takes the average of each of the RGB components, optionally weighted by the given percentage.

Usage: `color: mix(#f00, #00f); /* #800080 */`

## [display-visible](https://www.npmjs.com/package/postcss-display-visible)
Automatically adds visibility whenever there's a display property. Also includes fallbacks for `display: flow-root` and `display: contents`.

## [Autoprefixer](https://github.com/postcss/autoprefixer/blob/master/README.md)
Parse CSS and add vendor prefixes to CSS rules using values from [Can I Use](http://caniuse.com/). It is [recommended](https://developers.google.com/web/tools/setup/setup-buildtools#dont_trip_up_with_vendor_prefixes) by Google and used in Twitter and Taobao.

