# Description
First sory for my bad english.

This project is boilerplate for client side typescript projects. Unless you add or remove a file it builds only required files. If you add or remove a new file or change configuration file complete build process occurs. The client project consists of modules. Each module has its own script, style and markup file. They reside on their folders. And there should only be module files in folders and other module folders. And there is also layout modules that enables to layout your modules. Mathces your modules with corresponding layout modules by checking their file name. With configuration file you can configure different layouting chain. To understand better lets explain client configuration file.

## Configuration

Lets put an example configuration file and explain over it.

Here is type definition for configuration
```
/**
 * @typedef {Object} ConfigurationInputDirectories
 * @property {string} modules
 * @property {string} layoutModules
 * @property {string} standaloneStyleLibraries
 * @property {string} libraryScripts
 * @property {string} libraryStyles
 * @property {string} markupTemplates
 */

/**
 * @typedef {Object} ConfigurationOutputDirectories
 * @property {string} moduleScripts
 * @property {string} layoutModuleScripts
 * @property {string} vendorScripts
 * @property {string} moduleStyles
 * @property {string} layoutModuleStyles
 * @property {string} vendorStyles
 * @property {string} standaloneStyleLibraries
 * @property {string} markupFiles
 */

/**
 * @typedef {Object} ConfigurationReferenceParentPaths
 * @param {string} vendorScripts
 * @param {string} moduleScripts
 * @param {string} layoutModuleScripts
 * @param {string} vendorStyles
 * @param {string} standaloneLibraryStyles
 * @param {string} moduleStyles
 * @param {string} layoutModuleStyles
 * @param {string} moduleMarkupFiles
 */

/**
 * @typedef {Object} ConfigurationVendorScript
 * @property {string} standardPath
 * @property {string} minPath
 */

/**
 * @typedef {Object} ConfigurationVendor
 * @property {string} standardPath
 * @property {string} minPath
 * @property {string} standardMapPath
 * @property {string} minMapPath
 */

/**
 * @typedef {Object} ConfigurationModule
 * @property {string[]} substitutingModules
 * @property {string} layoutModule
 * @property {string} markupTemplate
 * @property {string[]} includeStandaloneStyles
 * @property {string[]} includeVendorScripts
 * @property {string[]} includeVendorStyles
 * @property {string[]} excludeStandaloneStyles
 * @property {string[]} excludeVendorScripts
 * @property {string[]} excludeVendorStyles
 */

/**
 * @typedef {Object} ConfigurationLayoutModule
 * @property {string} layoutModule
 * @property {string} markupTemplate
 * @property {string[]} includeStandaloneStyles
 * @property {string[]} includeVendorScripts
 * @property {string[]} includeVendorStyles
 * @property {string[]} excludeStandaloneStyles
 * @property {string[]} excludeVendorScripts
 * @property {string[]} excludeVendorStyles
 */

/**
 * Represents configuration object for build process.
 * @typedef {Object} Configuration
 * @property {ConfigurationInputDirectories} inputDirectories
 * @property {ConfigurationOutputDirectories} outputDirectories
 * @property {ConfigurationReferenceParentPaths} referenceParentPaths
 * @property {Object.<string,ConfigurationVendor} vendorScripts
 * @property {Object.<string,ConfigurationVendor>} vendorStyles
 * @property {Object.<string,ConfigurationModule>} modules
 * @property {Object.<string,ConfigurationLayoutModule>} layoutModules
 * @property {string} defaultMarkupTemplate
 * @property {string} contentPlaceHolder
 * @property {string} moduleNameSeperator
 * @property {string[]} validStandaloneLibraryEntryFileNames
 * @property {string} moduleFileName
 * @property {string} rootModuleFileName
 */
```

And here is example configuration object.
```
{
    inputDirectories: {
        modules: 'clientSource/modules',
        layoutModules: 'clientSource/layoutModules',
        libraryScripts: 'clientSource/libraryScripts',
        libraryStyles: 'clientSource/libraryStyles',
        standaloneStyleLibraries: 'clientSource/standaloneStyleLibraries',
        markupTemplates: 'clientSource/markupTemplates'
    },
    outputDirectories: {
        markupFiles: 'clientOutput/markupFiles',
        moduleScripts: 'clientOutput/moduleScripts',
        moduleStyles: 'clientOutput/moduleStyles',
        layoutModuleScripts: 'clientOutput/layoutModuleScripts',
        layoutModuleStyles: 'clientOutput/layoutModuleStyles',
        standaloneStyleLibraries: 'clientOutput/standaloneStyleLibraries',
        vendorScripts: 'clientOutput/vendorScripts',
        vendorStyles: 'clientOutput/vendorStyles'
    },
    referenceParentPaths: {
        vendorScripts: 'vendorScripts',
        layoutModuleScripts: 'layoutModuleScripts',
        moduleScripts: 'moduleScripts',
        vendorStyles: 'vendorStyles',
        standaloneLibraryStyles: 'standaloneLibraryStyles',
        layoutModuleStyles: 'layoutModuleStyles',
        moduleStyles: 'moduleStyles',
        systemJs: 'systemjs'
    },
    modules: {
        'errors_404': {
            includeVendorScripts: null,
            includeVendorStyles: null,
            includeStandaloneStyles: null,
            layoutModule: null
        },
        'errors_401': {
            includeVendorScripts: null,
            includeVendorStyles: null,
            includeStandaloneStyles: null,
            layoutModule: null
        },
        'vehicle_add': {
            substitutingModules: ['vehicle_edit']
        }
    },
    layoutModules: {
    },
    vendorScripts: {
        jquery: {
            standardPath: 'node_modules/jquery/dist/jquery.js',
            minPath: 'node_modules/jquery/dist/jquery.min.js',
        },
        bootstrap: {
            standardPath: 'node_modules/bootstrap/dist/js/bootstrap.js',
            minPath: 'node_modules/bootstrap/dist/js/bootstrap.min.js',
            standardMapPath: 'node_modules/bootstrap/dist/js/bootstrap.js.map',
            minMapPath: 'node_modules/bootstrap/dist/js/bootstrap.min.js.map'
        },
        axios: {
            standardPath: 'node_modules/axios/dist/axios.js',
            standardMapPath: 'node_modules/axios/dist/axios.map',
            minPath: 'node_modules/axios/dist/axios.min.js',
            minMapPath: 'node_modules/axios/dist/axios.min.map',
        }
    },
    vendorStyles: {
        bootstrap: {
            standardPath: 'node_modules/bootstrap/dist/css/bootstrap.css',
            minPath: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
            standardMapPath: 'node_modules/bootstrap/dist/css/bootstrap.css.map',
            minMapPath: 'node_modules/bootstrap/dist/css/bootstrap.min.css.map'
        }
    },
    contentPlaceHolder: '/////content/////',
    defaultMarkupTemplate: 'default.html',
    moduleNameSeperator: '_',
    validStandaloneLibraryEntryFileNames: ['index', 'main'],
    moduleFileName: 'module',
    rootModuleFileName: 'root'
}
```

### Input Directories
You put your source files in theese directories.
### modules
This directory is where the your modules reside. Entire client project exists as modules. Each module has its own markup, style and script file.
