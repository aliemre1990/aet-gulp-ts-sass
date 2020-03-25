const path = require('path').posix;

const StyleFile = require('./_StyleFile');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function StandaloneLibraryDependencyStyleFile(filePath, configuration) {
    StyleFile.call(this, filePath, configuration);
}
StandaloneLibraryDependencyStyleFile.prototype = Object.create(StyleFile.prototype);

StandaloneLibraryDependencyStyleFile.prototype.getLibraryName = function () {
    let relative = path.relative(this.configuration.inputDirectories.standaloneStyleLibraries, this.filePath);
    let libname = relative.split(new RegExp(path.sep, 'g'))[0];

    return libname;
}

module.exports = StandaloneLibraryDependencyStyleFile;