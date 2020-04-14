const path = require('path').posix;
const fs = require('fs');

const ScriptFile = require('./_ScriptFile');
const helper = require('../../../helper');

/**
 * 
 * @constructor
 * @param {string} filePath 
 * @param {string} vendorName
 * @param {Configuration} configuration 
 */
function VendorScriptFile(filePath, vendorName, configuration) {
    ScriptFile.call(this, filePath, configuration);

    this.vendorName = vendorName;

    this.parentModuleMarkupFiles = [];
}
VendorScriptFile.prototype = Object.create(ScriptFile.prototype);

VendorScriptFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.vendorScripts,
        path.basename(this.filePath));
}
VendorScriptFile.prototype.transfer = function () {
    console.log(`Transfering vendor script file. Vendor name: ${this.vendorName}; File path: ${this.filePath}`);
    if (!fs.existsSync(path.dirname(this.getOutputPath())))
        helper.createDir(path.dirname(this.getOutputPath()));
    fs.writeFileSync(this.getOutputPath(), fs.readFileSync(this.filePath));

    if (this.mapFile) {
        console.log(`Transfering map file. Vendor name: ${this.vendorName}; File path: ${this.mapFile.filePath}`);
        fs.writeFileSync(this.mapFile.getOutputPath(), fs.readFileSync(this.mapFile.filePath));
    }
}

module.exports = VendorScriptFile;