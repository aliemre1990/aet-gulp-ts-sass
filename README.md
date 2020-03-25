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
#### modules
This directory is where the your modules reside. Entire client project exists as modules. Each module has its own markup, style and script file. Modules file structure is like this:

```
{inputDirectories.modules}
├── root.html
├── root.scss
├── root.ts
├── moduleA
│   ├── moduleA.html
│   ├── moduleA.scss
│   └── moduleA.ts
├── moduleB
│   │── moduleBA
│   │   ├── moduleBA.html
│   │   │── moduleBA.scss
│   │   └── moduleBA.ts
│   └── moduleBB
│       ├── moduleBB.html
│       │── moduleBB.scss
│       └── moduleBB.ts
└── ...
```

### layoutModules
Wher the layout modules reside.

### libraryScripts
Your dependency script files that are used by module or layout module script files.

### libraryStyles
Your dependency style files. that are used by module or layout module style files.

### standaloneStyleLibraries
Your standalone styles. They will be referenced independently on markup files.

### markupTemplates
Where your html markup boilerplate files reside. Theese files are empty html templates. Usually you will have a single file here.

## outputDirectories
The paths where your built files will reside.

### markupFiles
Where your built markup files reside.

### moduleScripts
Where your module script files reside. 
... And so on...

## referenceParentPaths
Paths that will be used in script and style tags. Usually you wont need to change theese properties.

## modules
Module configurations. Keys will be each modules name. A modules name is determined by its folder name relative from module input directory. For example a module inside a folder '{process.cwd()}/{inputDirectories.modules}/moduleA/moduleAB and let module name seperator be '_' then module name will be 'moduleA_moduleAB'.

### module.substitutingModules
If you want to use one module for multiple module paths use this property. Its good at situations like using same page for adding and editing.

### module.layoutModule
It's used to set layoutModule for module explicitly. By default layout module is determined by matching the module path with layout module path.

### module.markupTemplate
Used to set modules markup template file explicitly. 

### module.includeStandaloneStyles
Used to determine which standalone styles will be added to the module.

### module.includeVendorScripts
If this property set only specified vendor scripts will be referenced by module.

### module.includeVendorStyles
Same as includeVendorScripts

### module.excludeStandaloneStyles
If this property set, specified styles will be subtracted from all standalone styles and will be referenced.

### module.excludeVendorScripts
Same...

### module.excludeVendorStyles
Same...