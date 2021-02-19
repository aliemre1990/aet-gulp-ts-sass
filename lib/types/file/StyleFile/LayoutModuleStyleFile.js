const path = require('path').posix;

const StyleFile = require('./_StyleFile');
const helper = require('../../../helper');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function LayoutModuleStyleFile(filePath, configuration, prodMode) {
    StyleFile.call(this, filePath, configuration, prodMode);

    this.parentLayoutModuleMarkupFile = null;
}
LayoutModuleStyleFile.prototype = Object.create(StyleFile.prototype);

LayoutModuleStyleFile.prototype.getModuleName = function () {
    let moduleName = helper.getModuleName(
        path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules),
        this.filePath,
        this.configuration.nameSeperator);
    if (!moduleName)
        moduleName = this.configuration.rootModuleFileName;
    return moduleName;
}
LayoutModuleStyleFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.layoutModuleStyles,
        this.getModuleName(),
        this.getModuleName()) + '.css';
}
LayoutModuleStyleFile.prototype.build = function (prodMode) {
    return helper.buildStyle(this.filePath, this.getOutputPath(), prodMode);
}


module.exports = LayoutModuleStyleFile;