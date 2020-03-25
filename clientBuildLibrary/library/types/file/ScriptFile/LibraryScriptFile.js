const ScriptFile = require('./_ScriptFile');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function LibraryScriptFile(filePath, configuration) {
    ScriptFile.call(this, filePath, configuration);
}
LibraryScriptFile.prototype = Object.create(ScriptFile.prototype);

module.exports = LibraryScriptFile;