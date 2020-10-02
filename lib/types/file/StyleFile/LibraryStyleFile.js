const StyleFile = require('./_StyleFile');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function LibrarStyleFile(filePath, configuration, watchMode) {
    StyleFile.call(this, filePath, configuration, watchMode);
}
LibrarStyleFile.prototype = Object.create(StyleFile.prototype);

module.exports = LibrarStyleFile;