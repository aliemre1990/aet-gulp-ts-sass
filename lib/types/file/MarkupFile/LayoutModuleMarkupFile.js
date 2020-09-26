const path = require('path').posix;

const MarkupFile = require('./_MarkupFile');
const helper = require('../../../helper');
/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {Configuration} configuration 
 */
function LayoutModuleMarkupFile(filePath, configuration) {
    MarkupFile.call(this, filePath, configuration);

    this.layoutModuleScriptFile = null;
    this.layoutModuleStyleFile = null;
    this.childrenModuleMarkupFiles = [];
    this.childrenLayoutModuleMarkupFiles = [];
    this.parentLayoutModuleMarkupFile = null;
}
LayoutModuleMarkupFile.prototype = Object.create(MarkupFile.prototype);

LayoutModuleMarkupFile.prototype.getModuleName = function () {
    let moduleName = helper.getModuleName(
        path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules),
        this.filePath,
        this.configuration.moduleNameSeperator);
    if (!moduleName)
        moduleName = this.configuration.rootModuleFileName;
    return moduleName;
}

module.exports = LayoutModuleMarkupFile;