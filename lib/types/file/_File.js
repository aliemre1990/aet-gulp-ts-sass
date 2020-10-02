/**
 * 
 * @param {string} filePath 
 * @param {Configuration} configuration 
 * @constructor
 */
function File(filePath, configuration, watchMode) {
    this.filePath = filePath;
    this.configuration = configuration;

    if (watchMode) {
        Object.defineProperty(this, 'content', {
            get: function () {
                return fs.readFileSync(this.filePath).toString();
            }
        });
    } else {
        this.content = fs.readFileSync(this.filePath).toString();
    }
}

module.exports = File;