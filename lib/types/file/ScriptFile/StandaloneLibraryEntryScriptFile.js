const path = require('path').posix;

const helper = require('../../../helper')
const ScriptFile = require('./_ScriptFile');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function StandaloneLibraryEntryScriptFile(filePath, configuration, prodMode) {
    ScriptFile.call(this, filePath, configuration, prodMode);

    this.parentModuleMarkupFiles = [];
}
StandaloneLibraryEntryScriptFile.prototype = Object.create(ScriptFile.prototype);

StandaloneLibraryEntryScriptFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.standaloneScriptLibraries,
        this.getLibraryName(),
        this.getLibraryName()) + '.js';
}
StandaloneLibraryEntryScriptFile.prototype.getLibraryName = function () {
    let scriptExtension = this.configuration.projectType === 'javascript' ? '.js' : '.ts';

    if (path.dirname(this.filePath) === path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneScriptLibraries)) //if single file library
        return path.basename(this.filePath).replace(scriptExtension, '');
    else
        return path.basename(path.dirname(this.filePath));
}
StandaloneLibraryEntryScriptFile.prototype.build = function (prodMode) {
    return helper.buildScript(this.configuration, this.filePath, this.getOutputPath(), prodMode);
}


module.exports = StandaloneLibraryEntryScriptFile;