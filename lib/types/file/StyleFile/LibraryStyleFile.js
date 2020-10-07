const StyleFile = require('./_StyleFile');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function LibrarStyleFile(filePath, configuration, prodMode) {
    StyleFile.call(this, filePath, configuration, prodMode);
}
LibrarStyleFile.prototype = Object.create(StyleFile.prototype);

module.exports = LibrarStyleFile;