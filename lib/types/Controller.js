const fs = require('fs');
const path = require('path').posix;

const gulp = require('gulp');
const rimraf = require('rimraf');

const helper = require('../helper');
const ModuleScriptFile = require('./file/ScriptFile/ModuleScriptFile');
const LayoutModuleScriptFile = require('./file/ScriptFile/LayoutModuleScriptFile');
const LibraryScriptFile = require('./file/ScriptFile/LibraryScriptFile');
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

/**
 * @param {boolean} prodMode
 * @constructor
 */
function Controller(configurationPath, tsCompilerOptions, prodMode) {
    this.prodMode = prodMode;
    this.configurationPath = configurationPath;
    this.tsCompilerOptions = tsCompilerOptions;

    this.configuration = null;
    this.libraryScriptFiles = [];
    this.moduleScriptFiles = [];
    this.layoutModuleScriptFiles = [];
    this.allScriptFiles = [];
    this.libraryStyleFiles = [];
    this.standaloneStyleLibraryStyleFiles = [];
    this.moduleStyleFiles = [];
    this.layoutModuleStyleFiles = [];
    this.layoutModuleMarkupFiles = [];
    this.moduleMarkupFiles = [];
    this.templateMarkupFiles = [];
    this.vendorScriptFiles = [];
    this.vendorScriptMapFiles = [];
    this.vendorStyleFiles = [];
    this.vendorStyleMapFiles = [];
    this.moduleConfigurationFiles = [];
    this.layoutModuleConfigurationFiles = [];

    this.construct();
}

Controller.prototype.construct = function () {

    this.configuration = require(this.configurationPath);

    this.moduleConfigurationFiles = helper.findFilesRecursively(this.configuration.inputDirectories.modules, ['.json'])
        .map(x => new ModuleConfigurationFile(x, this.configuration));

    this.layoutModuleConfigurationFiles = helper.findFilesRecursively(this.configuration.inputDirectories.modules, ['.json'])
        .map(x => new LayoutModuleConfigurationFile(x, this.configuration));

    this.configuration.modules = {};
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
    this.libraryScriptFiles = helper.findFilesRecursively(this.configuration.inputDirectories.libraryScripts, ['.ts'])
        .map(x => new LibraryScriptFile(x, this.configuration));

    this.moduleScriptFiles = helper.findFilesRecursively(this.configuration.inputDirectories.modules, ['.ts'])
        .map(x => new ModuleScriptFile(x, this.configuration, this.tsCompilerOptions));

    this.layoutModuleScriptFiles = helper.findFilesRecursively(this.configuration.inputDirectories.layoutModules, ['.ts'])
        .map(x => new LayoutModuleScriptFile(x, this.configuration, this.tsCompilerOptions));

    this.allScriptFiles = Array.prototype
        .concat(this.libraryScriptFiles, this.moduleScriptFiles, this.layoutModuleScriptFiles);
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
    this.libraryStyleFiles = helper.findFilesRecursively(this.configuration.inputDirectories.libraryStyles, ['.scss'])
        .map(x => new LibraryStyleFile(x, this.configuration));

    this.standaloneStyleLibraryStyleFiles = helper.findFilesRecursively(this.configuration.inputDirectories.standaloneStyleLibraries, ['.scss'])
        .map(x => {
            if (path.dirname(path.dirname(x)) === this.configuration.inputDirectories.standaloneStyleLibraries &&
                this.configuration.validStandaloneLibraryEntryFileNames.includes(path.basename(x).replace('.scss', '')))
                return new StandaloneLibraryEntryStyleFile(x, this.configuration);
            else if (path.dirname(x) === this.configuration.inputDirectories.standaloneStyleLibraries) {
                return new StandaloneLibraryEntryStyleFile(x, this.configuration);
            }
            else
                return new StandaloneLibraryDependencyStyleFile(x, this.configuration);
        });

    this.moduleStyleFiles = helper.findFilesRecursively(this.configuration.inputDirectories.modules, ['.scss'])
        .map(x => new ModuleStyleFile(x, this.configuration));

    this.layoutModuleStyleFiles = helper.findFilesRecursively(this.configuration.inputDirectories.layoutModules, ['.scss'])
        .map(x => new LayoutModuleStyleFile(x, this.configuration));

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
    this.vendorScriptFiles = [];
    this.vendorScriptMapFiles = [];
    for (let vendorScriptName in this.configuration.vendorScripts) {
        let vendorScript = this.configuration.vendorScripts[vendorScriptName];

        let vendorScriptFilePath;
        let vendorScriptMapFilePath;
        if (this.prodMode) {
            if (vendorScript.minPath) {
                vendorScriptFilePath = vendorScript.minPath;
                vendorScriptMapFilePath = vendorScript.minMapPath;
            } else {
                vendorScriptFilePath = vendorScript.standardPath;
                vendorScriptMapFilePath = vendorScript.standardMapPath;
            }
        } else {
            if (vendorScript.standardPath) {
                vendorScriptFilePath = vendorScript.standardPath;
                vendorScriptMapFilePath = vendorScript.standardMapPath;
            } else {
                vendorScriptFilePath = vendorScript.minPath;
                vendorScriptMapFilePath = vendorScript.minMapPath;
            }
        }
        let vendorScriptFile = new VendorScriptFile(vendorScriptFilePath, vendorScriptName, this.configuration);
        this.vendorScriptFiles.push(vendorScriptFile);
        if (vendorScriptMapFilePath) {
            let vendorScriptMapFile = new VendorScriptMapFile(vendorScriptMapFilePath, vendorScriptName, this.configuration);
            this.vendorScriptMapFiles.push(vendorScriptMapFile);
            vendorScriptFile.mapFile = vendorScriptMapFile;
        }
    }

    /**
     * 
     */
    this.vendorStyleFiles = [];
    this.vendorStyleMapFiles = [];
    for (let vendorStyleName in this.configuration.vendorStyles) {
        let vendorStyle = this.configuration.vendorStyles[vendorStyleName];


        let vendorStyleFilePath;
        let vendorStyleMapFilePath;
        if (this.prodMode) {
            if (vendorStyle.minPath) {
                vendorStyleFilePath = vendorStyle.minPath;
                vendorStyleMapFilePath = vendorStyle.minMapPath;
            } else {
                vendorStyleFilePath = vendorStyle.standardPath;
                vendorStyleMapFilePath = vendorStyle.standardMapPath;
            }
        } else {
            if (vendorStyle.standardPath) {
                vendorStyleFilePath = vendorStyle.standardPath;
                vendorStyleMapFilePath = vendorStyle.standardMapPath;
            } else {
                vendorStyleFilePath = vendorStyle.minPath;
                vendorStyleMapFilePath = vendorStyle.minMapPath;
            }
        }
        let vendorStyleFile = new VendorStyleFile(vendorStyleFilePath, vendorStyleName, this.configuration);
        this.vendorStyleFiles.push(vendorStyleFile);
        if (vendorStyleMapFilePath) {
            let vendorStyleMapFile = new VendorStyleMapFile(vendorStyleMapFilePath, vendorStyleName, this.configuration);
            this.vendorStyleMapFiles.push(vendorStyleMapFile);
            vendorStyleFile.mapFile = vendorStyleMapFile;
        }
    }

    /**
     * 
     */
    this.templateMarkupFiles = helper
        .findFilesRecursively(this.configuration.inputDirectories.markupTemplates, ['.html'])
        .map(x => new TemplateMarkupFile(x, this.configuration));

    /**
     * 
     */
    this.layoutModuleMarkupFiles = helper
        .findFilesRecursively(this.configuration.inputDirectories.layoutModules, ['.html'])
        .map(x => new LayoutModuleMarkupFile(x, this.configuration));

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
        } else {

            // clientSource/layoutModules/moduleA/moduleAA/moduleAA.html
            let parentDir = path.dirname(path.dirname(layoutModuleMarkupFile.filePath));
            if (parentDir.length >= this.configuration.inputDirectories.layoutModules.length) {
                do {
                    parentLayoutModuleMarkupFile = this.layoutModuleMarkupFiles.find(x => path.dirname(x.filePath) === parentDir);
                    if (parentLayoutModuleMarkupFile)
                        break;
                } while (parentDir !== this.configuration.inputDirectories.layoutModules && (parentDir = path.dirname(parentDir)));

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
                    bag.standaloneLibraryScriptsExplicitlySet = true;
                } else if (layoutModuleConfiguration.includeStandaloneStyles === null) {
                    bag.standaloneLibraryStyleFiles = [];
                    bag.standaloneLibraryStylesExplicitlySet = true;
                } else if (layoutModuleConfiguration.excludeStandaloneStyles === null) {
                    bag.standaloneLibraryStylesExplicitlySet = true;
                }

            }

            if (!bag.vendorScriptsExplicitlySet) {
                if (layoutModuleConfiguration.includeVendorScripts) {
                    bag.vendorScriptFiles = this.vendorScriptFiles
                        .filter(x => layoutModuleConfiguration.includeVendorScripts.includes(x.vendorName));
                    bag.vendorScriptsExplicitlySet = true;
                } else if (layoutModuleConfiguration.excludeVendorScripts) {
                    bag.vendorScriptFiles = this.vendorScriptFiles
                        .filter(x => !layoutModuleConfiguration.excludeVendorScripts.includes(x.vendorName));
                    bag.vendorScriptsExplicitlySet = true;
                } else if (layoutModuleConfiguration.includeVendorScripts === null) {
                    bag.vendorScriptFiles = [];
                    bag.vendorScriptsExplicitlySet = true;
                } else if (layoutModuleConfiguration.excludeVendorScripts === null) {
                    bag.vendorScriptsExplicitlySet = true;
                }
            }

            if (!bag.vendorStylesExplicitlySet) {
                if (layoutModuleConfiguration.includeVendorStyles) {
                    bag.vendorStyleFiles = this.vendorStyleFiles
                        .filter(x => layoutModuleConfiguration.includeVendorStyles.includes(x.vendorName));
                    bag.vendorStylesExplicitlySet = true;
                } else if (layoutModuleConfiguration.excludeVendorStyles) {
                    bag.vendorStyleFiles = this.vendorStyleFiles
                        .filter(x => !layoutModuleConfiguration.excludeVendorStyles.includes(x.vendorName));
                    bag.vendorStylesExplicitlySet = true;
                } else if (layoutModuleConfiguration.includeVendorStyles === null) {
                    bag.vendorStyleFiles = [];
                    bag.vendorStylesExplicitlySet = true;
                } else if (layoutModuleConfiguration.excludeVendorStyles === null) {
                    bag.vendorStylesExplicitlySet = true;
                }

            }

            if (!bag.markupTemplateFileExplicitlySet) {
                if (layoutModuleConfiguration.markupTemplate) {
                    bag.markupTemplateFile = this.templateMarkupFiles
                        .find(x => x.filePath === path.join(this.configuration.inputDirectories.markupTemplates, layoutModuleConfiguration.markupTemplate));
                    bag.markuptemplateFileExplicitlySet = true;
                } else if (layoutModuleConfiguration.markupTemplate === null) {
                    bag.markupTemplateFile = null;
                    bag.markupTemplateFileExplicitlySet = true;
                }
            }
        }

        if (layoutModuleMarkupFile.parentLayoutModuleMarkupFile)
            setDependenciesRecursively.call(this, layoutModuleMarkupFile.parentLayoutModuleMarkupFile);
        else if (layoutModuleConfiguration && layoutModuleConfiguration.layoutModule)
            setDependenciesRecursively.call(this, this.layoutModuleMarkupFiles.find(x => x.getModuleName() === layoutModuleConfiguration.layoutModule));
        else
            return;
    }

    this.moduleMarkupFiles = helper
        .findFilesRecursively(this.configuration.inputDirectories.modules, '.html', false, true)
        .map(x => new ModuleMarkupFile(x, this.configuration));

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
            let relativeDirName = path.dirname(path.relative(this.configuration.inputDirectories.modules, moduleMarkupFile.filePath));
            let dirNameSplit = relativeDirName.split(new RegExp(path.sep, 'g'));
            for (let i = 0; i <= dirNameSplit.length; i++) {
                let dirNameSlice = dirNameSplit.slice(0, dirNameSplit.length - i);
                let relativeDirName = dirNameSlice.join(path.sep);
                if (relativeDirName === '.')
                    relativeDirName = '';
                let layoutModuleMarkupFile = this.layoutModuleMarkupFiles
                    .find(x => path.dirname(x.filePath) === path.join(this.configuration.inputDirectories.layoutModules, relativeDirName))
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
            vendorScriptFiles: this.vendorScriptFiles.slice(),
            vendorScriptsExplicitlySet: false,
            vendorStyleFiles: this.vendorStyleFiles.slice(),
            vendorStylesExplicitlySet: false,
            markupTemplateFile: this.templateMarkupFiles
                .find(x => x.filePath === path.join(this.configuration.inputDirectories.markupTemplates, this.configuration.defaultMarkupTemplate)),
            markupTemplateFileExplicitlySet: false
        };

        if (moduleConfiguration && moduleConfiguration.includeStandaloneStyles) {
            bag.standaloneLibraryStyleFiles = this.standaloneStyleLibraryStyleFiles
                .filter(x => moduleConfiguration.includeStandaloneStyles
                    .find(y => x.getLibraryName() === y && x instanceof StandaloneLibraryEntryStyleFile));
            bag.standaloneLibraryStyleFilesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeStandaloneStyles) {
            bag.standaloneLibraryStyleFiles = this.standaloneLibraryStyleFiles
                .filter(x => !moduleConfiguration.excludeStandaloneStyles
                    .find(y => x.getLibraryName() === y && x instanceof StandaloneLibraryEntryStyleFile));
            bag.standaloneLibraryScriptsExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.includeStandaloneStyles === null) {
            bag.standaloneLibraryStyleFiles = [];
            bag.standaloneLibraryStylesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeStandaloneStyles === null) {
            bag.standaloneLibraryStylesExplicitlySet = true;
        }

        if (moduleConfiguration && moduleConfiguration.includeVendorScripts) {
            bag.vendorScriptFiles = this.vendorScriptFiles
                .filter(x => moduleConfiguration.includeVendorScripts.includes(x.vendorName));
            bag.vendorScriptsExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeVendorScripts) {
            bag.vendorScriptFiles = this.vendorScriptFiles
                .filter(x => !moduleConfiguration.excludeVendorScripts.includes(x.vendorName));
            bag.vendorScriptsExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.includeVendorScripts === null) {
            bag.vendorScriptFiles = [];
            bag.vendorScriptsExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeVendorScripts === null) {
            bag.vendorScriptsExplicitlySet = true;
        }

        if (moduleConfiguration && moduleConfiguration.includeVendorStyles) {
            bag.vendorStyleFiles = this.vendorStyleFiles
                .filter(x => moduleConfiguration.includeVendorStyles.includes(x.vendorName));
            bag.vendorStylesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeVendorStyles) {
            bag.vendorStyleFiles = this.vendorStyleFiles
                .filter(x => !moduleConfiguration.excludeVendorStyles.includes(x.vendorName));
            bag.vendorStylesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.includeVendorStyles === null) {
            bag.vendorStyleFiles = [];
            bag.vendorStylesExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.excludeVendorStyles === null) {
            bag.vendorStylesExplicitlySet = true;
        }

        if (moduleConfiguration && moduleConfiguration.markupTemplate) {
            bag.markupTemplateFile = this.templateMarkupFiles
                .find(x => x.filePath === path.join(this.configuration.inputDirectories.markupTemplates, moduleConfiguration.markupTemplate));
            bag.markuptemplateFileExplicitlySet = true;
        } else if (moduleConfiguration && moduleConfiguration.markupTemplate === null) {
            bag.markupTemplateFile = null;
            bag.markupTemplateFileExplicitlySet = true;
        }

        if (moduleMarkupFile.layoutModuleMarkupFile)
            setDependenciesRecursively.call(this, moduleMarkupFile.layoutModuleMarkupFile, bag);

        // moduleMarkupFile.standaloneLibraryScriptFiles = bag.standaloneLibraryScriptFiles.slice();
        moduleMarkupFile.standaloneLibraryStyleFiles = bag.standaloneLibraryStyleFiles.slice();
        moduleMarkupFile.vendorScriptFiles = bag.vendorScriptFiles.slice();
        moduleMarkupFile.vendorStyleFiles = bag.vendorStyleFiles.slice();
        moduleMarkupFile.templateMarkupFile = bag.markupTemplateFile;

        // moduleMarkupFile.standaloneLibraryScriptFiles.forEach(x => x.parentModuleMarkupFiles.push(moduleMarkupFile));
        moduleMarkupFile.standaloneLibraryStyleFiles.forEach(x => x.parentModuleMarkupFiles.push(moduleMarkupFile));
        moduleMarkupFile.vendorScriptFiles.forEach(x => x.parentModuleMarkupFiles.push(moduleMarkupFile));
        moduleMarkupFile.vendorStyleFiles.forEach(x => x.parentModuleMarkupFiles.push(moduleMarkupFile));
        moduleMarkupFile.templateMarkupFile.childrenModuleMarkupFiles.push(moduleMarkupFile);
    }
}
/**
 * Builds files.
 */
Controller.prototype.build = function () {
    rimraf.sync(this.configuration.outputDirectories.layoutModuleScripts);
    rimraf.sync(this.configuration.outputDirectories.layoutModuleStyles);
    rimraf.sync(this.configuration.outputDirectories.markupFiles);
    rimraf.sync(this.configuration.outputDirectories.moduleScripts);
    rimraf.sync(this.configuration.outputDirectories.moduleStyles);
    rimraf.sync(this.configuration.outputDirectories.standaloneStyleLibraries);
    rimraf.sync(this.configuration.outputDirectories.vendorScripts);
    rimraf.sync(this.configuration.outputDirectories.vendorStyles);

    for (let moduleMarkupFile of this.moduleMarkupFiles) {
        moduleMarkupFile.create(this.prodMode);

        if (moduleMarkupFile.moduleScriptFile)
            moduleMarkupFile.moduleScriptFile.build(this.prodMode);
        if (moduleMarkupFile.moduleStyleFile)
            moduleMarkupFile.moduleStyleFile.build(this.prodMode);
    }

    for (let layoutModuleMarkupFile of this.layoutModuleMarkupFiles) {
        if (layoutModuleMarkupFile.layoutModuleScriptFile)
            layoutModuleMarkupFile.layoutModuleScriptFile.build(this.prodMode);
        if (layoutModuleMarkupFile.layoutModuleStyleFile)
            layoutModuleMarkupFile.layoutModuleStyleFile.build(this.prodMode);
    }

    for (let standaloneLibraryEntryStyleFile of this.standaloneStyleLibraryStyleFiles.filter(x => x instanceof StandaloneLibraryEntryStyleFile))
        standaloneLibraryEntryStyleFile.build(this.prodMode);

    for (let vendorScriptFile of this.vendorScriptFiles)
        vendorScriptFile.transfer();

    for (let vendorStyleFile of this.vendorStyleFiles) {
        vendorStyleFile.transfer();
    }
}
/**
 * Watches files.
 */
Controller.prototype.watch = function () {
    let mainWatcher = gulp
        .watch([
            this.configurationPath,
            this.configuration.inputDirectories.modules + '/**/*',
            this.configuration.inputDirectories.layoutModules + '/**/*',
            this.configuration.inputDirectories.standaloneStyleLibraries + '/**/*',
            this.configuration.inputDirectories.markupTemplates + '/**/*',
            this.configuration.inputDirectories.libraryScripts + '/**/*',
            this.configuration.inputDirectories.libraryStyles + '/**/*'
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
                if (filePath === 'clientBuild/configuration.js' || path.extname(filePath) === ".json") {
                    console.log(`Client configuration file changed. Complete build will happen.`);
                    this.construct();
                    this.build();
                }
                break;
            default:
                break;
        }
    });

    let moduleScriptWatcher = gulp.watch(this.configuration.inputDirectories.modules + '/**/*.ts');
    let moduleStyleWatcher = gulp.watch(this.configuration.inputDirectories.modules + '/**/*.scss');
    let moduleMarkupWatcher = gulp.watch(this.configuration.inputDirectories.modules + '/**/*.html')
    let layoutModuleScriptWatcher = gulp.watch(this.configuration.inputDirectories.layoutModules + '/**/*.ts');
    let layoutModuleStyleWatcher = gulp.watch(this.configuration.inputDirectories.layoutModules + '/**/*.scss');
    let layoutModuleMarkupWatcher = gulp.watch(this.configuration.inputDirectories.layoutModules + '/**/*.html');
    let libraryScriptWatcher = gulp.watch(this.configuration.inputDirectories.libraryScripts + '/**/*.ts');
    let libraryStyleWatcher = gulp.watch(this.configuration.inputDirectories.libraryStyles + '/**/*.scss');
    let standaloneStyleLibraryWatcher = gulp.watch(this.configuration.inputDirectories.standaloneStyleLibraries + '/**/*.scss');


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

        this.setImportedChildren(layoutModuleStyleFile, false);

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
}
Controller.prototype.getModuleMarkupFileOutputPath = function (route, absolute = false) {
    if (route[0] === '/')
        route = route.substring(1, route.length);
    let moduleName = route.replace(/\//g, this.configuration.moduleNameSeperator);
    if (!moduleName)
        moduleName = this.configuration.rootModuleFileName;
    let moduleMarkupFile = this.moduleMarkupFiles.find(x => x.getModuleName() === moduleName);
    if (moduleMarkupFile) {
        if (!absolute)
            return moduleMarkupFile.getOutputPath();
        else
            return path.join(process.cwd(), moduleMarkupFile.getOutputPath());
    }
    else { // check substuting modules
        moduleMarkupFile = this.moduleMarkupFiles.find(x => {
            var moduleConfiguration = this.configuration.modules[x.getModuleName()];
            if (moduleConfiguration && moduleConfiguration.substitutingModules) {
                return moduleConfiguration.substitutingModules.includes(moduleName);
            }
            return false;
        });
        if (moduleMarkupFile) {
            if (!absolute)
                return moduleMarkupFile.getOutputPath();
            else
                return path.join(process.cwd(), moduleMarkupFile.getOutputPath());
        }
    }
    return null;
}
// Controller.prototype.getStyleFileOutputPath = function (styleType, styleName, absolute = false) {
//     let filePath;
//     switch (styleType) {
//         case this.configuration.referenceParentPaths.vendorStyles:

//             let styleFile = this.vendorStyleFiles
//                 .find(x => path.basename(x.getOutputPath()) === styleName);
//             if (styleFile)
//                 filePath = styleFile.getOutputPath();
//             else {
//                 let styleMapFile = this.vendorStyleMapFiles
//                     .find(x => path.basename(x.getOutputPath()) === styleName);
//                 filePath = styleMapFile.getOutputPath();
//             }
//             break;
//         case this.configuration.referenceParentPaths.standaloneLibraryStyles:
//             filePath = this.standaloneStyleLibraryStyleFiles
//                 .find(x => {
//                     if (x.getOutputPath)
//                         return path.basename(x.getOutputPath()) === styleName;
//                     else
//                         return false;
//                 }).getOutputPath();
//             break;
//         case this.configuration.referenceParentPaths.layoutModuleStyles:
//             filePath = this.layoutModuleStyleFiles
//                 .find(x => path.basename(x.getOutputPath()) === styleName).getOutputPath();
//             break;
//         case this.configuration.referenceParentPaths.moduleStyles:
//             filePath = this.moduleStyleFiles
//                 .find(x => path.basename(x.getOutputPath()) === styleName).getOutputPath();
//             break;
//     }
//     if (absolute)
//         return path.join(process.cwd(), filePath)
//     else
//         return filePath;
// }
// Controller.prototype.getScriptFileOutputPath = function (scriptType, scriptName, absolute = false) {
//     let filePath;
//     switch (scriptType) {
//         case this.configuration.referenceParentPaths.vendorScripts:
//             let scriptFile = this.vendorScriptFiles
//                 .find(x => path.basename(x.getOutputPath()) === scriptName);
//             if (scriptFile)
//                 filePath = scriptFile.getOutputPath();
//             else {
//                 let scriptMapFile = this.vendorScriptMapFiles
//                     .find(x => path.basename(x.getOutputPath()) === scriptName);
//                 if (scriptMapFile)
//                     filePath = scriptMapFile.getOutputPath();
//             }
//             break;
//         case this.configuration.referenceParentPaths.layoutModuleScripts:
//             filePath = this.layoutModuleScriptFiles
//                 .find(x => path.basename(x.getOutputPath()) === scriptName).getOutputPath();
//             break;
//         case this.configuration.referenceParentPaths.moduleScripts:
//             filePath = this.moduleScriptFiles
//                 .find(x => path.basename(x.getOutputPath()) === scriptName).getOutputPath();
//             break;
//     }
//     if (absolute)
//         return path.join(process.cwd(), filePath)
//     else
//         return filePath;
// }

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