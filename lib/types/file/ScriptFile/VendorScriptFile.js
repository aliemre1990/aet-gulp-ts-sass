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
function VendorScriptFile(filePath, vendorName, configuration, prodMode) {
    ScriptFile.call(this, filePath, configuration, prodMode);

    this.vendorName = vendorName;

    this.parentModuleMarkupFiles = [];
}
VendorScriptFile.prototype = Object.create(ScriptFile.prototype);

VendorScriptFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.vendorScripts,
        this.vendorName,
        path.basename(this.filePath));
}
VendorScriptFile.prototype.transfer = function () {
    return new Promise((resolve, reject) => {
        console.log(`Transfering vendor script file. Vendor name: ${this.vendorName}; File path: ${this.filePath}`);
        if (!fs.existsSync(path.dirname(this.getOutputPath())))
            helper.createDir(path.dirname(this.getOutputPath()));
        fs.writeFileSync(this.getOutputPath(), fs.readFileSync(this.filePath));

        resolve();
    });
}

module.exports = VendorScriptFile;