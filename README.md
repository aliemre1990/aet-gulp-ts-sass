# Install
npm install aet-gulp-ts-sass

# Description
This library is for client side typescript projects. It builds and watches your source files using gulp. Unless you add or remove a file it builds only required files in watch mode. If you add or remove a new file or change configuration file complete build process occurs. The client project consists of modules. Each module has its own script, style and markup file. And there is also layout modules that enables to layout your modules. Layout modules have same file structure as modules. Your modules matched with corresponding layout modules by checking their file path. With configuration file you can configure different layouting chain. It alsa adds script and style tags. Added script and style tags can be adjusted via configuration file.

In this project modules and layout modules exists in this file structure:
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


To understand this project better lets explain client configuration file.

## Configuration

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
        moduleStyles: 'moduleStyles'
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
* **modules:**   This directory is where the your modules reside. Entire client project exists as modules. Each module has its own markup, style and script file.
* **layoutModules:** Where layout modules reside. Layout module file structure is same as modules.
* **libraryScripts:** Your imported script files that are used by module or layout module script files.
* **libraryStyles:** Your imported style files that are used by module or layout module style files.
* **standaloneStyleLibraries:** Your standalone styles. They will be referenced independently on markup files.
* **markupTemplates**
Where your html markup boilerplate files reside. Theese files are empty html templates. Usually you will have a single file here.

## outputDirectories
The paths where your built files will reside.
* **markupFiles:** Where your built markup files reside.
* **moduleScripts:** Where your built module script files reside. 

## referenceParentPaths
Paths that will be used in script and style tags. We will use these paths to determine file type. Is referenced script tag module script or layout script. Or vendor script. Usually you wont need to change theese properties.

## moduleConfiguration
Module configurations. Keys will be each modules name. A modules name is determined by its folder name relative from module input directory. For example a module inside a folder '{process.cwd()}/{inputDirectories.modules}/moduleA/moduleAB and let module name seperator be '_' then module name will be 'moduleA_moduleAB'. Module in the root folder is named with value of 'rootModuleFileName' property. For configuring root module we will use this name as key.

* **substitutingModules:** If you want to use a module in place of other modules use this property. Its good at situations like using same page for adding and editing.
* **layoutModule:** It's used to set layoutModule for module explicitly. By default layout module is determined by matching the module path with layout module path.
* **markupTemplate:** Used to set modules markup template file explicitly. By default value of default markup template property is used.
* **includeStandaloneStyles:** Used to determine which standalone styles will be added to the module. If this property set, only values in this property will be referenced.
* **includeVendorScripts:** If this property set only specified vendor scripts will be referenced by module.
* **includeVendorStyles:** Same as includeVendorScripts.
* **excludeStandaloneStyles:** If this property set, specified styles will be subtracted from all standalone styles and will be referenced.
* **excludeVendorScripts:** Same logic as exclude standalone styles
* **module.excludeVendorStyles:** Same...

## layoutModuleConfiguration
Same as module configuration.

By default unless you explicitly set layout modules will be determined by matching module path with layout module path. If you have only root layout module your all modules will use this. But for example you have layout module named 'vehicle' and modules named 'vehicle_add', 'vehicle_edit' they will use vehicle layout module. And vehicle layout module will use root layout module. Module chain will be like 'root>vehicle>vehicle_add' and 'root>vehicle>vehicle_edit'. You can change layout chain by explicitly setting layout module configuration's layoutModule property. Until now i didn't faced such scenario but it's possible. 

Also including and excludeing scripts and styles may confuse you because they exists at modules and layout modules same time. The lower in the chain overridies the higher ones. For example if i use include/exclude properties in 'vehicle_edit' module it overrides if they exist in 'vehicle' layout module. Same is valid for markup template property. Lower in the chain overrides if exists in higher in the chain.

## vendorScripts
Used to define your vendor script libraries.

## vendorStyles
Used to define your vendor style libraries.

## contentPlaceHolder
Place holder text that will be used in layout markup files. Put theese text where you want your module content be replaced.

## defaultMarkupTemplate
Default empty html file.

## moduleNameSeperator
Seperator character used in module names. 

## validStandaloneLibraryEntryFileNames
If your standalone library resides in folder, than main files must be one of theese.

## moduleFileName
A module file, may have containing folder's name or this name. 'vehicle_edit'-> edit.html or {this}.html

## rootModuleFileName
File name used in root module files.

# Usage
```
const ClientController = require('aet-gulp-ts-sass'); 

let tsConfig = JSON.parse(fs.readFileSync('tsconfig.json'));

const clientController = new ClientController(
        path.join(process.cwd(), 'clientConfiguration.js'),
        tsConfig.compilerOptions,
        clientProdMode);
    global.clientController = clientController;

clientController.build();
if (clientWatchMode)
     clientController.watch();

 app.get('/scripts/:scriptType/:scriptName', (req, res, next) => {
    let scriptType = req.params.scriptType;
    let scriptName = req.params.scriptName;
    let filePath = clientController.getScriptFileOutputPath(scriptType, scriptName,true);

    if (filePath) {
        return res.status(200).sendFile(filePath, { headers: { Content-Type': 'text/javascript' } });
        } else
            next();
});

app.get('/styles/:styleType/:styleName', (req, res, next) => {
    let styleType = req.params.styleType;
    let styleName = req.params.styleName;
    let filePath = clientController.getStyleFileOutputPath(styleType, styleName,true);

    if (filePath) {
        return res.status(200).sendFile(filePath, { headers: { 'Content-Type': 'text/css' } });
    } else
    next();
});

app.get('*', (req, res, next) => {
    let filePath = clientController.getModuleMarkupFileOutputPath(req.path, true);// remove / at the beginning
    if (filePath) {
        return res.status(200).sendFile(filePath);
    } else
        next();
});
```
# Working Example

https://github.com/aliemre1990/aet-carrental