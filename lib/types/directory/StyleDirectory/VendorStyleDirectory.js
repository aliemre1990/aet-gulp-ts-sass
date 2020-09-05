const path = require('path').posix;
const fs = require('fs');
const fsExtra = require('fs-extra');

const StyleDirectory = require('./_StyleDirectory');
const helper = require('../../../helper');

/**
 * 
 * @constructor
 * @param {string} directoryPath 
 * @param {string} vendorName
 * @param {string[]} relativePathsOfReferences
 * @param {Configuration} configuration 
 */
function VendorStyleDirectory(directoryPath, vendorName, relativePathsOfReferences, configuration) {
    StyleDirectory.call(this, directoryPath, configuration);

    this.vendorName = vendorName;
    this.relativePathsOfReferences = relativePathsOfReferences;

    this.parentModuleMarkupFiles = [];
}
VendorStyleDirectory.prototype = Object.create(StyleDirectory.prototype);

VendorStyleDirectory.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.vendorStyles,
        this.vendorName);
}
VendorStyleDirectory.prototype.transfer = function () {
    console.log(`Transfering vendor style directory. Vendor name: ${this.vendorName}; Directory path: ${this.directoryPath}`);
    if (!fs.existsSync(path.dirname(this.getOutputPath())))
        helper.createDir(path.dirname(this.getOutputPath()));
    fsExtra.copySync(this.directoryPath, this.getOutputPath());
}

module.exports = VendorStyleDirectory;