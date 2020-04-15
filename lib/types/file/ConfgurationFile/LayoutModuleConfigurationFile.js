const path = require('path').posix;

const ConfigurationFile = require('./_ConfigurationFile');
const helper = require('../../../helper');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function LayoutModuleConfigurationFile(filePath, configuration) {
    ConfigurationFile.call(this, filePath, configuration);
}
LayoutModuleConfigurationFile.prototype = Object.create(ConfigurationFile.prototype);

LayoutModuleConfigurationFile.prototype.getModuleName = function () {
    let moduleName = helper.getModuleName(
        this.configuration.inputDirectories.layoutModules,
        this.filePath,
        this.configuration.moduleNameSeperator);
    if (!moduleName)
        moduleName = this.configuration.rootModuleFileName;
    return moduleName;
}

module.exports = LayoutModuleConfigurationFile;