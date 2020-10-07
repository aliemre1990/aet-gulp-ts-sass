const fs = require('fs');
const path = require('path').posix;

const gulp = require('gulp');
const rimraf = require('rimraf');

const helper = require('../helper');
const ModuleScriptFile = require('./file/ScriptFile/ModuleScriptFile');
const LayoutModuleScriptFile = require('./file/ScriptFile/LayoutModuleScriptFile');
const LibraryScriptFile = require('./file/ScriptFile/LibraryScriptFile');
const StandaloneLibraryDependencyScriptFile = require('./file/ScriptFile/StandaloneLibraryDependencyScriptFile');
const StandaloneLibraryEntryScriptFile = require('./file/ScriptFile/StandaloneLibraryEntryScriptFile');
const VendorScriptFile = require('./file/ScriptFile/VendorScriptFile');
const VendorScriptMapFile = require('./file/ScriptFile/VendorScriptMapFile');
const ModuleStyleFile = require('./file/StyleFile/ModuleStyleFile');
const LayoutModuleStyleFile = require('./file/StyleFile/LayoutModuleStyleFile');
const LibraryStyleFile = require('./file/StyleFile/LibraryStyleFile');
const StandaloneLibraryDependencyStyleFile = require('./file/StyleFile/StandaloneLibraryDependencyStyleFile');
const StandaloneLibraryEntryStyleFile = require('./file/StyleFile/StandaloneLibraryEntryStyleFile');
const VendorStyleFile = require('./file/StyleFile/VendorStyleFile');
const VendorStyleMapFile = require('./file/StyleFile/VendorStyleMapFile');
const ModuleMarkupFile = require('./file/MarkupFile/ModuleMarkupFile');
const LayoutModuleMarkupFile = require('./file/MarkupFile/LayoutModuleMarkupFile');
const TemplateMarkupFile = require('./file/MarkupFile/TemplateMarkupFile');
const ModuleConfigurationFile = require('./file/ConfgurationFile/ModuleConfigurationFile');
const LayoutModuleConfigurationFile = require('./file/ConfgurationFile/LayoutModuleConfigurationFile');
const VendorScriptDirectory = require('./directory/ScriptDirectory/VendorScriptDirectory');
const VendorStyleDirectory = require('./directory/StyleDirectory/VendorStyleDirectory');
const MarkupFile = require('./file/MarkupFile/_MarkupFile');
const { textSpanIntersectsWithPosition } = require('typescript');

/**
 * 
 * @param {{prodMode:boolean,dontCopyVendor:boolean,configurationPath:string}} options
 * @class
 * @property {boolean} prodMode 
 */
function Controller(options) {
    this.prodMode = options.optprodMode;
    this.dontCopyVendor = options.dontCopyVendor;
    this.configurationPath = options.configurationPath;

    this.configuration = null;
    this.libraryScriptFiles = [];
    this.moduleScriptFiles = [];
    this.layoutModuleScriptFiles = [];
    this.allScriptFiles = [];
    this.libraryStyleFiles = [];
    this.standaloneStyleLibraryStyleFiles = [];
    this.standaloneScriptLibraryScriptFiles = [];
    this.moduleStyleFiles = [];
    this.layoutModuleStyleFiles = [];
    this.layoutModuleMarkupFiles = [];
    this.moduleMarkupFiles = [];
    this.templateMarkupFiles = [];
    this.moduleConfigurationFiles = [];
    this.layoutModuleConfigurationFiles = [];
    this.vendorScriptDirectories = [];
    this.vendorStyleDirectories = [];
    this.staticScriptReferences = [];
    this.staticStyleReferences = [];
    this.modules = {};
    this.layoutModules = {};

    this.construct();
}

Controller.prototype.construct = function () {

    /**
     * @type {Configuration}
     */
    this.configuration = require(this.configurationPath);

    /**
     * Defaults
     */
    if (!this.configuration.projectType)
        this.configuration.projectType = 'typescript';
    if (!this.configuration.validMarkupExtensions)
        this.configuration.validMarkupExtensions = ['.html'];

    this.moduleConfigurationFiles = helper.findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules), ['.json'])
        .map(x => new ModuleConfigurationFile(x, this.configuration, this.prodMode));

    this.layoutModuleConfigurationFiles = helper.findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules), ['.json'])
        .map(x => new LayoutModuleConfigurationFile(x, this.configuration, this.prodMode));

    if (!this.configuration.modules)
        this.configuration.modules = {};
    if (!this.configuration.layoutModules)
        this.configuration.layoutModules = {};

    this.moduleConfigurationFiles.forEach(x => {
        this.configuration.modules[x.getModuleName()] = x.getAsObject();
    });

    this.layoutModuleConfigurationFiles.forEach(x => {
        this.configuration.layoutModules[x.getModuleName()] = x.getAsObject();
    });
    /**
     * 
     */
    let scriptExtension = this.configuration.projectType === 'javascript' ? '.js' : '.ts';

    this.libraryScriptFiles = helper.findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.libraryScripts), [scriptExtension])
        .map(x => new LibraryScriptFile(x, this.configuration, this.prodMode));

    this.standaloneScriptLibraryScriptFiles = helper.findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneScriptLibraries), [scriptExtension])
        .map(x => {
            if (path.dirname(path.dirname(x)) === path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneScriptLibraries) &&
                this.configuration.validStandaloneLibraryEntryFileNames.includes(path.basename(x).replace(scriptExtension, '')))
                return new StandaloneLibraryEntryScriptFile(x, this.configuration, this.prodMode);
            else if (path.dirname(x) === path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneScriptLibraries)) {
                return new StandaloneLibraryEntryScriptFile(x, this.configuration, this.prodMode);
            }
            else
                return new StandaloneLibraryDependencyScriptFile(x, this.configuration, this.prodMode);
        });

    this.moduleScriptFiles = helper.findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules), [scriptExtension])
        .map(x => new ModuleScriptFile(x, this.configuration, this.prodMode));

    this.layoutModuleScriptFiles = helper.findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules), [scriptExtension])
        .map(x => new LayoutModuleScriptFile(x, this.configuration, this.prodMode));

    this.allScriptFiles = Array.prototype
        .concat(this.libraryScriptFiles, this.standaloneScriptLibraryScriptFiles, this.moduleScriptFiles, this.layoutModuleScriptFiles);
    for (let scriptFile of this.allScriptFiles) {
        let importedScriptFilePaths = scriptFile.findImportedScriptFilePaths();
        if (importedScriptFilePaths) {
            for (let filePath of importedScriptFilePaths) {
                let importedScriptFile = this.allScriptFiles.find(x => x.filePath === filePath);
                importedScriptFile.parentScriptFiles.push(scriptFile);
                scriptFile.childrenScriptFiles.push(importedScriptFile);
            }
        }
    }

    /**
     * 
     */
    for (let vendorScriptName in this.configuration.vendorScripts) {
        let vendorScript = this.configuration.vendorScripts[vendorScriptName];

        let relativePaths = [];
        for (var refPath of vendorScript.relativePathsOfReferences) {
            if (this.prodMode) {
                if (refPath.minPath) {
                    relativePaths.push(refPath.minPath);
                } else {
                    relativePaths.push(refPath.standardPath);
                }
            } else {
                if (refPath.standardPath) {
                    relativePaths.push(refPath.standardPath);
                } else {
                    relativePaths.push(refPath.minPath);
                }
            }
        }
        let vendorScriptDirectory = new VendorScriptDirectory(vendorScript.sourceDirectory, vendorScriptName, relativePaths, this.configuration);
        this.vendorScriptDirectories.push(vendorScriptDirectory);
    }

    for (let refName in this.configuration.staticScriptReferences) {
        let ref = this.configuration.staticScriptReferences[refName];
        this.staticScriptReferences.push({ name: refName, url: ref });
    }
    /**
    * 
    */
    this.libraryStyleFiles = helper.findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.libraryStyles), ['.scss'])
        .map(x => new LibraryStyleFile(x, this.configuration, this.prodMode));

    this.standaloneStyleLibraryStyleFiles = helper.findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneStyleLibraries), ['.scss'])
        .map(x => {
            if (path.dirname(path.dirname(x)) === path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneStyleLibraries) &&
                this.configuration.validStandaloneLibraryEntryFileNames.includes(path.basename(x).replace('.scss', '')))
                return new StandaloneLibraryEntryStyleFile(x, this.configuration, this.prodMode);
            else if (path.dirname(x) === path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneStyleLibraries)) {
                return new StandaloneLibraryEntryStyleFile(x, this.configuration, this.prodMode);
            }
            else
                return new StandaloneLibraryDependencyStyleFile(x, this.configuration, this.prodMode);
        });

    this.moduleStyleFiles = helper.findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules), ['.scss'])
        .map(x => new ModuleStyleFile(x, this.configuration, this.prodMode));

    this.layoutModuleStyleFiles = helper.findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules), ['.scss'])
        .map(x => new LayoutModuleStyleFile(x, this.configuration, this.prodMode));

    this.allStyleFiles = Array.prototype
        .concat(this.libraryStyleFiles, this.standaloneStyleLibraryStyleFiles, this.moduleStyleFiles, this.layoutModuleStyleFiles);
    for (let styleFile of this.allStyleFiles) {
        let importedStyleFilePaths = styleFile.findImportedStyleFilePaths();
        if (importedStyleFilePaths) {
            for (let filePath of importedStyleFilePaths) {
                let importedStyleFile = this.allStyleFiles.find(x => x.filePath === filePath);
                importedStyleFile.parentStyleFiles.push(styleFile);
                styleFile.childrenStyleFiles.push(importedStyleFile);
            }
        }
    }

    /**
     * 
     */
    for (let vendorStyleName in this.configuration.vendorStyles) {
        let vendorStyle = this.configuration.vendorStyles[vendorStyleName];

        let relativePaths = [];
        for (var refPath of vendorStyle.relativePathsOfReferences) {
            if (this.prodMode) {
                if (refPath.minPath) {
                    relativePaths.push(refPath.minPath);
                } else {
                    relativePaths.push(refPath.standardPath);
                }
            } else {
                if (refPath.standardPath) {
                    relativePaths.push(refPath.standardPath);
                } else {
                    relativePaths.push(refPath.minPath);
                }
            }
        }
        let vendorStyleDirectory = new VendorStyleDirectory(vendorStyle.sourceDirectory, vendorStyleName, relativePaths, this.configuration);
        this.vendorStyleDirectories.push(vendorStyleDirectory);
    }

    for (let refName in this.configuration.staticStyleReferences) {
        let ref = this.configuration.staticStyleReferences[refName];
        this.staticStyleReferences.push({ name: refName, url: ref });
    }
    /**
     * 
     */
    this.templateMarkupFiles = helper
        .findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.markupTemplates), this.configuration.validMarkupExtensions)
        .map(x => new TemplateMarkupFile(x, this.configuration, this.prodMode));

    /**
     * 
     */
    this.layoutModuleMarkupFiles = helper
        .findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules), this.configuration.validMarkupExtensions)
        .map(x => {

            let mf = new LayoutModuleMarkupFile(x, this.configuration, this.prodMode, this.prodMode);
            this.layoutModules[mf.getModuleName()] = { markupFile: mf };
            return mf;
        });

    for (let layoutModuleMarkupFile of this.layoutModuleMarkupFiles) {
        layoutModuleMarkupFile.layoutModuleScriptFile = this.layoutModuleScriptFiles.find(x => x.getModuleName() === layoutModuleMarkupFile.getModuleName());
        layoutModuleMarkupFile.layoutModuleStyleFile = this.layoutModuleStyleFiles.find(x => x.getModuleName() === layoutModuleMarkupFile.getModuleName());
        if (layoutModuleMarkupFile.layoutModuleScriptFile)
            layoutModuleMarkupFile.layoutModuleScriptFile.parentLayoutModuleMarkupFile = layoutModuleMarkupFile;
        if (layoutModuleMarkupFile.layoutModuleStyleFile)
            layoutModuleMarkupFile.layoutModuleStyleFile.parentLayoutModuleMarkupFile = layoutModuleMarkupFile;

        let layoutModuleConfiguration = this.configuration.layoutModules[layoutModuleMarkupFile.getModuleName()];

        let parentLayoutModuleMarkupFile;
        if (layoutModuleConfiguration && layoutModuleConfiguration.layoutModule) {
            parentLayoutModuleMarkupFile = this.layoutModuleMarkupFiles.find(x => x.getModuleName() === layoutModuleConfiguration.layoutModule);
        }
        else if (layoutModuleConfiguration && layoutModuleConfiguration.layoutModule === null) {
            parentLayoutModuleMarkupFile = null;
        }
        else {

            // clientSource/layoutModules/moduleA/moduleAA/moduleAA.html
            let parentDir = path.dirname(path.dirname(layoutModuleMarkupFile.filePath));
            if (parentDir.length >= path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules).length) {
                do {
                    parentLayoutModuleMarkupFile = this.layoutModuleMarkupFiles.find(x => path.dirname(x.filePath) === parentDir);
                    if (parentLayoutModuleMarkupFile)
                        break;
                } while (parentDir !== path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules) && (parentDir = path.dirname(parentDir)));

            }
            else
                parentLayoutModuleMarkupFile = null;

            if (parentLayoutModuleMarkupFile) {
                layoutModuleMarkupFile.parentLayoutModuleMarkupFile = parentLayoutModuleMarkupFile;
                parentLayoutModuleMarkupFile.childrenLayoutModuleMarkupFiles.push(layoutModuleMarkupFile);
            }
        }
    }

    /**
     * 
     */
    function setDependenciesRecursively(layoutModuleMarkupFile, bag) {
        let layoutModuleConfiguration = this.configuration.layoutModules[layoutModuleMarkupFile.getModuleName()];

        if (layoutModuleConfiguration) {

            if (!bag.standaloneLibraryStyleFilesExplicitlySet) {
                if (layoutModuleConfiguration.includeStandaloneStyles) {
                    bag.standaloneLibraryStyleFiles = this.standaloneStyleLibraryStyleFiles
                        .filter(x => layoutModuleConfiguration.includeStandaloneStyles
                            .find(y => x.getLibraryName() === y && x instanceof StandaloneLibraryEntryStyleFile));
                    bag.standaloneLibraryStyleFilesExplicitlySet = true;
                }
                else if (layoutModuleConfiguration.excludeStandaloneStyles) {
                    bag.standaloneLibraryStyleFiles = this.standaloneStyleLibraryStyleFiles
                        .filter(x => !layoutModuleConfiguration.excludeStandaloneStyles
                            .find(y => x.getLibraryName() === y && x instanceof StandaloneLibraryEntryStyleFile));
                    bag.standaloneLibraryStyleFilesExplicitlySet = true;
                } else if (layoutModuleConfiguration.includeStandaloneStyles === null) {
                    bag.standaloneLibraryStyleFiles = [];
                    bag.standaloneLibraryStyleFilesExplicitlySet = true;
                } else if (layoutModuleConfiguration.excludeStandaloneStyles === null) {
                    bag.standaloneLibraryStyleFilesExplicitlySet = true;
                }

            }

            if (!bag.standaloneLibraryScriptFilesExplicitlySet) {
                if (layoutModuleConfiguration.includeStandaloneScripts) {
                    bag.standaloneLibraryScriptFiles = this.standaloneScriptLibraryScriptFiles
                        .filter(x => layoutModuleConfiguration.includeStandaloneScripts
                            .find(y => x.getLibraryName() === y && x instanceof StandaloneLibraryEntryScriptFile));
                    bag.standaloneLibraryScriptFilesExplicitlySet = true;
                }
                else if (layoutModuleConfiguration.excludeStandaloneScripts) {
                    bag.standaloneLibraryScriptFiles = this.standaloneScriptLibraryScriptFiles
                        .filter(x => !layoutModuleConfiguration.excludeStandaloneStyles
                            .find(y => x.getLibraryName() === y && x instanceof StandaloneLibraryEntryScriptFile));
                    bag.standaloneLibraryScriptFilesExplicitlySet = true;
                } else if (layoutModuleConfiguration.includeStandaloneScripts === null) {
                    bag.standaloneLibraryScriptFiles = [];
                    bag.standaloneLibraryScriptFilesExplicitlySet = true;
                } else if (layoutModuleConfiguration.excludeStandaloneScripts === null) {
                    bag.standaloneLibraryScriptFilesExplicitlySet = true;
                }

            }


            if (!bag.vendorScriptsExplicitlySet) {
                if (layoutModuleConfiguration.includeVendorScripts) {
                    bag.vendorScriptDirectories = this.vendorScriptDirectories
                        .filter(x => layoutModuleConfiguration.includeVendorScripts.includes(x.vendorName));
                    bag.vendorScriptsExplicitlySet = true;
                } else if (layoutModuleConfiguration.excludeVendorScripts) {
                    bag.vendorScriptDirectories = this.vendorScriptDirectories
                        .filter(x => !layoutModuleConfiguration.excludeVendorScripts.includes(x.vendorName));
                    bag.vendorScriptsExplicitlySet = true;
                } else if (layoutModuleConfiguration.includeVendorScripts === null) {
                    bag.vendorScriptDirectories = [];
                    bag.vendorScriptsExplicitlySet = true;
                } else if (layoutModuleConfiguration.excludeVendorScripts === null) {
                    bag.vendorScriptsExplicitlySet = true;
                }
            }

            if (!bag.vendorStylesExplicitlySet) {
                if (layoutModuleConfiguration.includeVendorStyles) {
                    bag.vendorStyleDirectories = this.vendorStyleDirectories
                        .filter(x => layoutModuleConfiguration.includeVendorStyles.includes(x.vendorName));
                    bag.vendorStylesExplicitlySet = true;
                } else if (layoutModuleConfiguration.excludeVendorStyles) {
                    bag.vendorStyleDirectories = this.vendorStyleDirectories
                        .filter(x => !layoutModuleConfiguration.excludeVendorStyles.includes(x.vendorName));
                    bag.vendorStylesExplicitlySet = true;
                } else if (layoutModuleConfiguration.includeVendorStyles === null) {
                    bag.vendorStyleDirectories = [];
                    bag.vendorStylesExplicitlySet = true;
                } else if (layoutModuleConfiguration.excludeVendorStyles === null) {
                    bag.vendorStylesExplicitlySet = true;
                }
            }

            if (!bag.staticScriptReferencesExplicitlySet) {
                if (layoutModuleConfiguration && layoutModuleConfiguration.includeStaticScriptReferences) {
                    bag.staticScriptReferences = this.staticScriptReferences
                        .filter(x => layoutModuleConfiguration.includeStaticScriptReferences.includes(x.name));
                    bag.staticScriptReferencesExplicitlySet = true;
                } else if (layoutModuleConfiguration && layoutModuleConfiguration.excludeStaticScriptReferences) {
                    bag.staticScriptReferences = this.staticScriptReferences
                        .filter(x => !layoutModuleConfiguration.excludeStaticScriptReferences.includes(x.name));
                    bag.staticScriptReferencesExplicitlySet = true;
                } else if (layoutModuleConfiguration && layoutModuleConfiguration.includeStaticScriptReferences === null) {
                    bag.staticScriptReferences = [];
                    bag.staticScriptReferencesExplicitlySet = true;
                } else if (layoutModuleConfiguration && layoutModuleConfiguration.excludeStaticScriptReferences === null) {
                    bag.staticScriptReferencesExplicitlySet = true;
                }
            }

            if (!bag.staticStyleReferencesExplicitlySet) {
                if (layoutModuleConfiguration && layoutModuleConfiguration.includeStaticStyleReferences) {
                    bag.staticStyleReferences = this.staticStyleReferences
                        .filter(x => layoutModuleConfiguration.includeStaticStyleReferences.includes(x.name));
                    bag.staticStyleReferencesExplicitlySet = true;
                } else if (layoutModuleConfiguration && layoutModuleConfiguration.excludeStaticStyleReferences) {
                    bag.staticStyleReferences = this.staticStyleReferences
                        .filter(x => !layoutModuleConfiguration.excludeStaticStyleReferences.includes(x.name));
                    bag.staticStyleReferencesExplicitlySet = true;
                } else if (layoutModuleConfiguration && layoutModuleConfiguration.includeStaticStyleReferences === null) {
                    bag.staticStyleReferences = [];
                    bag.staticStyleReferencesExplicitlySet = true;
                } else if (layoutModuleConfiguration && layoutModuleConfiguration.excludeStaticStyleReferences === null) {
                    bag.staticStyleReferencesExplicitlySet = true;
                }
            }


            if (!bag.staticStyleReferencesExplicitlySet) {
                if (layoutModuleConfiguration && layoutModuleConfiguration.staticStyleReferences) {
                    bag.staticStyleReferencesExplicitlySet = true;
                    bag.staticStyleReferences.push(...layoutModuleConfiguration.staticStyleReferences);
                } else if (layoutModuleConfiguration && layoutModuleConfiguration.staticStyleReferences === null)
                    bag.staticStyleReferencesExplicitlySet = true;
            }

            if (!bag.staticScriptReferencesExplicitlySet) {
                if (layoutModuleConfiguration && layoutModuleConfiguration.staticScriptReferences) {
                    bag.staticScriptReferencesExplicitlySet = true;
                    bag.staticScriptReferences.push(...layoutModuleConfiguration.staticScriptReferences);
                } else if (layoutModuleConfiguration && layoutModuleConfiguration.staticScriptReferences === null)
                    bag.staticScriptReferencesExplicitlySet = true;
            }

            if (!bag.markupTemplateFileExplicitlySet) {
                if (layoutModuleConfiguration.markupTemplate) {
                    bag.markupTemplateFile = this.templateMarkupFiles
                        .find(x => x.filePath === path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.markupTemplates, layoutModuleConfiguration.markupTemplate));
                    bag.markuptemplateFileExplicitlySet = true;
                } else if (layoutModuleConfiguration.markupTemplate === null) {
                    bag.markupTemplateFile = null;
                    bag.markupTemplateFileExplicitlySet = true;
                }
            }
        }

        if (layoutModuleMarkupFile.parentLayoutModuleMarkupFile)
            setDependenciesRecursively.call(this, layoutModuleMarkupFile.parentLayoutModuleMarkupFile, bag);
        else if (layoutModuleConfiguration && layoutModuleConfiguration.layoutModule)
            setDependenciesRecursively.call(this, this.layoutModuleMarkupFiles.find(x => x.getModuleName() === layoutModuleConfiguration.layoutModule), bag);
        else
            return;
    }

    this.moduleMarkupFiles = helper
        .findFilesRecursively(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules), this.configuration.validMarkupExtensions, false, true)
        .map(x => {
            let mf = new ModuleMarkupFile(x, this.configuration, this.prodMode);
            let moduleName = mf.getModuleName();

            let obj = { markupFile: mf };
            this.modules[moduleName] = obj;

            let moduleConfig = this.configuration.modules[moduleName];
            if (moduleConfig) {
                let substitutingModules = this.configuration.modules[moduleName].substitutingModules;
                if (substitutingModules) {
                    for (var mdl of substitutingModules) {
                        this.modules[mdl] = obj;
                    }
                }
            }

            return mf;
        });

    for (let moduleMarkupFile of this.moduleMarkupFiles) {
        moduleMarkupFile.moduleScriptFile = this.moduleScriptFiles.find(x => x.getModuleName() === moduleMarkupFile.getModuleName());
        moduleMarkupFile.moduleStyleFile = this.moduleStyleFiles.find(x => x.getModuleName() === moduleMarkupFile.getModuleName());
        if (moduleMarkupFile.moduleScriptFile)
            moduleMarkupFile.moduleScriptFile.parentModuleMarkupFile = moduleMarkupFile;
        if (moduleMarkupFile.moduleStyleFile)
            moduleMarkupFile.moduleStyleFile.parentModuleMarkupFile = moduleMarkupFile;

        let moduleConfiguration = this.configuration.modules[moduleMarkupFile.getModuleName()];
        if (moduleConfiguration && moduleConfiguration.layoutModule) {
            moduleMarkupFile.layoutModuleMarkupFile = this.layoutModuleMarkupFiles.find(x => x.getModuleName() === moduleConfiguration.layoutModule);
            moduleMarkupFile.layoutModuleMarkupfile.childrenModuleMarkupFiles.push(moduleMarkupFile);
        }
        else if (!moduleConfiguration || (moduleConfiguration && moduleConfiguration.layoutModule === undefined)) {
            let relativeDirName = path.dirname(path.relative(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules), moduleMarkupFile.filePath));
            let dirNameSplit = relativeDirName.split(new RegExp(path.sep, 'g'));
            for (let i = 0; i <= dirNameSplit.length; i++) {
                let dirNameSlice = dirNameSplit.slice(0, dirNameSplit.length - i);
                let relativeDirName = dirNameSlice.join(path.sep);
                if (relativeDirName === '.')
                    relativeDirName = '';
                let layoutModuleMarkupFile = this.layoutModuleMarkupFiles
                    .find(x => path.dirname(x.filePath) === path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules, relativeDirName))
                if (layoutModuleMarkupFile) {
                    moduleMarkupFile.layoutModuleMarkupFile = layoutModuleMarkupFile;
                    moduleMarkupFile.layoutModuleMarkupFile.childrenModuleMarkupFiles.push(moduleMarkupFile);
                    break;
                }
                else
                    continue;
            }
        }

        let bag = {
            standaloneLibraryStyleFiles: this.standaloneStyleLibraryStyleFiles.filter(x => x instanceof StandaloneLibraryEntryStyleFile),
            standaloneLibraryStyleFilesExplicitlySet: false,
            standaloneLibraryScriptFiles: this.standaloneScriptLibraryScriptFiles.filter(x => x instanceof StandaloneLibraryEntryScriptFile),
            standaloneLibraryScriptFilesExplicitlySet: false,
            vendorScriptDirectories: this.vendorScriptDirectories.slice(),
            vendorScriptsExplicitlySet: false,
            vendorStyleDirectories: this.vendorStyleDirectories.slice(),
            vendorStylesExplicitlySet: false,
            markupTemplateFile: this.templateMarkupFiles
                .find(x => x.filePath === path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.markupTemplates, this.configuration.defaultMarkupTemplate)),
            markupTemplateFileExplicitlySet: false,
            staticStyleReferences: this.staticScriptReferences.slice(),
            staticStyleReferencesExplicitlySet: false,
            staticScriptReferences: this.staticStyleReferences.slice(),
            staticScriptReferencesExplicitlySet: false
        };

        if (moduleConfiguration && moduleConfiguration.includeStandaloneScripts) {
            bag.standaloneLibraryScriptFiles = this.standaloneScriptLibraryScriptFiles
                .filter(x => x instanceof StandaloneLibraryEntryScriptFile && moduleConfiguration.includeStandaloneScripts
                    .find(y => x.getLibraryName() === y));
            bag.standaloneLibraryScriptsExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeStandaloneScripts) {
            bag.standaloneLibraryScriptFiles = this.standaloneScriptLibraryScriptFiles
                .filter(x => x instanceof StandaloneLibraryEntryScriptFile && !moduleConfiguration.excludeStandaloneScripts
                    .find(y => x.getLibraryName() === y));
            bag.standaloneLibraryScriptsExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.includeStandaloneScripts === null) {
            bag.standaloneLibraryScriptFiles = [];
            bag.standaloneLibraryScriptsExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeStandaloneScripts === null) {
            bag.standaloneLibraryScriptsExplicitlySet = true;
        }

        if (moduleConfiguration && moduleConfiguration.includeStandaloneStyles) {
            bag.standaloneLibraryStyleFiles = this.standaloneStyleLibraryStyleFiles
                .filter(x => x instanceof StandaloneLibraryEntryStyleFile && moduleConfiguration.includeStandaloneStyles
                    .find(y => x.getLibraryName() === y));
            bag.standaloneLibraryStyleFilesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeStandaloneStyles) {
            bag.standaloneLibraryStyleFiles = this.standaloneStyleLibraryStyleFiles
                .filter(x => x instanceof StandaloneLibraryEntryStyleFile && !moduleConfiguration.excludeStandaloneStyles
                    .find(y => x.getLibraryName() === y));
            bag.standaloneLibraryStylesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.includeStandaloneStyles === null) {
            bag.standaloneLibraryStyleFiles = [];
            bag.standaloneLibraryStylesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeStandaloneStyles === null) {
            bag.standaloneLibraryStylesExplicitlySet = true;
        }

        if (moduleConfiguration && moduleConfiguration.includeVendorScripts) {
            bag.vendorScriptDirectories = this.vendorScriptDirectories
                .filter(x => moduleConfiguration.includeVendorScripts.includes(x.vendorName));
            bag.vendorScriptsExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeVendorScripts) {
            bag.vendorScriptDirectories = this.vendorScriptDirectories
                .filter(x => !moduleConfiguration.excludeVendorScripts.includes(x.vendorName));
            bag.vendorScriptsExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.includeVendorScripts === null) {
            bag.vendorScriptDirectories = [];
            bag.vendorScriptsExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeVendorScripts === null) {
            bag.vendorScriptsExplicitlySet = true;
        }

        if (moduleConfiguration && moduleConfiguration.includeVendorStyles) {
            bag.vendorStyleDirectories = this.vendorStyleDirectories
                .filter(x => moduleConfiguration.includeVendorStyles.includes(x.vendorName));
            bag.vendorStylesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeVendorStyles) {
            bag.vendorStyleDirectories = this.vendorStyleDirectories
                .filter(x => !moduleConfiguration.excludeVendorStyles.includes(x.vendorName));
            bag.vendorStylesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.includeVendorStyles === null) {
            bag.vendorStyleDirectories = [];
            bag.vendorStylesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeVendorStyles === null) {
            bag.vendorStylesExplicitlySet = true;
        }

        if (moduleConfiguration && moduleConfiguration.includeStaticScriptReferences) {
            bag.staticScriptReferences = this.staticScriptReferences
                .filter(x => moduleConfiguration.includeStaticScriptReferences.includes(x.name));
            bag.staticScriptReferencesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeStaticScriptReferences) {
            bag.staticScriptReferences = this.staticScriptReferences
                .filter(x => !moduleConfiguration.excludeStaticScriptReferences.includes(x.name));
            bag.staticScriptReferencesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.includeStaticScriptReferences === null) {
            bag.staticScriptReferences = [];
            bag.staticScriptReferencesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeStaticScriptReferences === null) {
            bag.staticScriptReferencesExplicitlySet = true;
        }

        if (moduleConfiguration && moduleConfiguration.includeStaticStyleReferences) {
            bag.staticStyleReferences = this.staticStyleReferences
                .filter(x => moduleConfiguration.includeStaticStyleReferences.includes(x.name));
            bag.staticStyleReferencesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeStaticStyleReferences) {
            bag.staticStyleReferences = this.staticStyleReferences
                .filter(x => !moduleConfiguration.excludeStaticStyleReferences.includes(x.name));
            bag.staticStyleReferencesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.includeStaticStyleReferences === null) {
            bag.staticStyleReferences = [];
            bag.staticStyleReferencesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeStaticStyleReferences === null) {
            bag.staticStyleReferencesExplicitlySet = true;
        }

        if (moduleConfiguration && moduleConfiguration.staticStyleReferences) {
            bag.staticStyleReferencesExplicitlySet = true;
            bag.staticStyleReferences.push(...moduleConfiguration.staticStyleReferences);
        } else if (moduleConfiguration && moduleConfiguration.staticStyleReferences === null)
            bag.staticStyleReferencesExplicitlySet = true;

        if (moduleConfiguration && moduleConfiguration.staticScriptReferences) {
            bag.staticScriptReferencesExplicitlySet = true;
            bag.staticScriptReferences.push(...moduleConfiguration.staticScriptReferences);
        } else if (moduleConfiguration && moduleConfiguration.staticScriptReferences === null)
            bag.staticScriptReferencesExplicitlySet = true;

        if (moduleConfiguration && moduleConfiguration.markupTemplate) {
            bag.markupTemplateFile = this.templateMarkupFiles
                .find(x => x.filePath === path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.markupTemplates, moduleConfiguration.markupTemplate));
            bag.markuptemplateFileExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.markupTemplate === null) {
            bag.markupTemplateFile = null;
            bag.markupTemplateFileExplicitlySet = true;
        }


        // if (moduleConfiguration && moduleConfiguration.staticStyleReferences)

        if (moduleMarkupFile.layoutModuleMarkupFile)
            setDependenciesRecursively.call(this, moduleMarkupFile.layoutModuleMarkupFile, bag);

        // moduleMarkupFile.standaloneLibraryScriptFiles = bag.standaloneLibraryScriptFiles.slice();
        moduleMarkupFile.standaloneLibraryStyleFiles = bag.standaloneLibraryStyleFiles.slice();
        moduleMarkupFile.standaloneLibraryScriptFiles = bag.standaloneLibraryScriptFiles.slice();
        moduleMarkupFile.vendorScriptDirectories = bag.vendorScriptDirectories;
        moduleMarkupFile.vendorStyleDirectories = bag.vendorStyleDirectories;
        moduleMarkupFile.staticStyleReferences = bag.staticStyleReferences;
        moduleMarkupFile.staticScriptReferences = bag.staticScriptReferences;
        moduleMarkupFile.templateMarkupFile = bag.markupTemplateFile;

        moduleMarkupFile.standaloneLibraryScriptFiles.forEach(x => x.parentModuleMarkupFiles.push(moduleMarkupFile));
        moduleMarkupFile.standaloneLibraryStyleFiles.forEach(x => x.parentModuleMarkupFiles.push(moduleMarkupFile));
        // moduleMarkupFile.vendorScriptDirectories.forEach(x => x.parentModuleMarkupFiles.push(moduleMarkupFile));
        // moduleMarkupFile.vendorStyleDirectories.forEach(x => x.parentModuleMarkupFiles.push(moduleMarkupFile));
        moduleMarkupFile.templateMarkupFile.childrenModuleMarkupFiles.push(moduleMarkupFile);
    }
}
/**
 * Builds files.
 */
Controller.prototype.build = function (cb) {
    rimraf.sync(path.join(this.configuration.publicDirectory, this.configuration.outputDirectories.layoutModuleScripts));
    rimraf.sync(path.join(this.configuration.publicDirectory, this.configuration.outputDirectories.layoutModuleStyles));
    rimraf.sync(path.join(this.configuration.publicDirectory, this.configuration.outputDirectories.markupFiles));
    rimraf.sync(path.join(this.configuration.publicDirectory, this.configuration.outputDirectories.moduleScripts));
    rimraf.sync(path.join(this.configuration.publicDirectory, this.configuration.outputDirectories.moduleStyles));
    rimraf.sync(path.join(this.configuration.publicDirectory, this.configuration.outputDirectories.standaloneStyleLibraries));
    if (!this.dontCopyVendor) {
        rimraf.sync(path.join(this.configuration.publicDirectory, this.configuration.outputDirectories.vendorScripts));
        rimraf.sync(path.join(this.configuration.publicDirectory, this.configuration.outputDirectories.vendorStyles));
    }

    let promises = [];

    for (let moduleMarkupFile of this.moduleMarkupFiles) {
        moduleMarkupFile.create(this.prodMode);

        if (moduleMarkupFile.moduleScriptFile)
            promises.push(moduleMarkupFile.moduleScriptFile.build(this.prodMode));
        if (moduleMarkupFile.moduleStyleFile)
            promises.push(moduleMarkupFile.moduleStyleFile.build(this.prodMode));
    }

    for (let layoutModuleMarkupFile of this.layoutModuleMarkupFiles) {
        if (layoutModuleMarkupFile.layoutModuleScriptFile)
            promises.push(layoutModuleMarkupFile.layoutModuleScriptFile.build(this.prodMode));
        if (layoutModuleMarkupFile.layoutModuleStyleFile)
            promises.push(layoutModuleMarkupFile.layoutModuleStyleFile.build(this.prodMode));
    }

    for (let standaloneLibraryEntryStyleFile of this.standaloneStyleLibraryStyleFiles.filter(x => x instanceof StandaloneLibraryEntryStyleFile))
        promises.push(standaloneLibraryEntryStyleFile.build(this.prodMode));

    for (let standaloneLibraryEntryScriptFile of this.standaloneScriptLibraryScriptFiles.filter(x => x instanceof StandaloneLibraryEntryScriptFile))
        promises.push(standaloneLibraryEntryScriptFile.build(this.prodMode));

    if (!this.dontCopyVendor) {
        for (let dir of this.vendorScriptDirectories)
            promises.push(dir.transfer());

        for (let dir of this.vendorStyleDirectories) {
            promises.push(dir.transfer());
        }
    }

    Promise.all(promises).then(() => {
        if (cb) cb();
    });
}
/**
 * Watches files.
 */
Controller.prototype.watch = function () {
    let mainWatcher = gulp
        .watch([
            this.configurationPath,
            path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules) + '/**/*',
            path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules) + '/**/*',
            path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneStyleLibraries) + '/**/*',
            path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.markupTemplates) + '/**/*',
            path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.libraryScripts) + '/**/*',
            path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.libraryStyles) + '/**/*'
        ]);
    mainWatcher.on('all', (event, filePath, stats) => {
        filePath = filePath.replace(/\\/g, path.sep);
        switch (event) {
            case 'add':
            case 'unlink':
                console.log(`Main watcher triggered. Complete build will happen. Event: ${event} filePath:${filePath}`);
                this.construct();
                this.build();
                break;
            case 'change':
                if (filePath === this.configurationPath.replace(/\\/g, '/') || path.extname(filePath) === ".json") {
                    console.log(`Client configuration file changed. Complete build will happen.`);
                    this.construct();
                    this.build();
                }
                break;
            default:
                break;
        }
    });
    let scriptExtension = this.configuration.projectType === 'javascript' ? '.js' : '.ts';

    let moduleScriptWatcher = gulp
        .watch(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules) + `/**/*${scriptExtension}`);
    let moduleStyleWatcher = gulp
        .watch(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules) + '/**/*.scss');
    let moduleMarkupWatcher = gulp
        .watch(this.configuration.validMarkupExtensions.map(x => path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.modules) + `/**/*${x}`))
    let layoutModuleScriptWatcher = gulp
        .watch(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules) + `/**/*${scriptExtension}`);
    let layoutModuleStyleWatcher = gulp
        .watch(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules) + '/**/*.scss');
    let layoutModuleMarkupWatcher = gulp
        .watch(this.configuration.validMarkupExtensions.map(x => path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.layoutModules) + `/**/*${x}`));
    let libraryScriptWatcher = gulp
        .watch(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.libraryScripts) + `/**/*${scriptExtension}`);
    let libraryStyleWatcher = gulp
        .watch(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.libraryStyles) + '/**/*.scss');
    let standaloneStyleLibraryWatcher = gulp
        .watch(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneStyleLibraries) + '/**/*.scss');
    let standaloneScriptLibraryWatcher = gulp
        .watch(path.join(this.configuration.projectDirectory, this.configuration.sourceDirectories.standaloneScriptLibraries) + `/**/*${scriptExtension}`);


    moduleScriptWatcher.on('change', (filePath, stats) => {
        filePath = filePath.replace(/\\/g, path.sep);
        console.log(`Script file changed. File path: ${filePath}`);
        let moduleScriptFile = this.moduleScriptFiles.find(x => x.filePath === filePath);

        this.setImportedChildren(moduleScriptFile, false);

        moduleScriptFile.build(this.prodMode);
    });
    moduleStyleWatcher.on('change', (filePath, stats) => {
        filePath = filePath.replace(/\\/g, path.sep);
        console.log(`Style file changed. File path: ${filePath}`);
        let moduleStyleFile = this.moduleStyleFiles.find(x => x.filePath === filePath);

        this.setImportedChildren(moduleStyleFile, true);

        moduleStyleFile.build(this.prodMode);
    });
    moduleMarkupWatcher.on('change', (filePath, stats) => {
        filePath = filePath.replace(/\\/g, path.sep);
        console.log(`Markup file changed. File path: ${filePath}`);
        let moduleMarkupFile = this.moduleMarkupFiles.find(x => x.filePath === filePath);
        moduleMarkupFile.create(this.prodMode);
    });
    layoutModuleScriptWatcher.on('change', (filePath, stats) => {
        filePath = filePath.replace(/\\/g, path.sep);
        console.log(`Script file changed. File path: ${filePath}`);
        let layoutModuleScriptFile = this.layoutModuleScriptFiles.find(x => x.filePath === filePath);

        this.setImportedChildren(moduleScriptFile, false);

        layoutModuleScriptFile.build(this.prodMode);
    });
    layoutModuleStyleWatcher.on('change', (filePath, stats) => {
        filePath = filePath.replace(/\\/g, path.sep);
        console.log(`Style file changed. File path: ${filePath}`);
        let layoutModuleStyleFile = this.layoutModuleStyleFiles.find(x => x.filePath === filePath);

        this.setImportedChildren(layoutModuleStyleFile, true);

        layoutModuleStyleFile.build(this.prodMode);
    });
    layoutModuleMarkupWatcher.on('change', (filePath, stats) => {
        filePath = filePath.replace(/\\/g, path.sep);
        console.log(`Markup file changed. File path: ${filePath}`);
        let layoutModuleMarkupFile = this.layoutModuleMarkupFiles.find(x => x.filePath === filePath);

        let moduleMarkupFiles = this.findMostChildMarkupFilesRecursively(layoutModuleMarkupFile);

        if (moduleMarkupFiles.length > 0)
            moduleMarkupFiles.forEach(x => x.create(this.prodMode));
    });
    libraryScriptWatcher.on('change', (filePath, stats) => {
        filePath = filePath.replace(/\\/g, path.sep);
        console.log(`Script file changed. File path: ${filePath}`);
        let libraryScriptFile = this.libraryScriptFiles.find(x => x.filePath === filePath);

        this.setImportedChildren(libraryScriptFile, false);

        let scriptFiles = this.findMostParentsRecursively(libraryScriptFile, false);
        if (scriptFiles.length > 0)
            scriptFiles.forEach(x => { if (x.build) x.build(this.prodMode) });
    });
    libraryStyleWatcher.on('change', (filePath, stats) => {
        filePath = filePath.replace(/\\/g, path.sep);
        console.log(`Style file changed. File path: ${filePath}`);
        let libraryStyleFile = this.libraryStyleFile.find(x => x.filePath === filePath);

        this.setImportedChildren(libraryStyleFile, true);

        let styleFiles = this.findMostParentsRecursively(libraryStyleFile, true);
        if (styleFiles.length > 0)
            styleFiles.forEach(x => { if (x.build) x.build(this.prodMode) });
    });
    standaloneStyleLibraryWatcher.on('change', (filePath, stats) => {
        filePath = filePath.replace(/\\/g, path.sep);
        console.log(`Style file changed. File path : ${filePath}`);
        let standaloneLibraryStyleFile = this.standaloneStyleLibraryStyleFiles.find(x => x.filePath === filePath);
        let entryFile = this.standaloneStyleLibraryStyleFiles
            .find(x => x.getLibraryName() === standaloneLibraryStyleFile.getLibraryName() && x instanceof StandaloneLibraryEntryStyleFile);
        entryFile.build(this.prodMode);
    });

    standaloneScriptLibraryWatcher.on('change', (filePath, stats) => {
        filePath = filePath.replace(/\\/g, path.sep);
        console.log(`Script file changed. File path : ${filePath}`);
        let standaloneLibraryScriptFile = this.standaloneScriptLibraryScriptFiles.find(x => x.filePath === filePath);
        let entryFile = this.standaloneScriptLibraryScriptFiles
            .find(x => x.getLibraryName() === standaloneLibraryScriptFile.getLibraryName() && x instanceof StandaloneLibraryEntryScriptFile);
        entryFile.build(this.prodMode);
    });
}
/**
 * 
 * @param {string} route Relative from host
 * @param {Object.<string,string>} params 
 * @param {{Object.<string,string>}} queries 
 * @returns {string}
 */
Controller.prototype.getModuleNameFromRoute = function (route, params, queries) {
    if (params) {
        for (let param in params) {
            let paramValue = params[param];
            if (paramValue) {
                if (paramValue.startsWith('/'))
                    route = route.replace(new RegExp(paramValue), '');
                else
                    route = route.replace(new RegExp('/' + paramValue), '');
            }
        }
    }
    if (queries) {
        for (let query in queries) {
            let queryValue = queries[query];
            if (queryValue) {
                route = route.replace(new RegExp(query), '');
                route = route.replace(new RegExp(queryValue), '');
            }
        }
        route = route.replace(new RegExp(/[\?\=]/), '');
    }
    if (route[0] === '/')
        route = route.substring(1, path.length);

    let moduleName = route.replace(/\//g, this.configuration.moduleNameSeperator);

    if (moduleName === '')
        moduleName = this.configuration.rootModuleFileName;

    if (this.modules[moduleName])
        return moduleName;
    else {

        return null;
    }
}
Controller.prototype.findMarkupFile = function (moduleName) {
    if (!moduleName)
        return null;

    return this.modules[moduleName].markupFile;
}
Controller.prototype.getModuleMarkupFileOutputPath = function (moduleName, absolute = false) {
    let markupFile = this.findMarkupFile(moduleName);
    if (markupFile) {
        if (!absolute)
            return markupFile.getOutputPath();
        else
            return path.join(process.cwd(), markupFile.getOutputPath());
    } else
        return null;
}

Controller.prototype.setImportedChildren = function (file, isStyle) {
    let method = isStyle ? 'findImportedStyleFilePaths' : 'findImportedScriptFilePaths';
    let library = isStyle ? 'libraryStyleFiles' : 'libraryScriptFiles';
    let children = isStyle ? 'childrenStyleFiles' : 'childrenScriptFiles';
    let parent = isStyle ? 'parentStyleFiles' : 'parentScriptFiles';

    // If imported new file add to its children
    let importedFilePaths = file[method]();
    let importedChildren;
    if (importedFilePaths && importedFilePaths.length > 0) {
        importedChildren = importedFilePaths
            .map(x => this[library].find(y => x === y.filePath));
        for (let importedChild of importedChildren) {
            if (!file[children].includes(importedChild)) {
                file[children].push(importedChild);
                importedChild[parent].push(file);
            }
        }
    }

    // We will splice existing childs from current child scripts
    // Spliced elements are current children and the rest are removed dependencies
    let childrenFilesCopy = file[children].slice();

    if (importedChildren && importedChildren.length > 0) {
        for (let importedChild of importedChildren) {
            childrenFilesCopy.splice(childrenFilesCopy.indexOf(importedChild), 1);
        }
    }
    if (childrenFilesCopy.length > 0) {
        for (let removedDependency of childrenFilesCopy) {
            file[children].splice(file[children].indexOf(removedDependency), 1);
            removedDependency[parent].splice(removedDependency[parent].indexOf(file), 1);
        }
    }
}
Controller.prototype.findMostChildMarkupFilesRecursively = function (markupFile, result = []) {
    if (markupFile.childrenLayoutModuleMarkupFiles.length > 0) {
        for (let childFile of markupFile.childrenLayoutModuleMarkupFiles)
            this.findMostChildMarkupFilesRecursively(childFile, result);
    }
    if (markupFile.childrenModuleMarkupFiles) {
        result.push(...markupFile.childrenModuleMarkupFiles);
    }
    return result;
}
Controller.prototype.findMostParentsRecursively = function (file, isStyle, previous, result = []) {
    let parent = isStyle ? 'parentStyleFiles' : 'parentScriptFiles';
    if (file[parent].length > 0) {
        for (var parentFile of file[parent]) {
            // Handle circular dependencies. If previous file is contained in parents we will continue
            if (parentFile === previous)
                continue;
            this.findMostParentsRecursively(parentFile, isStyle, file, result);
        }
    }
    else {
        if (result.indexOf(file) === -1)
            result.push(file);
    }

    return result;
}
module.exports = Controller;