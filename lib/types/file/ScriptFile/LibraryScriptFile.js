const ScriptFile = require('./_ScriptFile');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function LibraryScriptFile(filePath, configuration, prodMode) {
    ScriptFile.call(this, filePath, configuration, prodMode);
}
LibraryScriptFile.prototype = Object.create(ScriptFile.prototype);

module.exports = LibraryScriptFile;