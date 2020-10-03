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
}
module.exports = Module;