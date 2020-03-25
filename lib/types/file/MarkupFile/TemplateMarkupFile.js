const MarkupFile = require('./_MarkupFile');

/**
 * 
 * @constructor
 * @param {string} filePath
 * @param {Configuration} configuration
 */
function TemplateMarkupFile(filePath, configuration) {
    MarkupFile.call(this, filePath, configuration);

    this.childrenModuleMarkupFiles = [];
}
TemplateMarkupFile.prototype = Object.create(MarkupFile.prototype);

module.exports = TemplateMarkupFile;