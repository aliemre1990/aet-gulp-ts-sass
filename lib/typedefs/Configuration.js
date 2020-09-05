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
 * @typedef {Object} ConfigurationVendorEntirelyCopiedReferencePaths
 * @property {string} standardRelativePath
 * @property {string} minRelativePath
 */

/**
 * @typedef {Object} ConfigurationVendor
 * @property {string} standardPath
 * @property {string} standardMapPath
 * @property {string} minPath
 * @property {string} minMapPath
 * @property {boolean} copyEntirely
 * @property {string} directoryPathThatWillBeCopiedEntirely
 * @property {ConfigurationVendorEntirelyCopiedReferencePaths[]} relativePathsOfReferencesThatCopiedEntirely
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
 * @property {string[]} staticScriptReferences Static script references
 * @property {string[]} staticStyleReferences Static style references
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
 * @property {string[]} staticScriptReferences
 * @property {string[]} staticStyleReferences
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
 * @property {string} publicDirectory
 * @property {string} defaultMarkupTemplate
 * @property {string} contentPlaceHolder
 * @property {string} moduleNameSeperator
 * @property {string[]} validStandaloneLibraryEntryFileNames
 * @property {string} moduleFileName
 * @property {string} rootModuleFileName
 */