const StyleFile = require('./_StyleFile');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function LibrarStyleFile(filePath, configuration) {
    StyleFile.call(this, filePath, configuration);
}
LibrarStyleFile.prototype = Object.create(StyleFile.prototype);

module.exports = LibrarStyleFile;