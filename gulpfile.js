/*
 * Thomas G. aka Drozerah
 * https://gist.github.com/Drozerah/c21e5763d4d92bc429b995854e27f4ac
 * Copyright © 2022
 */

/**
 * Node modules 
 */
const path = require('node:path')
const fs = require('node:fs')

/**
 * NPM modules 
 */
const {
  src,
  dest,
  watch,
  series,
  parallel
} = require('gulp')

// const {
//   createGulpEsbuild
// } = require('gulp-esbuild')
// const gulpEsbuild = createGulpEsbuild({
//   incremental: true,
//   piping: true, 
// })
const gulpEsbuild = require('gulp-esbuild')
require('colors')
const size = require('gulp-size')
const _sass = require('gulp-dart-sass')
const open = require('gulp-open')
const log = require('fancy-log')
const nodemon = require('gulp-nodemon')
const html_file_include  = require('gulp-file-include')
const _del = require('del')
const _if = require('gulp-if')
const replace = require('gulp-replace')
const rename = require("gulp-rename")

/**
 * ------------------------------------------------------------------------
 * Constants Definition
 * ------------------------------------------------------------------------
 */
const { NODE_ENV = 'development' } = process.env
const isProduction = NODE_ENV === 'production' ? true : false
const isDevelopment = NODE_ENV === 'development' ? true : false
const BASE_DIR = process.cwd()
const SRC_DIR_NAME = 'src'
const OUTPUT_DIR_NAME = 'public'
const MAIN_HTML_FILE_NAME = 'index.html'
const MAIN_SCSS_FILE_NAME = 'style.scss'
const MAIN_CSS_FILE_NAME = 'style.css'
const MAIN_CSS_FILE_NAME_MIN = 'style.min.css'
const ENTRY_POINT = 'app.js'
const ENTRY_POINT_BUNDLE = 'app.bundle.js'
const ENTRY_POINT_BUNDLE_MIN = 'app.bundle.min.js'
const OUTPUT_DIR = path.join(BASE_DIR, OUTPUT_DIR_NAME)
const SRC_DIR = path.join(BASE_DIR, SRC_DIR_NAME)

// Paths
const config = {
  js: {
    src: path.join(SRC_DIR, ENTRY_POINT),
    dest: path.join(OUTPUT_DIR, 'js'),
    outfile: isDevelopment ? ENTRY_POINT_BUNDLE : ENTRY_POINT_BUNDLE_MIN,
  },
  scss: {
    glob: path.join(SRC_DIR, 'scss', '**/*.scss'),
    src: path.join(SRC_DIR, 'scss', MAIN_SCSS_FILE_NAME),
    dest: path.join(OUTPUT_DIR, 'css'),
  },
  html: {
    glob: path.join(SRC_DIR, 'views', '**/*.html'),
    src: path.join(SRC_DIR, 'views', MAIN_HTML_FILE_NAME),
    dest: path.join(OUTPUT_DIR),
  },
  image: {
    src: path.join(SRC_DIR, 'img', '**/*.{jpg,png,ico,svg}'),
    dest: path.join(OUTPUT_DIR, 'img'),
  },
}

/**
 * ------------------------------------------------------------------------
 * Functions Definition
 * ------------------------------------------------------------------------
 */

// Log env variables
// @{returns} gulp cb()
const logger = (done) => {
  log(`[NODE_ENV] '${NODE_ENV}'`.yellow) // !DEBUG
  log(`[OUTPUT_DIR_NAME] '${OUTPUT_DIR_NAME}'`.yellow) // !DEBUG
  // log(`[SITE_NAME] '${SITE_NAME}'`.yellow) // !DEBUG
  done()
}

// Remove OUTPUT_DIR if already exists
const del = (done) => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    log(`No such directory '${OUTPUT_DIR_NAME}' to remove`.red)
    done()
  } else {
    _del(OUTPUT_DIR).then(() => {
      log(`Removed existing '${OUTPUT_DIR_NAME}' directory`.green)
      done()
    })
  }
}

// Build JAVASCRIPT
const esbuild = () => {
  const _src = config.js.src
  const _dest = config.js.dest
  const outfile = config.js.outfile
  return src(_src)
    .pipe(gulpEsbuild({
      outfile,
      bundle: true,
      sourcemap: isDevelopment, // dev
      ignoreAnnotations: true,
      legalComments: 'none',
      minify: isProduction, // prod
      minifyWhitespace: isProduction, // prod
      minifyIdentifiers: isProduction, // prod
      minifySyntax: isProduction, // prod
      format: 'esm', // 'iife'|'cjs'|'esm'
    }))
    .pipe(size({
      showFiles: true,
      showTotal: true
    }))
    .pipe(dest(_dest))
}

// Compile SCSS
const sass = () => {
  const _src = config.scss.src
  const _dest = config.scss.dest
  return src(_src)
    .pipe(_sass({
      outputStyle: isDevelopment ? 'expanded' : 'compressed' // dev || prod
    }).on('error', _sass.logError))
    .pipe(_if(isProduction, rename(MAIN_CSS_FILE_NAME_MIN))) // prod rename
    .pipe(size({
      showFiles: true,
      showTotal: true
    }))
    .pipe(dest(_dest))
}

// Export main .html file
const html = () => {
  const _src = config.html.src
  const _dest = config.html.dest
  return src(_src)
    .pipe(html_file_include({
      prefix: '@@',
      basepath: '@file',
      indent: true
    }))
    .pipe(replace(ENTRY_POINT, config.js.outfile)) // replacement
    .pipe(_if(isProduction, replace(MAIN_CSS_FILE_NAME, MAIN_CSS_FILE_NAME_MIN))) // replacement prod
    .pipe(size({
      showFiles: true,
      showTotal: true
    }))
    .pipe(dest(_dest))
}

// Export images files
const image = () => {
  const _src = config.image.src
  const _dest = config.image.dest
  return src(_src)
    .pipe(size({
      showFiles: true,
      showTotal: true
    }))
    .pipe(dest(_dest))
}


// Open localhost
const _open = () => {
  const port = 3000
  const uri = `http://localhost:${port}`
  return src(__filename).pipe(open({
    uri: uri
  }))
}

// Start express server with nodemon
const startExpress = () => {
  nodemon({
    script: './server.js',
    ignore: ['gulpfile.js']
  })
}

// log succes message when build series is done
const build_success = (done) => {
  log('All build tasks completed successfully.'.green)
  done()
}

// Define watchers
const watch_js = () => watch(config.js.src, esbuild).on('change', () => log("Watching 'js'"))
const watch_sass = () => watch(config.scss.glob, sass).on('change', () => log("Watching 'sass'"))
const watch_html = () => watch(config.html.glob, html).on('change', () => log("Watching 'html'"))

/**
 * ------------------------------------------------------------------------
 * Functions Invocation
 * ------------------------------------------------------------------------
 */
// create JS bundle and watch JS file changes
const dev = parallel(
  series(
    logger,
    esbuild,
    sass,
    html,
    image,
    _open,
    startExpress,
  ),
  watch_html,
  watch_js,
  watch_sass
)

const build = series(
  logger,
  del,
  image,
  esbuild,
  sass,
  html,
  build_success,
)

/**
 * ------------------------------------------------------------------------
 * Functions/Modules Exportation
 * ------------------------------------------------------------------------
 */
module.exports = {
  esbuild,
  sass,
  html,
  image,
  _open,
  del,
  dev,
  build,
  startExpress
}