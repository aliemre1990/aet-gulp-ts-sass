const { posix: path } = require('path');

const MarkupFile = require('./_MarkupFile');
const helper = require('../../../helper');

/**
 * 
 * @param {*} filePath 
 * @param {Configuration} configuration 
 * @param {*} prodMode 
 * @constructor
 * @augments MarkupFile
 */
function ComponentMarkupFile(filePath, configuration, prodMode) {
    MarkupFile.call(this, filePath, configuration, prodMode);

    this.componentScriptFile = null;
    this.componentStyleFile = null;
}

ComponentMarkupFile.prototype = Object.create(MarkupFile.prototype);

ComponentMarkupFile.prototype.getComponentName = function () {
    let componentName = helper.getModuleName(
        path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.components),
        this.filePath,
        this.configuration.nameSeperator);
    return componentName;
}

ComponentMarkupFile.prototype.getExpression = function () {
    let componentName = this.getComponentName();
    let expression = `>${componentName}_${this.configuration.componentPostFix}`;
}

module.exports = ComponentMarkupFile;