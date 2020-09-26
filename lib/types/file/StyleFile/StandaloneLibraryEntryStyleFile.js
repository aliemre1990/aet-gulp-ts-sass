const path = require('path').posix;

const helper = require('../../../helper');
const StyleFile = require('./_StyleFile');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function StandaloneLibraryEntryStyleFile(filePath, configuration) {
    StyleFile.call(this, filePath, configuration);

    this.parentModuleMarkupFiles = [];
}
StandaloneLibraryEntryStyleFile.prototype = Object.create(StyleFile.prototype);

StandaloneLibraryEntryStyleFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.standaloneStyleLibraries,
        this.getLibraryName(),
        this.getLibraryName()) + '.css';
}
StandaloneLibraryEntryStyleFile.prototype.getLibraryName = function () {
    if (path.dirname(this.filePath) === path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneStyleLibraries)) // if single file library
        return path.basename(this.filePath).replace('.scss', '');
    else
        return path.basename(path.dirname(this.filePath));
}
StandaloneLibraryEntryStyleFile.prototype.build = function (prodMode) {
    return helper.buildStyle(this.filePath, this.getOutputPath(), prodMode);
}


module.exports = StandaloneLibraryEntryStyleFile;