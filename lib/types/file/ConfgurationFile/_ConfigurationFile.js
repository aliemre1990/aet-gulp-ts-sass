const fs = require('fs');

const File = require('../_File');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function ConfigurationFile(filePath, configuration) {
    File.call(this, filePath, configuration);
}
ConfigurationFile.prototype = Object.create(File);
ConfigurationFile.prototype.getAsObject = function () {
    let fileContent = fs.readFileSync(this.filePath).toString();

    return JSON.parse(fileContent);
}

module.exports = ConfigurationFile;