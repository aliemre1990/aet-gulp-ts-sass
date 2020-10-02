const fs = require('fs');
const path = require('path').posix;

const File = require('../_File');
const helper = require('../../../helper');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function StyleFile(filePath, configuration, watchMode) {
    File.call(this, filePath, configuration, watchMode);

    this.parentStyleFiles = [];
    this.childrenStyleFiles = [];
}
StyleFile.prototype = Object.create(File.prototype);

StyleFile.prototype.findImportedStyleFilePaths = function () {
    let result = [];

    let fileContent = fs.readFileSync(this.filePath).toString();
    let importStatements = fileContent.match(helper.sassImportRegex);

    if (importStatements) {
        for (let importStatement of importStatements) {
            let matches = importStatement.match(/['"].*['"]/gm);
            for (var match of matches) {
                let importedFilePath = match.substring(1, match.length - 1);//remove quotes
                importedFilePath = path.resolve(path.dirname(this.filePath), importedFilePath);
                importedFilePath = importedFilePath.substring(process.cwd().length + 1, importedFilePath.length);
                importedFilePath += '.scss';

                if (fs.existsSync(importedFilePath))
                    result.push(importedFilePath);
            }
        }
    }
    if (result.length > 0)
        return result;
    else
        return null;
}

module.exports = StyleFile;