/**
 * @type {Configuration}
 */
const config = {
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
    },
    layoutModules: {
    },
    vendorScripts: {

    },
    vendorStyles: {

    },
    contentPlaceHolder: '/////content/////',
    defaultMarkupTemplate: 'default.html',
    moduleNameSeperator: '_',
    validStandaloneLibraryEntryFileNames: ['index', 'main'],
    moduleFileName: 'module',
    rootModuleFileName: 'root'
}

module.exports = config;