const path = require('path').posix;

const StyleFile = require('./_StyleFile');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function VendorStyleMapFile(filePath, vendorName, configuration) {
    StyleFile.call(this, filePath, configuration);

    this.vendorName = vendorName;
}
VendorStyleMapFile.prototype = Object.create(StyleFile.prototype);

VendorStyleMapFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.vendorStyles,
        this.vendorName,
        path.basename(this.filePath));
}

module.exports = VendorStyleMapFile;