const fs = require('fs');
const path = require('path').posix;

const File = require('../_File');
const helper = require('../../../helper');

/**
 *  
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function ScriptFile(filePath, configuration, prodMode) {
    File.call(this, filePath, configuration, prodMode);

    this.parentScriptFiles = [];
    this.childrenScriptFiles = [];
}
ScriptFile.prototype = Object.create(File.prototype);

ScriptFile.prototype.findImportedScriptFilePaths = function () {
    let result = [];

    let fileContent = fs.readFileSync(this.filePath).toString();
    let importStatements = fileContent.match(helper.tsImportRegex);
    let scriptExtension = this.configuration.projectType === 'javascript' ? '.js' : '.ts';
    if (importStatements) {
        for (let importStatement of importStatements) {
            let match = importStatement.match(/['"].*['"]/gm)[0];
            let importedFilePath = match.substring(1, match.length - 1);//remove quotes
            importedFilePath = path.resolve(path.dirname(this.filePath), importedFilePath);//find file path
            importedFilePath = importedFilePath.substring(process.cwd().length + 1, importedFilePath.length);//remove cwd
            importedFilePath += scriptExtension;

            if (fs.existsSync(importedFilePath))
                result.push(importedFilePath);
        }
    }
    if (result.length > 0)
        return result;
    else
        return null;
}

module.exports = ScriptFile;