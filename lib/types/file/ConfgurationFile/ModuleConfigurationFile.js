const path = require('path').posix;

const ConfigurationFile = require('./_ConfigurationFile');
const helper = require('../../../helper');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function ModuleConfigurationFile(filePath, configuration, prodMode) {
    ConfigurationFile.call(this, filePath, configuration, prodMode);
}
ModuleConfigurationFile.prototype = Object.create(ConfigurationFile.prototype);

ModuleConfigurationFile.prototype.getModuleName = function () {
    let moduleName = helper.getModuleName(
        path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules),
        this.filePath,
        this.configuration.nameSeperator);
    if (!moduleName)
        moduleName = this.configuration.rootModuleFileName;
    return moduleName;
}

module.exports = ModuleConfigurationFile;