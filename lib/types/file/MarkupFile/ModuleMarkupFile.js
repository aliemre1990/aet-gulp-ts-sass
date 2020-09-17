const path = require('path').posix;
const fs = require('fs');

const helper = require('../../../helper');

const MarkupFile = require('./_MarkupFile');
const VendorScriptDirectory = require('../../directory/ScriptDirectory/VendorScriptDirectory');
const VendorStyleDirectory = require('../../directory/StyleDirectory/VendorStyleDirectory');

/**
 * 
 * @constructor
 * @param {string} filePath
 * @param {Configuration} configuration
 */
function ModuleMarkupFile(filePath, configuration) {
    MarkupFile.call(this, filePath, configuration);

    this.layoutModuleMarkupFile = null;
    this.templateMarkupFile = null;
    this.moduleScriptFile = null;
    this.moduleStyleFile = null;
    this.vendorScriptDirectories = []; // Contains both vendor script files and vendor script directories
    this.vendorStyleDirectories = []; // same as above
    this.staticStyleReferences = [];
    this.staticScriptReferences = [];
    this.standaloneLibraryScriptFiles = [];
    this.standaloneLibraryStyleFiles = [];
}
ModuleMarkupFile.prototype = Object.create(MarkupFile.prototype);

ModuleMarkupFile.prototype.getModuleName = function () {
    let moduleName = helper.getModuleName(
        this.configuration.inputDirectories.modules,
        this.filePath,
        this.configuration.moduleNameSeperator);
    if (!moduleName)
        moduleName = this.configuration.rootModuleFileName;
    return moduleName;
}
ModuleMarkupFile.prototype.getOutputPath = function () {
    return path.join(
        this.configuration.publicDirectory,
        this.configuration.outputDirectories.markupFiles,
        this.getModuleName(),
        this.getModuleName()) + '.html';
}
ModuleMarkupFile.prototype.create = function (prodMode) {
    return new Promise((resolve, reject) => {
        console.log(`Creating marukp file: File path: ${this.filePath}`);

        let content = '';
        let scriptReferences = '';
        let styleReferences = '';

        /**
         * 
         */
        function findLayoutModuleMarkupFilesRecursively(layoutModuleMarkupFile, acc = []) {
            acc.push(layoutModuleMarkupFile);
            if (!layoutModuleMarkupFile.parentLayoutModuleMarkupFile)
                return acc;
            return findLayoutModuleMarkupFilesRecursively.call(this, layoutModuleMarkupFile.parentLayoutModuleMarkupFile, acc);
        }
        let markupFileChain = [];
        if (this.layoutModuleMarkupFile)
            markupFileChain = findLayoutModuleMarkupFilesRecursively.call(this, this.layoutModuleMarkupFile);
        markupFileChain = markupFileChain.reverse();
        markupFileChain.push(this);

        if (markupFileChain.length > 1) {
            content = fs.readFileSync(markupFileChain[0].filePath).toString();
            for (let i = 1; i < markupFileChain.length; i++) {
                content = content.replace(
                    new RegExp(this.configuration.contentPlaceHolder, 'g'),
                    fs.readFileSync(markupFileChain[i].filePath).toString());
            }
        } else {
            content = fs.readFileSync(this.filePath).toString();
        }

        /**
         * 
         */
        if (this.templateMarkupFile) {
            let templateContent = fs.readFileSync(this.templateMarkupFile.filePath).toString();
            content = templateContent.replace(/\<body\>/g, content + '\r\n<body>\r\n');
        }

        /**
         * 
         */
        function findLayoutModuleFilesRecursively(layoutModuleMarkupFile, layoutModuleScriptFiles, layoutModuleStyleFiles) {
            if (!layoutModuleMarkupFile)
                return;
            else {
                if (layoutModuleMarkupFile.layoutModuleScriptFile)
                    layoutModuleScriptFiles.push(layoutModuleMarkupFile.layoutModuleScriptFile);
                if (layoutModuleMarkupFile.layoutModuleStyleFile)
                    layoutModuleStyleFiles.push(layoutModuleMarkupFile.layoutModuleStyleFile);
                findLayoutModuleFilesRecursively.call(this, layoutModuleMarkupFile.parentLayoutModuleMarkupFile, layoutModuleScriptFiles, layoutModuleStyleFiles);
            }
        }
        let layoutModuleScriptFiles = [];
        let layoutModuleStyleFiles = [];
        findLayoutModuleFilesRecursively.call(this, this.layoutModuleMarkupFile, layoutModuleScriptFiles, layoutModuleStyleFiles);

        layoutModuleScriptFiles = layoutModuleScriptFiles.reverse();
        layoutModuleStyleFiles = layoutModuleStyleFiles.reverse();
        /**
         * 
         */
        this.staticStyleReferences.forEach(x => {
            styleReferences +=
                `<link href="${x}?v=${new Date().getTime()}" rel="stylesheet" />` + '\r\n';
        });
        this.vendorStyleDirectories.forEach(x => {
            x.relativePathsOfReferences.forEach(relPath => {
                styleReferences +=
                    `<link href="/${path.join(path.relative(this.configuration.publicDirectory, x.getOutputPath()), relPath)}?v=${new Date().getTime()}" rel="stylesheet" />` + '\r\n';
            });
        });
        this.standaloneLibraryStyleFiles.forEach(x => {
            styleReferences +=
                `<link href="/${path.relative(this.configuration.publicDirectory, x.getOutputPath())}?v=${new Date().getTime()}" rel="stylesheet" />` + '\r\n';
        });
        layoutModuleStyleFiles.forEach(x => {
            styleReferences +=
                `<link href="/${path.relative(this.configuration.publicDirectory, x.getOutputPath())}?v=${new Date().getTime()}" rel="stylesheet" />` + '\r\n';
        });
        if (this.moduleStyleFile)
            styleReferences +=
                `<link href="/${path.relative(this.configuration.publicDirectory, this.moduleStyleFile.getOutputPath())}?v=${new Date().getTime()}" rel="stylesheet" />` + '\r\n';
        styleReferences += '</head>\r\n'

        /**
         * 
         */
        this.staticScriptReferences.forEach(x => {
            scriptReferences +=
                `<script src="${x}?v=${new Date().getTime()}"></script>` + '\r\n';
        });
        this.vendorScriptDirectories.forEach(x => {
            x.relativePathsOfReferences.forEach(relPath => {
                scriptReferences +=
                    `<script src="/${path.join(path.relative(this.configuration.publicDirectory, x.getOutputPath()), relPath)}?v=${new Date().getTime()}"></script>` + '\r\n';
            });
        });
        layoutModuleScriptFiles.forEach(x => {
            scriptReferences +=
                `<script src="/${path.relative(this.configuration.publicDirectory, x.getOutputPath())}?v=${new Date().getTime()}"></script>` + '\r\n';
        });
        if (this.moduleScriptFile) {
            scriptReferences +=
                `<script src="/${path.relative(this.configuration.publicDirectory, this.moduleScriptFile.getOutputPath())}?v=${new Date().getTime()}"></script>` + '\r\n';
        }
        scriptReferences += '</body>\r\n';

        content = content.replace(
            new RegExp('</head>', 'g'),
            styleReferences
        );

        content = content.replace(
            new RegExp('</body>\r\n', 'g'),
            scriptReferences
        );

        if (!fs.existsSync(path.dirname(this.getOutputPath())))
            helper.createDir(path.dirname(this.getOutputPath()));
        fs.writeFileSync(this.getOutputPath(), content);

        console.log(`Created marukp file: File path: ${this.filePath}`);
        resolve();
    });
}

module.exports = ModuleMarkupFile;