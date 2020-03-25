const File = require('../_File');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function MarkupFile(filePath, configuration) {
    File.call(this, filePath, configuration);
}

MarkupFile.prototype = Object.create(File);

module.exports = MarkupFile;