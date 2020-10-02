const path = require('path').posix;

const ConfigurationFile = require('./_ConfigurationFile');
const helper = require('../../../helper');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function ModuleConfigurationFile(filePath, configuration, watchMode) {
    ConfigurationFile.call(this, filePath, configuration, watchMode);
}
ModuleConfigurationFile.prototype = Object.create(ConfigurationFile.prototype);

ModuleConfigurationFile.prototype.getModuleName = function () {
    let moduleName = helper.getModuleName(
        path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules),
        this.filePath,
        this.configuration.moduleNameSeperator);
    if (!moduleName)
        moduleName = this.configuration.rootModuleFileName;
    return moduleName;
}

module.exports = ModuleConfigurationFile;