const path = require('path').posix;

const StyleFile = require('./_StyleFile');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function StandaloneLibraryDependencyStyleFile(filePath, configuration, prodMode) {
    StyleFile.call(this, filePath, configuration, prodMode);
}
StandaloneLibraryDependencyStyleFile.prototype = Object.create(StyleFile.prototype);

StandaloneLibraryDependencyStyleFile.prototype.getLibraryName = function () {
    let relative = path.relative(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneStyleLibraries), this.filePath);
    let libname = relative.split(new RegExp(path.sep, 'g'))[0];

    return libname;
}

module.exports = StandaloneLibraryDependencyStyleFile;