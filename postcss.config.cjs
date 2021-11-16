const postcssImport = require('postcss-import');
const tailwindcss = require('tailwindcss');
const tailwindcssNesting = require('tailwindcss/nesting');
const fix100vh = require('postcss-100vh-fix');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const config = {
  plugins: [
    postcssImport(),
    tailwindcssNesting(),
    //Some plugins, like tailwindcss/nesting, need to run before Tailwind,
    tailwindcss(),
    //But others, like autoprefixer, need to run after,
    fix100vh(),
    autoprefixer(),
    !dev &&
      cssnano({
        preset: 'default'
      })
  ]
};

module.exports = config;
