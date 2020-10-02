const MarkupFile = require('./_MarkupFile');

/**
 * 
 * @constructor
 * @param {string} filePath
 * @param {Configuration} configuration
 */
function TemplateMarkupFile(filePath, configuration, watchMode) {
    MarkupFile.call(this, filePath, configuration, watchMode);

    this.childrenModuleMarkupFiles = [];
}
TemplateMarkupFile.prototype = Object.create(MarkupFile.prototype);
TemplateMarkupFile.prototype.placeContent = function (contentToBePlaced) {
    let result = this.content.replace(/\<body\>/, contentToBePlaced + '\r\n<body>\r\n');
    return result;
}

module.exports = TemplateMarkupFile;