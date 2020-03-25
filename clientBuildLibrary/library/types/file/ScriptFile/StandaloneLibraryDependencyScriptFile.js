const path = require('path').posix;

const ScriptFile = require('./_ScriptFile');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function StandaloneLibraryDependencyScriptFile(filePath, configuration) {
    ScriptFile.call(this, filePath, configuration);

}
StandaloneLibraryDependencyScriptFile.prototype = Object.create(ScriptFile.prototype);

StandaloneLibraryDependencyScriptFile.prototype.getLibraryName = function () {
    let relative = path.relative(this.configuration.inputDirectories.standaloneScriptLibraries, this.filePath);
    let libname = relative.split(new RegExp(path.sep, 'g'))[0];

    return libname;
}

module.exports = StandaloneLibraryDependencyScriptFile;