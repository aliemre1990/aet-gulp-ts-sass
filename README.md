# Description
This project is boilerplate for client side typescript projects. Unless you add or remove a typescript file it builds only required files. And it has a markup layouting system. Mathces your modules with corresponding layout modules by checking their file name. With configuration file you can configure different layouting chain. To understand better lets explain client configuration file.

## Configuration

Lets put an example configuration file and explain over it.

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
        'moduleC_moduleCA': {

        }
    },
    vendorScripts: {
        jquery: {
            standardPath: 'node_modules/jquery/dist/jquery.js',
            minPath: 'node_modules/jquery/dist/jquery.min.js',
        },
        'jquery-validation': {
            standardPath: 'node_modules/jquery-validation/dist/jquery.validate.js',
            minPath: 'node_modules/jquery-validation/dist/jquery.validate.min.js'
        },
        bootstrap: {
            standardPath: 'node_modules/bootstrap/dist/js/bootstrap.js',
            minPath: 'node_modules/bootstrap/dist/js/bootstrap.min.js',
            standardMapPath: 'node_modules/bootstrap/dist/js/bootstrap.js.map',
            minMapPath: 'node_modules/bootstrap/dist/js/bootstrap.min.js.map'
        },
        fontawesome: {
            standardPath: 'node_modules/@fortawesome/fontawesome-free/js/all.js',
            minPath: 'node_modules/@fortawesome/fontawesome-free/js/all.min.js',
        },
        'bootstrap-fileinput': {
            standardPath: 'node_modules/bootstrap-fileinput/js/fileinput.js',
            minPath: 'node_modules/bootstrap-fileinput/js/fileinput.min.js'
        },
        'bootstrap-fileinput-fas-theme': {
            standardPath: 'node_modules/bootstrap-fileinput/themes/fas/theme.js',
            standardPath: 'node_modules/bootstrap-fileinput/themes/fas/theme.min.js'
        },
        lodash: {
            standardPath: 'node_modules/lodash/lodash.js',
            minPath: 'node_modules/loadsh/lodash.min.js',
        },
        toastr: {
            standardPath: 'node_modules/toastr/toastr.js',
            standardMapPath: 'node_modules/toastr/build/toastr.js.map',
            minPath: 'node_modules/toastr/build/toastr.min.js'
        },
        moment: {
            standardPath: 'node_modules/moment/moment.js',
            minPath: 'node_modules/moment/min/moment.min.js'
        },
        handlebars: {
            standardpath: 'node_modules/handlebars/dist/handlebars.js',
            minPath: 'node_modules/handlebars/dist/handlebars.min.js'
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
        },
        'bootstrap-fileinput': {
            standardPath: 'node_modules/bootstrap-fileinput/css/fileinput.css',
            minPath: 'node_modules/bootstrap-fileinput/css/fileinput.min.css'
        },
        toastr: {
            standardPath: 'node_modules/toastr/build/toastr.css',
            minPath: 'node_modules/toastr/build/toastr.min.css'
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