/**
 * 
 * @param {string} directoryPath 
 * @param {Configuration} configuration 
 * @constructor
 */
function Directory(directoryPath, configuration) {
    this.directoryPath = directoryPath;
    this.configuration = configuration;
}

module.exports = Directory;