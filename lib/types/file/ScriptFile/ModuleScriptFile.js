const path = require('path').posix;

const ScriptFile = require('./_ScriptFile');
const helper = require('../../../helper');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function ModuleScriptFile(filePath, configuration, watchMode) {
    ScriptFile.call(this, filePath, configuration, watchMode);
    
    this.parentModuleMarkupFile = null;
}
ModuleScriptFile.prototype = Object.create(ScriptFile.prototype);

ModuleScriptFile.prototype.getModuleName = function () {
    let moduleName = helper.getModuleName(
        path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules),
        this.filePath,
        this.configuration.moduleNameSeperator);
    if (!moduleName)
        moduleName = this.configuration.rootModuleFileName;
    return moduleName;
}
ModuleScriptFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.moduleScripts,
        this.getModuleName(),
        this.getModuleName()) + '.js';
}
ModuleScriptFile.prototype.build = function (prodMode) {
    return helper.buildScript(this.configuration, this.filePath, this.getOutputPath(), prodMode);
}

module.exports = ModuleScriptFile;