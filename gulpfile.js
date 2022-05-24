const { src, dest, watch, series, parallel } = require('gulp')
const { createGulpEsbuild } = require('gulp-esbuild')
const gulpEsbuild = createGulpEsbuild({ incremental: true })
const size = require('gulp-size')

const config = {
  js: {
    src: './app.js',
    dest: './js/',
    outfile: 'app.bundle.js' 
  }
}

function esbuild() {
  const _src = config.js.src
  const _dest = config.js.dest
  const outfile = config.js.outfile
  return src(_src)
    .pipe(gulpEsbuild({
        outfile,
        bundle: true,
        sourcemap: true,
        format: 'esm', // 'iife'|'cjs'|'esm'
    }))
    .pipe(size({
      showFiles: true,
      showTotal: true
    }))
    .pipe(dest(_dest))
}

const watch_js = () => watch(config.js.src, esbuild)


// create JS bundle and watch JS file changes
const dev = parallel(
  series(
    esbuild,
  ),
  watch_js
)

module.exports = {
  dev
}