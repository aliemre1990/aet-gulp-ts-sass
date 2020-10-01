const fs = require('fs');

const File = require('../_File');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function MarkupFile(filePath, configuration) {
    File.call(this, filePath, configuration);

    this.content = fs.readFileSync(this.filePath).toString();
}

MarkupFile.prototype = Object.create(File);
MarkupFile.prototype.placeContent = function (contentToBePlaced) {
    let result = this.content.replace(new RegExp(this.configuration.contentPlaceHolder), contentToBePlaced);
    return result;
}
MarkupFile.prototype.getContent = function (contentToBePlaced) {
    let result;
    if (contentToBePlaced || contentToBePlaced === '')
        result = this.placeContent(contentToBePlaced);
    else
        result = this.content;

    return result;
}

module.exports = MarkupFile;