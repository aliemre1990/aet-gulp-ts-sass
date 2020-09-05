const Directory = require('../_Directory');

/**
 *  
 * @constructor
 * @param {string} directoryPath 
 * @param {Configuration} configuration 
 */
function ScriptDirectory(directoryPath, configuration) {
    Directory.call(this, directoryPath, configuration);
}
ScriptDirectory.prototype = Object.create(Directory.prototype);

module.exports = ScriptDirectory;