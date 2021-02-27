# Install
npm install aet-gulp-ts-sass

# Changes
After version 2 there is some major changes:
- Coupled with handlebars and express to provide more advanced behaviour.
- Added automated handlebars rendering via provided adapter functions.
- Added visual components. An easier way to add componentized markup files which are handlebars partials actually, with their related script and style files to the modules.
- Markup templates now can be rendered via handlebars. Before they were static files. 
- Regular string replacement at layout modules is now replaced with handlebars rendering.
- HTML files no longer generated. They will be dynamically rendered at each request now.
I hope you find it usefull.

# Description
This library is both for client side typescript and javascript projects. It builds and watches your source files using gulp. Unless you add or remove a file it builds only required files in watch mode. If you add or remove a new file or change configuration file or change an independent module or layout module configuration file complete build process occurs. The client project consists of modules. Each module has its own script, style and markup file, and optionally a json file which represents module configuration object below. And there is also layout modules that enables to layout your modules. Layout modules have same file structure as modules. Your modules matched with corresponding layout modules by checking their file path. With configuration file you can configure different layouting chain. It alsa adds script and style tags automatically based on your configuration. Added script and style tags can be adjusted via configuration file. 

After version 2 there is some additions to these functionalities. You can specify expression postfixes for handlebars expressions via configuration file and attach adapters to expressions postfixed with these values. With these postfixes you no longer need to fetch values for each individual module file. With single function all of your modules can be rendered. Of course you can have data providers for individual modules for custom logic. 

If you want to have visual components which coupled with logic and styling you can define them under the components folder. Components have same naming convention with modules. Uses same name seperator. A component's name is composed of folderNamesJoinedWithNameSeperator, underScoreCharacter, componentPostfixDefinedInConfigurationFile respectively. Those should be registered as handlebars partials to your module markup files. After you have your component under components folder and wrote your components name in your module markup file it automatically renders your partial and adds related script and style files to the references.

In this project modules, layout modules and components (except there is no json configuration file for components) exists in this file structure:
```
{sourceDirectories.modules}
├── root.html
├── root.scss
├── root.ts
├── root.json(optional)
├── moduleA
│   ├── moduleA.html
│   ├── moduleA.scss
│   ├── moduleA.json(optional)
│   └── moduleA.ts
├── moduleB
│   │── moduleBA
│   │   ├── moduleBA.html
│   │   │── moduleBA.scss
│   │   │── moduleBA.json(optional)
│   │   └── moduleBA.ts
│   └── moduleBB
│       ├── moduleBB.html
│       │── moduleBB.scss
│       │── moduleBB.json(optional)
│       └── moduleBB.ts
└── ...
```


To understand this project better lets explain client configuration file.

## Configuration

Here is type definition for configuration
```
/**
 * @typedef {Object} ConfigurationSourceDirectories
 * @property {string} modules
 * @property {string} layoutModules
 * @property {string} standaloneStyleLibraries
 * @property {string} standaloneScriptLibraries
 * @property {string} libraryScripts
 * @property {string} libraryStyles
 * @property {string} markupTemplates
 * @property {string} components
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
 * @property {string} standaloneScriptLibraries
 * @property {string} markupFiles
 * @property {string} componentScripts
 * @property {string} componentStyles
 */

/**
 * @typedef {Object} RelativePathOfReference
 * @property {string} standardPath
 * @property {string} minPath
 */

/**
 * @typedef {Object} ConfigurationVendor
 * @property {string} sourceDirectory
 * @property {RelativePathOfReference[]} relativePathsOfReferences
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
 * @property {string[]} includeStaticScriptReferences
 * @property {string[]} excludeStaticScriptReferences
 * @property {string[]} includeStaticStyleReferences
 * @property {string[]} excludeStaticStyleReferences
 */

/**
 * @typedef {Object} ConfigurationLayoutModule
 * @property {string} layoutModule
 * @property {string} markupTemplate
 * @property {string[]} includeStandaloneStyles
 * @property {string[]} includeStandaloneScripts
 * @property {string[]} includeVendorScripts
 * @property {string[]} includeVendorStyles
 * @property {string[]} excludeStandaloneStyles
 * @property {string[]} excludeStandaloneScripts
 * @property {string[]} excludeVendorScripts
 * @property {string[]} excludeVendorStyles
 * @property {string[]} includeStaticScriptReferences
 * @property {string[]} excludeStaticScriptReferences
 * @property {string[]} includeStaticStyleReferences
 * @property {string[]} excludeStaticStyleReferences
 */

/**
 * Represents configuration object for build process.
 * @typedef {Object} Configuration
 * @property {'typescript'|'javascript'} projectType
 * @property {string} projectDirectory
 * @property {ConfigurationSourceDirectories} sourceDirectories
 * @property {ConfigurationOutputDirectories} outputDirectories
 * @property {ConfigurationReferenceParentPaths} referenceParentPaths
 * @property {Object.<string,ConfigurationVendor} vendorScripts
 * @property {Object.<string,ConfigurationVendor>} vendorStyles
 * @property {Object.<string,string>} staticScriptReferences
 * @property {Object.<string,string>} staticStyleReferences
 * @property {Object.<string,ConfigurationModule>} modules
 * @property {Object.<string,ConfigurationLayoutModule>} layoutModules
 * @property {string} publicDirectory
 * @property {string} defaultMarkupTemplate
 * @property {string} nameSeperator
 * @property {string[]} validStandaloneLibraryEntryFileNames
 * @property {string} moduleFileName
 * @property {string} rootModuleFileName
 * @property {string[]} validMarkupExtensions
 * @property {string} contentExpression
 * @property {string} scriptExpression
 * @property {string} styleExpression
 * @property {string} componentPostFix
 * @property {Array<postFix:string,isRecursive:boolean>} expressions
 */
```

And here is example configuration object.
```
{
    projectType: 'javascript',
    projectDirectory: 'client-source',
    sourceDirectories: {
        modules: 'modules',
        layoutModules: 'layout-modules',
        libraryScripts: 'library-scripts',
        libraryStyles: 'library-styles',
        standaloneStyleLibraries: 'standalone-style-libraries',
        standaloneScriptLibraries: 'standalone-script-libraries',
        markupTemplates: 'markup-templates',
        components: 'components'
    },
    publicDirectory: 'public',
    outputDirectories: {
        markupFiles: 'build/markup-files',
        moduleScripts: 'build/module-scripts',
        moduleStyles: 'build/module-styles',
        layoutModuleScripts: 'build/layout-module-scripts',
        layoutModuleStyles: 'build/layout-module-styles',
        standaloneStyleLibraries: 'build/standalone-style-libraries',
        standaloneScriptLibraries: 'build/standalone-script-libraries',
        vendorScripts: 'build/vendor-scripts',
        vendorStyles: 'build/vendor-styles',
        componentStyles: 'build/component-styles',
        componentScripts: 'build/component-scripts'
    },
    vendorScripts: {
        jquery: {
            sourceDirectory: 'node_modules/jquery',
            relativePathsOfReferences: [{ standardPath: 'dist/jquery.js', minPath: 'dist/jquery.min.js' }]
        },
        fontawesome: {
            sourceDirectory: 'node_modules/@fortawesome',
            relativePathsOfReferences: [{ standardPath: 'fontawesome-free/js/all.js', minPath: 'fontawesome-free/js/all.min.js' }]
        },
        lodash: {
            sourceDirectory: 'node_modules/lodash',
            relativePathsOfReferences: [{ standardPath: 'lodash.js', minPath: 'lodash.min.js' }]
        },
        toastr: {
            sourceDirectory: 'node_modules/toastr',
            relativePathsOfReferences: [{ standardPath: 'toastr.js', minPath: 'build/toastr.min.js' }]
        },
        moment: {
            sourceDirectory: 'node_modules/moment',
            relativePathsOfReferences: [{ standardPath: 'moment.js', minPath: 'min/moment.min.js' }]
        },
        handlebars: {
            sourceDirectory: 'node_modules/handlebars',
            relativePathsOfReferences: [{ standardPath: 'dist/handlebars.js', minPath: 'dist/handlebars.min.js' }]
        },
        axios: {
            sourceDirectory: 'node_modules/axios',
            relativePathsOfReferences: [{ standardPath: 'dist/axios.js', minPath: 'dist/axios.min.js' }]
        },
        'jquery-ui': {
            sourceDirectory: 'node_modules/jquery-ui-dist',
            relativePathsOfReferences: [{ standardPath: 'jquery-ui.js', minPath: 'jquery-ui.min.js' }]
        },
        'ckeditor4': {
            sourceDirectory: 'node_modules/ckeditor4',
            relativePathsOfReferences: [{ standardPath: 'ckeditor.js' }]
        },
        cleave: {
            sourceDirectory: 'node_modules/cleave.js',
            relativePathsOfReferences: [{ standardPath: 'dist/cleave.js', minPath: 'dist/cleave.min.js' }]
        },
        'jquery-mask-plugin': {
            sourceDirectory: 'node_modules/jquery-mask-plugin',
            relativePathsOfReferences: [{ standardPath: 'dist/jquery.mask.js', minPath: 'dist/jquery.mask.min.js' }]
        }
    },
    vendorStyles: {
        'jquery-ui': {
            sourceDirectory: 'node_modules/jquery-ui-dist',
            relativePathsOfReferences: [{ standardPath: 'jquery-ui.css', minPath: 'jquery-ui.min.css' }]
        }
    },
    defaultMarkupTemplate: 'default.hbs',
    nameSeperator: '_',
    validStandaloneLibraryEntryFileNames: ['index', 'main'],
    moduleFileName: 'module',
    rootModuleFileName: 'root',
    validMarkupExtensions: ['.html', '.hbs'],
    contentExpression: 'content',
    scriptExpression: 'script',
    styleExpression: 'style',
    componentPostFix: 'AppComponent',
    expressions: [
        { postFix: 'AppText', isRecursive: false },
        { postFix: 'AppMessage', isRecursive: false },
        { postFix: 'AppLink', isRecursive: false },
        { postFix: 'AppContent', isRecursive: true }
    ]
}
```
### projectType
Type of project. 'typescript' or 'javascript'. Defaults to 'typescript'.
### projectDirectory
Project's root directory.
### Source Directories
You put your source files in theese directories.
* **modules:**   This directory is where the your modules reside. Entire client project exists as modules. Each module has its own markup, style and script file.
* **layoutModules:** Where layout modules reside. Layout module file structure is same as modules.
* **libraryScripts:** Your imported script files that are used by module or layout module script files.
* **libraryStyles:** Your imported style files that are used by module or layout module style files.
* **standaloneStyleLibraries:** Your standalone styles. They will be referenced independently on markup files.
* **standaloneScriptLibraries:**  Your standalone scripts. They will be referenced independently on markup files.
* **markupTemplates:** Where your html markup boilerplate files reside. Theese files are empty html templates. Usually you will have a single file here.
* **components:** Your component files. Have same file structure as modules.


## publicDirectory
Where your public files reside. The processed files will be in this directory.

## outputDirectories
The paths where your built files will reside. These directories will be in publicDirectory.
* **markupFiles:** Where your built markup files reside.
* **moduleScripts:** Where your built module script files reside. 
* **moduleStyles:**
* **layoutModuleScripts:**
* **layoutModuleStyles:**
* **standaloneStyleLibraries:**
* **vendorScripts:**
* **vendorStyles:** 
* **componentStyles:**
* **componentScripts:**

## moduleConfiguration
Module configurations. Keys will be each modules name. A modules name is determined by its folder name relative from module input directory. For example a module inside a folder '{process.cwd()}/{sourceDirectories.modules}/moduleA/moduleAB and let name seperator be '_' then module name will be 'moduleA_moduleAB'. Module in the root folder is named with value of 'rootModuleFileName' property. For configuring root module we will use this name as key.

* **substitutingModules:** If you want to use a module in place of other modules use this property. Its good at situations like using same page for adding and editing.
* **layoutModule:** It's used to set layoutModule for module explicitly. By default layout module is determined by matching the module path with layout module path.
* **markupTemplate:** Used to set modules' markup template file explicitly. By default value of default markup template property is used.
* **includeStandaloneStyles:** Used to determine which standalone styles will be added to the module. If this property set, only values in this property will be referenced.
* **includeStandaloneScripts:**
* **includeVendorScripts:** If this property set only specified vendor scripts will be referenced by module.
* **includeVendorStyles:** Same as includeVendorScripts.
* **excludeStandaloneStyles:** If this property set, specified styles will be subtracted from all standalone styles and will be referenced.
* **excludeStandaloneScripts:**
* **excludeVendorScripts:** Same logic as exclude standalone styles
* **excludeVendorStyles:** Same...
* **include/exclude-staticStyleReferences&include/exclude-staticScriptReferences:** Some script and style files might needed to referenced statically. Or you may want to add references from web. Or you may want to copy an vendor to public folder and add reference to there.

## layoutModuleConfiguration
Same as module configuration.

By default unless you explicitly set layout modules will be determined by matching module path with layout module path. If you have only root layout module your all modules will use this. But for example you have layout module named 'vehicle' and modules named 'vehicle_add', 'vehicle_edit' they will use vehicle layout module. And vehicle layout module will use root layout module. Module chain will be like 'root>vehicle>vehicle_add' and 'root>vehicle>vehicle_edit'. You can change layout chain by explicitly setting layout module configuration's layoutModule property. Until now i didn't faced such scenario but it's possible. 

Also including and excludeing scripts and styles may confuse you because they exists at modules and layout modules same time. The lower in the chain overridies the higher ones. For example if i use include/exclude properties in 'vehicle_edit' module it overrides if they exist in 'vehicle' layout module. Same is valid for markup template property. Lower in the chain overrides if exists in higher in the chain. Same logic applies in staticStyle&ScriptReferences property.




## vendorScripts
Used to define your vendor script libraries.

## vendorStyles
Used to define your vendor style libraries.

## defaultMarkupTemplate
Default empty html file.

## nameSeperator
Seperator character used in module and component names. 

## validStandaloneLibraryEntryFileNames
If your standalone library resides in folder, than main files must be one of theese.

## moduleFileName
A module file, may have containing folder's name or this name. 'vehicle_edit'-> edit.html or {this}.html

## rootModuleFileName
File name used in root module files.

## validMarkupExtensions
Extensions used in markup files. Defaults to ['.html'].

## contentExpression
Expression used in layout modules for module content placemenet. Must be html unescaped expression. For example if your content expression is 'content' then you should place {{{content}}} on where you want your module content to be placed.

## scriptExpression&styleExpression
Expression names used in template markup files to place script and style references. 

## componentPostFix 
Postfix used in partial expressions. An expression for component named inputs_my-input and with postfix of 'Component' should be {{>inputs_my-input_Component}}

## expressions
This property is used to define postFixes used in expressions. Value is an object that contains postfix value and a boolean value that indicate whether the expression should be traversed recursively.

