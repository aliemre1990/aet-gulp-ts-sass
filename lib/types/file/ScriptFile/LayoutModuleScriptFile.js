const path = require('path').posix;

const ScriptFile = require('./_ScriptFile');
const helper = require('../../../helper');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function LayoutModuleScriptFile(filePath, configuration) {
    ScriptFile.call(this, filePath, configuration);

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
    return path.join(this.configuration.outputDirectories.layoutModuleScripts, this.getModuleName()) + '.js';
}
LayoutModuleScriptFile.prototype.build = function (prodMode) {
    return helper.buildScript(this.filePath, this.getOutputPath(), prodMode);
}


module.exports = LayoutModuleScriptFile;