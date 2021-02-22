const fs = require('fs');
const path = require('path').posix;

const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpRename = require('gulp-rename');
const browserify = require('browserify');
const vinylSourceStream = require('vinyl-source-stream');
const tsify = require('tsify');
const Handlebars = require('handlebars');

const tsImportRegex = /import(?:["'\s]*([\w*${}\n\r\t, ]+)from\s*)?["'\s]["'\s](.*[@\w_-]+)["'\s].*;$/gm;
const sassImportRegex = /(@import.*;)|(@import.*(\r\n|\r|\n).*;)/gm;

/**
 * 
 * @param {string} dir 
 * @param {string[]} extensions 
 */
function findFilesRecursively(dir, extensions, includeDirectories = false, includeFiles = true, result = []) {
    var docs = fs.readdirSync(dir);

    var foundDirs = docs.filter(x => fs.lstatSync(path.join(dir, x)).isDirectory()).map(x => path.join(dir, x));
    if (includeDirectories) {
        result.push(...foundDirs);
    }

    if (includeFiles) {
        var foundFiles = docs.filter(x => fs.lstatSync(path.join(dir, x)).isFile());
        if (extensions) {
            foundFiles = foundFiles.filter(x => extensions.includes(path.extname(x)));
            result.push(...foundFiles.map(x => path.join(dir, x)));
        } else {
            result.push(...foundFiles.map(x => path.join(dir, x)));
        }
    }

    for (var foundDir of foundDirs) {
        findFilesRecursively(foundDir, extensions, includeDirectories, includeFiles, result);
    }

    return result;
}

/**
 * 
 * @param {string} relativePath 
 * @param {string} filePath 
 * @param {string} nameSeperator 
 */
function getModuleName(relativePath, filePath, nameSeperator) {
    var relative = path.relative(relativePath, path.dirname(filePath));
    if (relative)
        return relative.replace(new RegExp(path.sep, 'g'), nameSeperator);
}

function createDir(dirname) {
    if (!fs.existsSync(dirname))
        fs.mkdirSync(dirname, { recursive: true });
}

/**
 * 
 * @param {Configuration} configuration 
 * @param {string} inputPath 
 * @param {string} outputPath 
 * @param {boolean} prodMode 
 */
function buildScript(configuration, inputPath, outputPath, prodMode) {
    return new Promise((resolve, reject) => {
        console.log(`Building script file... File path: ${inputPath}`);

        let projectType = configuration.projectType;
        if (projectType === 'typescript') {
            browserify({
                entries: inputPath,
                debug: !prodMode
            })
                .plugin(tsify, { project: configuration.projectDirectory })
                .bundle()
                .pipe(vinylSourceStream(path.basename(outputPath)))
                .pipe(gulp.dest(path.dirname(outputPath)))
                .on('finish', () => {
                    console.log(`Build complete of script file. File path: ${inputPath}`);
                    resolve();
                })
                .on('error', () => {
                    reject(`Build failed of script file. File path: ${inputPath}`);
                });
        } else {
            browserify({
                entries: inputPath,
                debug: !prodMode
            })
                .transform("babelify", { presets: ["@babel/preset-env"] })
                .bundle()
                .pipe(vinylSourceStream(path.basename(outputPath)))
                .pipe(gulp.dest(path.dirname(outputPath)))
                .on('finish', () => {
                    console.log(`Build complete of script file. File path: ${inputPath}`);
                    resolve();
                })
                .on('error', () => {
                    reject(`Build failed of script file. File path: ${inputPath}`);
                });
        }
    });
}

function buildStyle(inputPath, outputPath, prodMode) {
    return new Promise((resolve, reject) => {
        console.log(`Building style file. File path: ${inputPath}`);

        if (prodMode) {
            gulp.src(inputPath)
                .pipe(gulpSass())
                .pipe(gulpRename(path.basename(outputPath)))
                .pipe(gulp.dest(path.dirname(outputPath)))
                .on('finish', () => {
                    console.log(`Build complete of style file. File path: ${inputPath}`);
                    resolve();
                })
                .on('error', () => {
                    reject(`Build failed of style file. File path: ${inputPath}`);
                });

        } else {
            gulp.src(inputPath)
                .pipe(gulpSourcemaps.init())
                .pipe(gulpSass())
                .pipe(gulpSourcemaps.write())
                .pipe(gulpRename(path.basename(outputPath)))
                .pipe(gulp.dest(path.dirname(outputPath)))
                .on('finish', () => {
                    console.log(`Build complete of style file. File path: ${inputPath}`);
                    resolve();
                })
                .on('error', () => {
                    reject(`Build failed of style file. File path: ${inputPath}`);
                });
        }
    });
}

/**
 * Gets the handlebars content and postfixes and returns all expressions that match the postfixes.
 * Returns an object where the keys are postFixes and values are array of expressions.
 * @param {string} content 
 * @param {string[]} postFixes 
 */
function findExpressions(content, expressions) {
    var result = {};
    var parsed = Handlebars.parse(content);

    function traverseBlockStatementRecursively(statement, postFix) {
        for (var subStatement of statement.program.body) {
            if (subStatement.type === 'MustacheStatement') {
                if (subStatement.path.original.endsWith(postFix)) {
                    if (!result[postFix]) {
                        result[postFix] = [];
                    }

                    if (!result[postFix].includes(subStatement.path.original)) {
                        result[postFix].push(subStatement.path.original);
                    }
                }

            } else if (subStatement.type === 'BlockStatement') {
                traverseBlockStatementRecursively(subStatement);
            }
        }
    }

    for (var statement of parsed.body) {

        for (var expression of expressions) {
            var postFix = expression.postFix;
            if (statement.type === 'MustacheStatement') {
                if (statement.path.original.endsWith(postFix)) {
                    if (!result[postFix]) {
                        result[postFix] = [];
                    }

                    if (!result[postFix].includes(statement.path.original)) {
                        result[postFix].push(statement.path.original);
                    }
                }
            } else if (statement.type === 'BlockStatement') {
                traverseBlockStatementRecursively(statement, postFix);
            }
        }
    }
    return result;
}



module.exports = {
    tsImportRegex,
    sassImportRegex,
    findFilesRecursively,
    getModuleName,
    createDir,
    buildScript,
    buildStyle,
    findExpressions
}