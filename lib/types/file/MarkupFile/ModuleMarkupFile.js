const path = require('path').posix;
const fs = require('fs');

const Handlebars = require('handlebars');

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

    this.controller = null;
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
    this.controller = null;

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


async function setExpressionsRecursively(expressionContent, req) {
    var data;

    var postFixExpressions = helper.findExpressions(expressionContent, this.configuration.expressions);

    for (var postFix in postFixExpressions) {
        var expressions = postFixExpressions[postFix];
        var adapter = this.controller.expressionAdapterMapping[postFix];
        var isRecursive = this.configuration.expressions.find(x => x.postFix === postFix).isRecursive;
        if (!data) {
            data = {};
        }
        if (isRecursive) {
            var expressionContents = await adapter(expressions, req);
            for (var expName in expressionContents) {
                var expContent = expressionContents[expName];

                expressionContents[expName] = setExpressionsRecursively(expContent, req);

            }
            data = { ...data, ...expressionContents };
        } else {
            data = { ...data, ...(await adapter(expressions, req)) };
        }
    }

    if (data) {
        var compiled = Handlebars.compile(expressionContent);
        var rendered = compiled(data);

        return rendered;
    } else {
        return expressionContent;
    }
}

ModuleMarkupFile.prototype.render = async function (req) {

    function findLayoutModuleMarkupFilesRecursively(layoutModuleMarkupFile, acc = []) {
        acc.push(layoutModuleMarkupFile);
        if (!layoutModuleMarkupFile.parentLayoutModuleMarkupFile)
            return acc;
        return findLayoutModuleMarkupFilesRecursively.call(this, layoutModuleMarkupFile.parentLayoutModuleMarkupFile, acc);
    }
    let markupFileChain = [this];
    if (this.layoutModuleMarkupFile)
        markupFileChain.push(...findLayoutModuleMarkupFilesRecursively.call(this, this.layoutModuleMarkupFile));
    if (this.templateMarkupFile)
        markupFileChain.push(this.templateMarkupFile);

    var result,
        compiled,
        data,
        partials;

    for (let i = 0; i < markupFileChain.length; i++) {
        data = {};
        compiled = Handlebars.compile(markupFileChain[i].content);

        if (i === markupFileChain.length - 1) {
            var scriptReferences = this.getScriptReferences();
            var styleReferences = this.getStyleReferences();

            data[this.configuration.scriptExpression] = scriptReferences;
            data[this.configuration.styleExpression] = styleReferences;
        }

        /**
         * {text:[text1],content:[content1],link:[link1]}
         */
        var postFixExpressions = helper.findExpressions(markupFileChain[i].content, this.configuration.expressions);

        for (var postFix in postFixExpressions) {
            var expressions = postFixExpressions[postFix];
            var adapter = this.controller.expressionAdapterMapping[postFix];
            var isRecursive = this.configuration.expressions.find(x => x.postFix === postFix).isRecursive;
            if (isRecursive) {
                var expressionContents = await adapter(expressions, req);
                for (var expName in expressionContents) {
                    var expContent = expressionContents[expName];

                    expressionContents[expName] = await setExpressionsRecursively.call(this, expContent, req);
                }
                data = { ...data, ...expressionContents };
            } else {
                data = { ...data, ...(await adapter(expressions, req)) };
            }
        }

        if (markupFileChain[i].dataProvider) {
            data = { ...data, ...(await markupFileChain[i].dataProvider(req)) };
        }

        if (i === markupFileChain.length) {
            var scriptReferences = this.getScriptReferences();
            var styleReferences = this.getStyleReferences();

            data[this.configuration.scriptExpression] = scriptReferences;
            data[this.configuration.styleExpression] = styleReferences;
        }

        if (markupFileChain[i].componentMarkupFiles && markupFileChain[i].componentMarkupFiles.length > 0) {
            partials = {};
            for (var componentMarkupFile of markupFileChain[i].componentMarkupFiles) {
                var partialContent = componentMarkupFile.content;
                var partialCompiled = Handlebars.compile(partialContent);

                partials[`${componentMarkupFile.getExpression().substr(1)}`] = partialCompiled;
            }
        }

        if (i > 0) {
            data[this.configuration.contentExpression] = result;
        }

        result = compiled(data, { partials: partials });
    }

    return result;
}

ModuleMarkupFile.prototype.getStyleReferences = function () {
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


    var componentStyleFiles = [];
    if (this.componentMarkupFiles) {
        this.componentMarkupFiles.forEach(x => {
            if (x.componentStyleFile) {
                componentStyleFiles.push(x.componentStyleFile.getOutputPath());
            }
        });
    }

    var curr = this.layoutModuleMarkupFile;
    while (curr) {
        if (curr.componentMarkupFiles) {
            curr.componentMarkupFiles.forEach(x => {
                if (x.componentStyleFile && !componentStyleFiles.includes(x.componentStyleFile.getOutputPath())) {
                    componentStyleFiles.push(x.componentStyleFile.getOutputPath());
                }
            });
        }
        curr = curr.layoutModuleMarkupFile;
    }

    if (this.templateMarkupFile) {
        if (this.templateMarkupFile.componentMarkupFiles) {
            this.templateMarkupFile.componentMarkupFiles.forEach(x => {
                if (x.componentStyleFile && !componentStyleFiles.includes(x.componentStyleFile.getOutputPath())) {
                    componentStyleFiles.push(x.componentStyleFile.getOutputPath());
                }
            });
        }
    }

    componentStyleFiles.forEach(x => {
        styleReferences +=
            `<link href="/${path.relative(this.configuration.publicDirectory, x)}${this.prodMode ? `?v=${new Date().getTime()}` : ''}" rel="stylesheet" />\r\n`;
    })

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
    var scriptReferences = '';

    function findLayoutModuleFilesRecursively(layoutModuleMarkupFile, layoutModuleScriptFiles) {
        if (!layoutModuleMarkupFile)
            return;
        else {
            if (layoutModuleMarkupFile.layoutModuleScriptFile)
                layoutModuleScriptFiles.push(layoutModuleMarkupFile.layoutModuleScriptFile);
            findLayoutModuleFilesRecursively.call(this, layoutModuleMarkupFile.parentLayoutModuleMarkupFile, layoutModuleScriptFiles);
        }
    }
    var layoutModuleScriptFiles = [];
    findLayoutModuleFilesRecursively.call(this, this.layoutModuleMarkupFile, layoutModuleScriptFiles);
    layoutModuleScriptFiles = layoutModuleScriptFiles.reverse();

    var componentScriptFiles = [];
    if (this.componentMarkupFiles) {
        this.componentMarkupFiles.forEach(x => {
            if (x.componentScriptFile) {
                componentScriptFiles.push(x.componentScriptFile.getOutputPath());
            }
        });
    }

    var curr = this.layoutModuleMarkupFile;
    while (curr) {
        if (curr.componentMarkupFiles) {
            curr.componentMarkupFiles.forEach(x => {
                if (x.componentScriptFile && !componentScriptFiles.includes(x.componentScriptFile.getOutputPath())) {
                    componentScriptFiles.push(x.componentScriptFile.getOutputPath());
                }
            });
        }
        curr = curr.layoutModuleMarkupFile;
    }

    if (this.templateMarkupFile) {
        if (this.templateMarkupFile.componentMarkupFiles) {
            this.templateMarkupFile.componentMarkupFiles.forEach(x => {
                if (x.componentScriptFile && !componentScriptFiles.includes(x.componentScriptFile.getOutputPath())) {
                    componentScriptFiles.push(x.componentScriptFile.getOutputPath());
                }
            });
        }
    }

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

    componentScriptFiles.forEach(x => {
        scriptReferences +=
            `<script src="/${path.relative(this.configuration.publicDirectory, x)}${this.prodMode ? `?v=${new Date().getTime()}` : ''}"></script>\r\n`;
    });

    layoutModuleScriptFiles.forEach(x => {
        scriptReferences +=
            `<script src="/${path.relative(this.configuration.publicDirectory, x.getOutputPath())}${this.prodMode ? `?v=${new Date().getTime()}` : ''}"></script>` + '\r\n';
    });
    if (this.moduleScriptFile) {
        scriptReferences +=
            `<script src="/${path.relative(this.configuration.publicDirectory, this.moduleScriptFile.getOutputPath())}${this.prodMode ? `?v=${new Date().getTime()}` : ''}"></script>\r\n`;
    }

    if (this.componentMarkupFiles) {
        this.componentMarkupFiles.forEach(x => {
            scriptReferences +=
                `<script src="/${path.relative(this.configuration.publicDirectory, x.getOutputPath())}${this.prodMode ? `?v=${new Date().getTime()}` : ''}"></script>\r\n`;
        });
    }

    return scriptReferences;
}

module.exports = ModuleMarkupFile;