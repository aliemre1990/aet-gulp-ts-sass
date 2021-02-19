const MarkupFile = require('./_MarkupFile');

/**
 * 
 * @constructor
 * @param {string} filePath
 * @param {Configuration} configuration
 */
function TemplateMarkupFile(filePath, configuration, prodMode) {
    MarkupFile.call(this, filePath, configuration, prodMode);

    this.childrenModuleMarkupFiles = [];
    this.dataProviders = [];
}

TemplateMarkupFile.prototype = Object.create(MarkupFile.prototype);

module.exports = TemplateMarkupFile;