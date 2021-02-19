const path = require('path').posix;

const StyleFile = require('./_StyleFile');
const helper = require('../../../helper');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration
 * @param {boolean} prodMode 
 * @constructor
 * @augments StyleFile
 */
function ComponentStyleFile(filePath, configuration, prodMode) {
    StyleFile.call(this, filePath, configuration, prodMode);
    
    this.componentMarkupFile = null;
}
ComponentStyleFile.prototype = Object.create(StyleFile.prototype);

ComponentStyleFile.prototype.getComponentName = function () {
    let componentName = helper.getModuleName(
        path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.components),
        this.filePath,
        this.configuration.nameSeperator);
    return componentName;
}
ComponentStyleFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.componentStyles,
        this.getComponentName(),
        this.getComponentName()) + '.css';
}
ComponentStyleFile.prototype.build = function (prodMode) {
    return helper.buildStyle(this.filePath, this.getOutputPath(), prodMode);
}

module.exports = ComponentStyleFile;