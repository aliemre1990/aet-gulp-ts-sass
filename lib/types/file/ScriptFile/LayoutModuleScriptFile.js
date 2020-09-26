const path = require('path').posix;

const ScriptFile = require('./_ScriptFile');
const helper = require('../../../helper');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function LayoutModuleScriptFile(filePath, configuration, tsCompilerOptions) {
    ScriptFile.call(this, filePath, configuration);

    this.tsCompilerOptions = tsCompilerOptions;

    this.parentLayoutModuleMarkupFile = null;
}
LayoutModuleScriptFile.prototype = Object.create(ScriptFile.prototype);

LayoutModuleScriptFile.prototype.getModuleName = function () {
    let moduleName = helper.getModuleName(
        this.configuration.inputDirectories.layoutModules,
        this.filePath,
        this.configuration.moduleNameSeperator);
    if (!moduleName)
        moduleName = this.configuration.rootModuleFileName;
    return moduleName;
}
LayoutModuleScriptFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.layoutModuleScripts,
        this.getModuleName(),
        this.getModuleName()) + '.js';
}
LayoutModuleScriptFile.prototype.build = function (prodMode) {
    return helper.buildScript(this.configuration, this.filePath, this.getOutputPath(), prodMode);
}


module.exports = LayoutModuleScriptFile;