const path = require('path').posix;

const ScriptFile = require('./_ScriptFile');
const helper = require('../../../helper');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function ModuleScriptFile(filePath, configuration) {
    ScriptFile.call(this, filePath, configuration);

    this.parentModuleMarkupFile = null;
}
ModuleScriptFile.prototype = Object.create(ScriptFile.prototype);

ModuleScriptFile.prototype.getModuleName = function () {
    let moduleName = helper.getModuleName(
        this.configuration.inputDirectories.modules,
        this.filePath,
        this.configuration.moduleNameSeperator);
    if (!moduleName)
        moduleName = this.configuration.rootModuleFileName;
    return moduleName;
}
ModuleScriptFile.prototype.getOutputPath = function () {
    return path.join(this.configuration.outputDirectories.moduleScripts, this.getModuleName()) + '.js';
}
ModuleScriptFile.prototype.build = function (prodMode) {
    return helper.buildScript(this.filePath, this.getOutputPath(), prodMode, this.configuration.typingsDirectory);
}

module.exports = ModuleScriptFile;