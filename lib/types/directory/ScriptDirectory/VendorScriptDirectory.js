const path = require('path').posix;
const fs = require('fs');
const fsExtra = require('fs-extra');

const ScriptDirectory = require('./_ScriptDirectory');
const helper = require('../../../helper');

/**
 * 
 * @constructor
 * @param {string} directoryPath 
 * @param {string} vendorName
 * @param {string[]} relativePathsOfReferences
 * @param {Configuration} configuration 
 */
function VendorScriptDirectory(directoryPath, vendorName, relativePathsOfReferences, configuration) {
    ScriptDirectory.call(this, directoryPath, configuration);

    this.vendorName = vendorName;
    this.relativePathsOfReferences = relativePathsOfReferences;

    this.parentModuleMarkupFiles = [];
}
VendorScriptDirectory.prototype = Object.create(ScriptDirectory.prototype);

VendorScriptDirectory.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.vendorScripts,
        this.vendorName);
}
VendorScriptDirectory.prototype.transfer = function () {
    console.log(`Transfering vendor script directory. Vendor name: ${this.vendorName}; Directory path: ${this.directoryPath}`);
    if (!fs.existsSync(path.dirname(this.getOutputPath())))
        helper.createDir(path.dirname(this.getOutputPath()));
    fsExtra.copySync(this.directoryPath, this.getOutputPath());
}

module.exports = VendorScriptDirectory;