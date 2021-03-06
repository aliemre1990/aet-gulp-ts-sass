const path = require('path').posix;

const ScriptFile = require('./_ScriptFile');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function StandaloneLibraryDependencyScriptFile(filePath, configuration, prodMode) {
    ScriptFile.call(this, filePath, configuration, prodMode);

}
StandaloneLibraryDependencyScriptFile.prototype = Object.create(ScriptFile.prototype);

StandaloneLibraryDependencyScriptFile.prototype.getLibraryName = function () {
    let relative = path.relative(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneScriptLibraries), this.filePath);
    let libname = relative.split(new RegExp(path.sep, 'g'))[0];

    return libname;
}

module.exports = StandaloneLibraryDependencyScriptFile;