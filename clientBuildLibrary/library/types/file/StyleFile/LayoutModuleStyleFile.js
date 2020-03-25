const path = require('path').posix;

const StyleFile = require('./_StyleFile');
const helper = require('../../../helper');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function LayoutModuleStyleFile(filePath, configuration) {
    StyleFile.call(this, filePath, configuration);

    this.parentLayoutModuleMarkupFile = null;
}
LayoutModuleStyleFile.prototype = Object.create(StyleFile.prototype);

LayoutModuleStyleFile.prototype.getModuleName = function () {
    let moduleName = helper.getModuleName(
        this.configuration.inputDirectories.layoutModules,
        this.filePath,
        this.configuration.moduleNameSeperator);
    if (!moduleName)
        moduleName = this.configuration.rootModuleFileName;
    return moduleName;
}
LayoutModuleStyleFile.prototype.getOutputPath = function () {
    return path.join(this.configuration.outputDirectories.layoutModuleStyles, this.getModuleName()) + '.css';
}
LayoutModuleStyleFile.prototype.build = function (prodMode) {
    return helper.buildStyle(this.filePath, this.getOutputPath(), prodMode);
}


module.exports = LayoutModuleStyleFile;