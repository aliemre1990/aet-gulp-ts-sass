const path = require('path').posix;

const ScriptFile = require('./_ScriptFile');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function VendorScriptMapFile(filePath, vendorName, configuration, prodMode) {
    ScriptFile.call(this, filePath, configuration, prodMode);

    this.vendorName = vendorName;
}
VendorScriptMapFile.prototype = Object.create(ScriptFile.prototype);

VendorScriptMapFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.vendorScripts,
        this.vendorName,
        path.basename(this.filePath));
}

module.exports = VendorScriptMapFile;