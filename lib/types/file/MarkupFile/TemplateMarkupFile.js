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
MarkupFile.prototype.placeContent = function (contentToBePlaced) {
    let result = this.content.replace(/\<body\>/, contentToBePlaced + '\r\n<body>\r\n');
    return result;
}

module.exports = TemplateMarkupFile;