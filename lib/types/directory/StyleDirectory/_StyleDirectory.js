const Directory = require('../_Directory');

/**
 *  
 * @constructor
 * @param {string} directoryPath 
 * @param {Configuration} configuration 
 */
function StyleDirectory(directoryPath, configuration) {
    Directory.call(this, directoryPath, configuration);
}
StyleDirectory.prototype = Object.create(Directory.prototype);

module.exports = StyleDirectory;