const path = require('path').posix;

const ScriptFile = require('./_ScriptFile');
const helper = require('../../../helper');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @param {boolean} prodMode
 * @augments ScriptFile
 */
function ComponentScriptFile(filePath, configuration, prodMode) {
    ScriptFile.call(this, filePath, configuration, prodMode);

    this.componentMarkupFile = null;
}
ComponentScriptFile.prototype = Object.create(ScriptFile.prototype);

ComponentScriptFile.prototype.getComponentName = function () {
    let componentName = helper.getModuleName(
        path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.components),
        this.filePath,
        this.configuration.nameSeperator);
    return componentName;
}
ComponentScriptFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.componentScripts,
        this.getComponentName(),
        this.getComponentName()) + '.js';
}
ComponentScriptFile.prototype.build = function (prodMode) {
    return helper.buildScript(this.configuration, this.filePath, this.getOutputPath(), prodMode);
}

module.exports = ComponentScriptFile;