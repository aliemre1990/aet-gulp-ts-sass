const path = require('path').posix;
const fs = require('fs');

const MarkupFile = require('./_MarkupFile');
const helper = require('../../../helper');

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
    this.vendorScriptFiles = [];
    this.vendorStyleFiles = [];
    // this.standaloneLibraryScriptFiles = [];
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
    return path.join(this.configuration.outputDirectories.markupFiles, this.getModuleName()) + '.html';
}
ModuleMarkupFile.prototype.create = function (prodMode) {
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
    this.vendorStyleFiles.forEach(x => {
        styleReferences +=
            `<link href="/styles/${this.configuration.referenceParentPaths.vendorStyles}/${path.basename(x.getOutputPath())}" rel="stylesheet" />` + '\r\n';
    });
    this.standaloneLibraryStyleFiles.forEach(x => {
        styleReferences +=
            `<link href="/styles/${this.configuration.referenceParentPaths.standaloneLibraryStyles}/${path.basename(x.getOutputPath())}" rel="stylesheet" />` + '\r\n';
    });
    layoutModuleStyleFiles.forEach(x => {
        styleReferences +=
            `<link href="/styles/${this.configuration.referenceParentPaths.layoutModuleStyles}/${path.basename(x.getOutputPath())}" rel="stylesheet" />` + '\r\n';
    });
    if (this.moduleStyleFile)
        styleReferences +=
            `<link href="/styles/${this.configuration.referenceParentPaths.moduleStyles}/${path.basename(this.moduleStyleFile.getOutputPath())}" rel="stylesheet" />` + '\r\n';
    styleReferences += '</head>\r\n'

    // // If dev mode and its required add system js references.
    // if (!prodMode && (this.standaloneLibraryScriptFiles > 0 || layoutModuleScriptFiles.length > 0 || this.moduleScriptFile)) {
    //     scriptReferences +=
    //         `<script src="/scripts/${this.configuration.referenceParentPaths.vendorScripts}/system.js"></script>` + '\r\n'
    //     scriptReferences +=
    //         `<script src="/scripts/${this.configuration.referenceParentPaths.vendorScripts}/named-register.js"></script>` + '\r\n'
    // }

    /**
     * 
     */
    this.vendorScriptFiles.forEach(x => {
        scriptReferences +=
            `<script src="/scripts/${this.configuration.referenceParentPaths.vendorScripts}/${path.basename(x.getOutputPath())}?v=${new Date().getTime()}"></script>` + '\r\n';
    });
    // this.standaloneLibraryScriptFiles.forEach(x => {
    //     scriptReferences +=
    //         `<script src="/scripts/${this.configuration.referenceParentPaths.standaloneLibraryScripts}/${path.basename(x.getOutputPath())}?v=${new Date().getTime()}"></script>` + '\r\n';
    // });
    layoutModuleScriptFiles.forEach(x => {
        scriptReferences +=
            `<script src="/scripts/${this.configuration.referenceParentPaths.layoutModuleScripts}/${path.basename(x.getOutputPath())}?v=${new Date().getTime()}"></script>` + '\r\n';
    });
    if (this.moduleScriptFile) {
        scriptReferences +=
            `<script src="/scripts/${this.configuration.referenceParentPaths.moduleScripts}/${path.basename(this.moduleScriptFile.getOutputPath())}?v=${new Date().getTime()}"></script>` + '\r\n';
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
}

module.exports = ModuleMarkupFile;