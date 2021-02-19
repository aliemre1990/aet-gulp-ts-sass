const path = require('path').posix;
const fs = require('fs');

const helper = require('../../../helper');

const MarkupFile = require('./_MarkupFile');

/**
 * 
 * @constructor
 * @param {string} filePath
 * @param {Configuration} configuration
 */
function ModuleMarkupFile(filePath, configuration, prodMode) {
    MarkupFile.call(this, filePath, configuration, prodMode);

    this.prodMode = prodMode;
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
    this.componentMarkupFiles = [];
    this.dataProvider = null;
}
ModuleMarkupFile.prototype = Object.create(MarkupFile.prototype);

ModuleMarkupFile.prototype.getModuleName = function () {
    let moduleName = helper.getModuleName(
        path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules),
        this.filePath,
        this.configuration.nameSeperator);
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

ModuleMarkupFile.prototype.render = function (data) {

    var content = '';

    /**
     * 
     */
    function findLayoutModuleMarkupFilesRecursively(layoutModuleMarkupFile, acc = []) {
        acc.push(layoutModuleMarkupFile);
        if (!layoutModuleMarkupFile.parentLayoutModuleMarkupFile)
            return acc;
        return findLayoutModuleMarkupFilesRecursively.call(this, layoutModuleMarkupFile.parentLayoutModuleMarkupFile, acc);
    }
    let markupFileChain;
    if (this.layoutModuleMarkupFile)
        markupFileChain = findLayoutModuleMarkupFilesRecursively.call(this, this.layoutModuleMarkupFile);
    if (this.templateMarkupFile)
        markupFileChain.push(this.templateMarkupFile);

    var result,
        compiled,
        data,
        partials;

    for (let i = 0; i < markupFileChain.length; i++) {
        data = {};
        compiled = Handlebars.compile(markupFileChain[i].content);
        if (markupFileChain[i].dataProvider) {
            data = markupFileChain[i].dataProvider(data);
        }

        if (i > 0) {
            data[this.configuration.contentExpressionName] = result;
        }
        if (i === markupFileChain.length) {
            var scriptReferences = this.getScriptReferences();
            var styleReferences = this.getStyleReferences();

            data[this.configuration.scriptReferencesExpressionName] = scriptReferences;
            data[this.configuration.styleReferencesExpressionName] = styleReferences;
        }

        if (markupFileChain[i].componentMarkupFiles) {
            partials = {};
            for (var componentMarkupFile of markupFileChain[i].componentMarkupFiles) {
                var partialContent = componentMarkupFile.content;
                var partialCompiled = Handlebars.compile(partialContent);

                partials[`${componentMarkupFile.getComponentName}_appComponent`] = partialCompiled;
            }
        }

        result = compiled(data, { partials: partials });
    }

    content = this.setReferences(content);

    return content;
}

ModuleMarkupFile.getStyleReferences = function () {
    let styleReferences = '';

    function findLayoutModuleFilesRecursively(layoutModuleMarkupFile, layoutModuleStyleFiles) {
        if (!layoutModuleMarkupFile)
            return;
        else {
            if (layoutModuleMarkupFile.layoutModuleStyleFile)
                layoutModuleStyleFiles.push(layoutModuleMarkupFile.layoutModuleStyleFile);
            findLayoutModuleFilesRecursively.call(this, layoutModuleMarkupFile.parentLayoutModuleMarkupFile, layoutModuleStyleFiles);
        }
    }
    let layoutModuleStyleFiles = [];
    findLayoutModuleFilesRecursively.call(this, this.layoutModuleMarkupFile, layoutModuleStyleFiles);

    layoutModuleStyleFiles = layoutModuleStyleFiles.reverse();

    this.staticStyleReferences.forEach(x => {
        styleReferences +=
            `<link href="${x.url}?v=${new Date().getTime()}" rel="stylesheet" />` + '\r\n';
    });
    this.vendorStyleDirectories.forEach(x => {
        x.relativePathsOfReferences.forEach(relPath => {
            styleReferences +=
                `<link href="/${path.join(path.relative(this.configuration.publicDirectory, x.getOutputPath()), relPath)}${this.prodMode ? `?v=${new Date().getTime()}` : ''}" rel="stylesheet" />` + '\r\n';
        });
    });
    this.standaloneLibraryStyleFiles.forEach(x => {
        styleReferences +=
            `<link href="/${path.relative(this.configuration.publicDirectory, x.getOutputPath())}${this.prodMode ? `?v=${new Date().getTime()}` : ''}" rel="stylesheet" />` + '\r\n';
    });
    layoutModuleStyleFiles.forEach(x => {
        styleReferences +=
            `<link href="/${path.relative(this.configuration.publicDirectory, x.getOutputPath())}${this.prodMode ? `?v=${new Date().getTime()}` : ''}" rel="stylesheet" />` + '\r\n';
    });
    if (this.moduleStyleFile)
        styleReferences +=
            `<link href="/${path.relative(this.configuration.publicDirectory, this.moduleStyleFile.getOutputPath())}${this.prodMode ? `?v=${new Date().getTime()}` : ''}" rel="stylesheet" />` + '\r\n';


    return styleReferences;
}

ModuleMarkupFile.prototype.getScriptReferences = function () {
    var scriptReferences;

    function findLayoutModuleFilesRecursively(layoutModuleMarkupFile, layoutModuleScriptFiles) {
        if (!layoutModuleMarkupFile)
            return;
        else {
            if (layoutModuleMarkupFile.layoutModuleScriptFile)
                layoutModuleScriptFiles.push(layoutModuleMarkupFile.layoutModuleScriptFile);
            findLayoutModuleFilesRecursively.call(this, layoutModuleMarkupFile.parentLayoutModuleMarkupFile, layoutModuleScriptFiles);
        }
    }
    let layoutModuleScriptFiles = [];
    findLayoutModuleFilesRecursively.call(this, this.layoutModuleMarkupFile, layoutModuleScriptFiles);

    layoutModuleScriptFiles = layoutModuleScriptFiles.reverse();

    this.staticScriptReferences.forEach(x => {
        scriptReferences +=
            `<script src="${x.url}?v=${new Date().getTime()}"></script>` + '\r\n';
    });
    this.vendorScriptDirectories.forEach(x => {
        x.relativePathsOfReferences.forEach(relPath => {
            scriptReferences +=
                `<script src="/${path.join(path.relative(this.configuration.publicDirectory, x.getOutputPath()), relPath)}${this.prodMode ? `?v=${new Date().getTime()}` : ''}"></script>` + '\r\n';
        });
    });
    this.standaloneLibraryScriptFiles.forEach(x => {
        scriptReferences +=
            `<script src="/${path.relative(this.configuration.publicDirectory, x.getOutputPath())}${this.prodMode ? `?v=${new Date().getTime()}` : ''}"></script>` + '\r\n';
    });
    layoutModuleScriptFiles.forEach(x => {
        scriptReferences +=
            `<script src="/${path.relative(this.configuration.publicDirectory, x.getOutputPath())}${this.prodMode ? `?v=${new Date().getTime()}` : ''}"></script>` + '\r\n';
    });
    if (this.moduleScriptFile) {
        scriptReferences +=
            `<script src="/${path.relative(this.configuration.publicDirectory, this.moduleScriptFile.getOutputPath())}${this.prodMode ? `?v=${new Date().getTime()}` : ''}"></script>` + '\r\n';
    }

}

module.exports = ModuleMarkupFile;