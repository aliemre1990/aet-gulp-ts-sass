const path = require('path').posix;
const fs = require('fs');

const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const gulpTypeScript = require('gulp-typescript');
const gulpSourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const tsify = require('tsify');
const vinylSourceStream = require('vinyl-source-stream');

/**
 * 
 * @param {string} directoryPath
 * @param {Configuration} configuration
 * @constructor
 */
function Module(directoryPath, configuration) {
    this.directoryPath = directoryPath;
    this.configuration = configuration;

    this.markupFile;
    this.moduleStyleFile;
    this.moduleScriptFile;
}

/**
 * 
 * @returns {string}
 */
Module.prototype.getModuleName = function () {
    let relative = path.relative(this.configuration.inputDirectories.modules, this.directoryPath);
    if (relative === '')
        return this.configuration.rootModuleFileName;
    else
        return relative.replace(new RegExp(path.sep, 'g'), this.configuration.moduleNameSeperator);
}

/**
 * 
 * @param {boolean} clientProdMode
 * @param {boolean} clientWatchMode
 */
Module.prototype.build = function (clientProdMode = false, clientWatchMode = false) {
    if (clientProdMode && clientWatchMode)
        throw 'Watch mode only allowed in development mode';

    if (clientProdMode) {

        console.log(`Building markup file. Module name: ${this.getModuleName()}`);
        fs.writeFileSync(this.markupFile.getOutputPath(), this.markupFile.getContent(true));

        console.log(`Building module style file. Module name: ${this.getModuleName()}`);
        gulp.src(this.moduleStyleFile.filePath)
            .pipe(gulpSass())
            .pipe(gulp.dest(path.dirname(this.moduleStyleFile.getOutputPath())));

        console.log(`Building module script file. Module name: ${this.getModuleName()}`);
        gulp.src(this.moduleScriptFile.filePath)
            .pipe(gulpTypeScript({
                outFile: path.basename(this.moduleScriptFile.getOutputPath).replace(/.ts/, '.js')
            }))
            .pipe(gulp.dest(path.dirname(this.moduleScriptFile.getOutputPath)));

    } else {

        console.log(`Building markup file. Module name: ${this.getModuleName()}`);
        fs.writeFileSync(this.markupFile.getOutputPath(), this.markupFile.getContent(false));

        console.log(`Building module style file. Module name: ${this.getModuleName()}`);
        buildStyleDevMode();

        console.log(`Building module script file. Module name: ${this.getModuleName()}`);
        buildScriptDevMode()

        if (clientWatchMode) {
            var styleWathcer = gulp.watch(this.moduleStyleFile.filePath);
            styleWathcer.on('change', (filePath, stats) => {
                console.log(`Module style file changed. Module name: ${this.getModuleName}`);
                buildStyleDevMode();
            })

            var scriptWatcher = gulp.watch(this.moduleScriptFile.filePath);
            scriptWatcher.on('change', (filePath, stats) => {
                console.log(`Module script file changed. Module name: ${this.getModuleName}`);
                buildScriptDevMode();
            });
        }

    }
}

function buildScriptDevMode() {
    browserify({
        entries: this.moduleScriptFile.filePath
    })
        .plugin(tsify)
        .bundle()
        .pipe(vinylSourceStream(path.basename(this.moduleScriptFile.getOutputPat()).replace(/.ts/, '.js')))
        .pipe(gulp.dest(path.dirname(this.moduleScriptFile.getOutputPath)));
}

function buildStyleDevMode() {
    gulp.src(this.moduleStyleFile.filePath)
        .pipe(gulpSourcemaps.init())
        .pipe(gulpSass())
        .pipe(gulpSourcemaps.write())
        .pipe(gulp.dest(path.dirname(this.moduleStyleFile.getOutputPath())));
}

module.exports = Module;