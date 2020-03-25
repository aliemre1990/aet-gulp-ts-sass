/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function File(filePath, configuration) {
    this.filePath = filePath;
    this.configuration = configuration;
}

module.exports = File;