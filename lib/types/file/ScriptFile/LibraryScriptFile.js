const ScriptFile = require('./_ScriptFile');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function LibraryScriptFile(filePath, configuration, watchMode) {
    ScriptFile.call(this, filePath, configuration, watchMode);
}
LibraryScriptFile.prototype = Object.create(ScriptFile.prototype);

module.exports = LibraryScriptFile;