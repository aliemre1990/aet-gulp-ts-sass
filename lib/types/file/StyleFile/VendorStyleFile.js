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
function VendorStyleFile(filePath, vendorName, configuration, prodMode) {
    StyleFile.call(this, filePath, configuration, prodMode);

    this.vendorName = vendorName;
    this.mapFile = null;

    this.parentModuleMarkupFiles = [];
}
VendorStyleFile.prototype = Object.create(StyleFile.prototype);

VendorStyleFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.vendorStyles,
        this.vendorName,
        path.basename(this.filePath));
}
VendorStyleFile.prototype.transfer = function () {

    return new Promise((resolve, reject) => {
        console.log(`Transfering vendor style file. Vendor name: ${this.vendorName}; File path: ${this.filePath}`);
        if (!fs.existsSync(path.dirname(this.getOutputPath())))
            helper.createDir(path.dirname(this.getOutputPath()));
        fs.writeFileSync(this.getOutputPath(), fs.readFileSync(this.filePath));

        if (this.mapFile) {
            console.log(`Transfering map file. Vendor name: ${this.vendorName}; File path: ${this.mapFile.filePath}`);
            fs.writeFileSync(this.mapFile.getOutputPath(), fs.readFileSync(this.mapFile.filePath));
        }
        resolve();
    });
}

module.exports = VendorStyleFile;