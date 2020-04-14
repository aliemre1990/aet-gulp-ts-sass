const path = require('path').posix;
const fs = require('fs');

const StyleFile = require('./_StyleFile');
const helper = require('../../../helper');

/**
 * 
 * @param {string} filePath 
 * @param {string} vendorName
 * @param {Configuration} configuration 
 * @constructor
 */
function VendorStyleFile(filePath, vendorName, configuration) {
    StyleFile.call(this, filePath, configuration);

    this.vendorName = vendorName;

    this.parentModuleMarkupFiles = [];
    this.mapFile = null;
}
VendorStyleFile.prototype = Object.create(StyleFile.prototype);

VendorStyleFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.vendorStyles,
        path.basename(this.filePath));
}
VendorStyleFile.prototype.transfer = function () {
    console.log(`Transfering vendor style file. Vendor name: ${this.vendorName}; File path: ${this.filePath}`);
    if (!fs.existsSync(path.dirname(this.getOutputPath())))
        helper.createDir(path.dirname(this.getOutputPath()));
    fs.writeFileSync(this.getOutputPath(), fs.readFileSync(this.filePath));

    if (this.mapFile) {
        console.log(`Transfering map file. Vendor name: ${this.vendorName}; File path: ${this.mapFile.filePath}`);
        fs.writeFileSync(this.mapFile.getOutputPath(), fs.readFileSync(this.mapFile.filePath));
    }
}

module.exports = VendorStyleFile;