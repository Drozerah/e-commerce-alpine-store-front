# Alpine.js esbuild

> Evaluate Alpine.js with esbuild bundler and gulp taks runner

Installation:
```bash
$ nmp install
```
```json
  "devDependencies": {
    "gulp": "^4.0.2",
    "gulp-esbuild": "^0.10.3",
    "gulp-size": "^4.0.1"
  }
```
Usage:

Watch your `./app.js` entry file for changes, output your `./js/app.bundle.js` bundled file

```bash
$ npm run dev
```
```json
 "scripts": {
    "dev": "gulp dev"
  },
```
Options:
Choose your bundle format `'iife'|'cjs'|'esm'`

`gulpfile.js`

```javascript
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
```