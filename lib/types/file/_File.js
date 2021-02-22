const fs = require('fs');
const { posix: path } = require('path');

/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function File(filePath, configuration, prodMode) {
    this.filePath = filePath;
    this.configuration = configuration;

    if (!prodMode) {
        Object.defineProperty(this, 'content', {
            get: function () {
                return fs.readFileSync(this.filePath).toString();
            }
        });
    } else {
        this.content = fs.readFileSync(this.filePath).toString();
    }
}

File.prototype.getFileName = function () {
    return path.basename(this.filePath).replace(new RegExp(path.extname(this.filePath)), '');
}

module.exports = File;