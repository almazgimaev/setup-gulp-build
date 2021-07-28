const { src, dest, watch, series, parallel } = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const sass = require('gulp-sass')(require('sass'));
const browserSync = require("browser-sync").create();
const csso = require("gulp-csso");
const concat = require("gulp-concat");
const del = require("del");
const GulpUglify = require("gulp-uglify");
const htmlmin = require("gulp-htmlmin");
const imageMin = require("gulp-imagemin");
const newer = require("gulp-newer");


// Блок для разработки (внутри папки app)
// function html() {
//   return src('app/**.html')
//   .pipe(browserSync.reload({ stream: true }))
// }

function css() {
  return src('app/src/sass/**/*.sass')
  .pipe(sass())
  .pipe(autoprefixer({
    cascade: 'true'
  }))
  .pipe(csso())
  .pipe(concat('style.css'))
  .pipe(dest('./app/css'))
  .pipe(browserSync.stream())
}

function js() {
  return src('app/src/scripts/**/*.js')
  .pipe(concat('app.js'))
  .pipe(GulpUglify())
  .pipe(dest('app/js'))
  .pipe(browserSync.stream())
}

function imgMin() {
  return src('app/src/img/src/**/*')
  .pipe(newer('app/src/img/light'))
  .pipe(imageMin())
  .pipe(dest('app/src/img/light'))
}

function clearApp() {
  return del([
    'app/css/style.css',
    'app/js/app.js'
  ])
}

function startWatch() {
  watch('app/index.html').on('change', browserSync.reload);
  watch('app/src/sass/**/*.sass', series(css));
  watch('app/src/scripts/**/*.js', series(js));
  watch('app/src/img/src', series(imgMin))
}

function serve() {
  browserSync.init({
    server: { baseDir: 'app/' },
    online: true,
    notify: false,
    // host: "192.168.0.11"
  })
}


// Блок для сборки готового (в папку dist)

function buildCopy() {
  del('dist/*/*')
  imgMin()
  return src([
      'app/css/style.css',
      'app/js/app.js',
      'app/src/img/light/**/*',
      'app/index.html'
      // 'app/src/fonts/**/*'
  ], { base: 'app' })
  .pipe(dest('dist/'))
}


// Блок экспорта 

exports.build = series( buildCopy ) //сборка готового пакета (сжатие изображений, удаления содержимого dist, копирование компилированных файлов из app в dist)


exports.default = parallel(clearApp, css, js, imgMin, serve, startWatch)
//сборка  пакета в режиме онлайн для верстки (очистка старых скомпилированных файлов, комплияция новых файлов, сжатие изображений, запуск сервера и слежка за изменениями)