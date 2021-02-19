const fs = require('fs');

const Handlebars = require('handlebars');

const File = require('../_File');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function MarkupFile(filePath, configuration, prodMode) {
    File.call(this, filePath, configuration, prodMode);
}

MarkupFile.prototype = Object.create(File);

module.exports = MarkupFile;