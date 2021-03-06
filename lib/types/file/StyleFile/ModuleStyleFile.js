const path = require('path').posix;

const StyleFile = require('./_StyleFile');
const helper = require('../../../helper');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function ModuleStyleFile(filePath, configuration, prodMode) {
    StyleFile.call(this, filePath, configuration, prodMode);

    this.parentModuleMarkupFile = null;
}
ModuleStyleFile.prototype = Object.create(StyleFile.prototype);

ModuleStyleFile.prototype.getModuleName = function () {
    let moduleName = helper.getModuleName(
        path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules),
        this.filePath,
        this.configuration.nameSeperator);
    if (!moduleName)
        moduleName = this.configuration.rootModuleFileName;
    return moduleName;
}
ModuleStyleFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.moduleStyles,
        this.getModuleName(),
        this.getModuleName()) + '.css';
}
ModuleStyleFile.prototype.build = function (prodMode) {
    return helper.buildStyle(this.filePath, this.getOutputPath(), prodMode);
}

module.exports = ModuleStyleFile;