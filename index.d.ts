import StandaloneLibraryDependencyScriptFile from './lib/types/file/ScriptFile/StandaloneLibraryDependencyScriptFile';

type ModuleConfiguration = {
    substitutingModules: string[],
    layoutMoudle: string,
    markupTemplate: string,
    includeStandaloneScripts: string[],
    includeStandaloneStyles: string[],
    includeVendorScripts: string[],
    includeVendorStyles: string[],
    includeStaticScriptReferences: string[],
    includeStaticStyleReferences: string[],
    excludeStandaloneScripts: string[],
    excludeStandaloneStyles: string[],
    excludeVendorScripts: string[],
    excludeVendorStyles: string[],
    excludeStaticScriptReferences: string[],
    excludeStaticStyleReferences: string[]
};

type LayoutModuleConfiguration = {
    layoutMoudle: string,
    markupTemplate: string,
    includeStandaloneScripts: string[],
    includeStandaloneStyles: string[],
    includeVendorScripts: string[],
    includeVendorStyles: string[],
    includeStaticScriptReferences: string[],
    includeStaticStyleReferences: string[],
    excludeStandaloneScripts: string[],
    excludeStandaloneStyles: string[],
    excludeVendorScripts: string[],
    excludeVendorStyles: string[],
    excludeStaticScriptReferences: string[],
    excludeStaticStyleReferences: string[]
};

type Configuration = {
    projectType: 'javascript' | 'typescript',
    projectDirectory: string,
    sourceDirectories: {
        modules: string,
        layoutModules: string,
        standaloneStyleLibraries: string,
        standaloneScriptLibraries: string,
        libraryScripts: string,
        libraryStyles: string,
        markupTemplates: string
    },
    outputDirectories: {
        moduleScripts: string,
        layoutModuleScripts: string,
        vendorScripts: string,
        moduleStyles: string,
        layoutModuleStyles: string,
        vendorStyles: string,
        standaloneStyleLibraries: string,
        markupFiles: string
    },
    vendorScripts: { [key: string]: { sourceDirectory: string, relativePathsOfReferences: { standardPath: string, minPath: string }[] } },
    vendorStyles: { [key: string]: { sourceDirectory: string, relativePathsOfReferences: { standardPath: string, minPath: string }[] } },
    staticScriptReferences: { [key: string]: string },
    staticStyleReferences: { [key: string]: string },
    modules: {
        [key: string]: ModuleConfiguration;
    }
    layoutModules: {
        [key: string]: LayoutModuleConfiguration;
    }
    publicDirectory: string,
    defaultMarkupTemplate: string,
    contentPlaceHolder: string,
    moduleNameSeperator: string,
    validStandaloneLibraryEntryFileNames: string[],
    moduleFileName: string,
    rootModuleFileName: string,
    validMarkupExtensions: string[]
}

type module = {};

declare class Directory {
    constructor(directoryPath: string, configuration: Configuration);

    directoryPath: string;
    configuration: Configuration;
}

declare class ScriptDirectory extends Directory {
    constructor(directoryPath: string, configuration: Configuration);

    directoryPath: string;
    configuration: Configuration;
}

declare class VendorScriptDirectory extends ScriptDirectory {
    constructor(directoryPath: string, vendorName: string, relativePathsOfReferences: string[], configuration: Configuration);

    directoryPath: string;
    vendorName: string;
    relativePathsOfReferences: string[];
    configuration: Configuration;

    parentModuleMarkupFiles: ModuleMarkupFile[];

    getOutputPath(): string;
    transfer(): void;
}

declare class StyleDirectory extends Directory {
    constructor(directoryPath: string, configuration: Configuration);

    directoryPath: string;
    configuration: Configuration;
}

declare class VendorStyleDirectory extends StyleDirectory {
    constructor(directoryPath: string, vendorName: string, relativePathsOfReferences: string[], configuration: Configuration);

    directoryPath: string;
    vendorName: string;
    relativePathsOfReferences: string[];
    configuration: Configuration;

    getOutputPath(): string;
    transfer(): void;
}

declare class File {
    constructor(filePath: string, configuration: Configuration);

    filePath: string;
    configuration: Configuration;
}

declare class MarkupFile extends File {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    placeContent(contentToBePlaced: string): string;
    getContent(contentToBePlaced: string): string;
}

declare class LayoutModuleMarkupFile extends MarkupFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    layoutModuleScriptFile: LayoutModuleScriptFile;
    layoutModuleStyleFile: LayoutModuleStyleFile;
    childrenModuleMarkupFiles: ModuleMarkupFile[];
    childrenLayoutModuleMarkupFiles: LayoutModuleMarkupFile[];
    parentLayoutModuleMarkupFile: LayoutModuleMarkupFile;

    getModuleName(): string;
}

declare class ModuleMarkupFile extends MarkupFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    layoutModuleMarkupFile: LayoutModuleMarkupFile;
    templateMarkupFile: TemplateMarkupFile;
    moduleScriptFile: ModuleScriptFile;
    moduleStyleFile: ModuleStyleFile;
    vendorScriptDirectories: VendorScriptDirectory[];
    vendorStyleDirectories: VendorStyleDirectory[];
    staticStyleReferences: { name: string, url: string }[];
    staticScriptReferences: { name: string, url: string }[];
    standaloneLibraryScriptFiles: StandaloneLibraryEntryScriptFile[];
    standaloneLibraryStyleFiles: StandaloneLibraryEntryStyleFile[];

    getModuleName(): string;
    getOutputPath(): string;
    getFullContent(): string;
    create(): void;
    setReferences(content: string): string;
}

declare class TemplateMarkupFile extends MarkupFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;
}

declare class ScriptFile extends File {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    parentScriptFiles: ScriptFile[];
    childrenScriptFiles: ScriptFile[];

    findImportScriptFilePaths(): string[];
}

declare class LayoutModuleScriptFile extends ScriptFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    parentLayoutModuleMarkuoFile: LayoutModuleMarkupFile;

    getModuleName(): string;
    getOutputPath(): string;
    build(prodMode: boolean): void;
}

declare class LibraryScriptFile extends ScriptFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;
}

declare class ModuleScriptFile extends ScriptFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    parentModuleMarkupFile: ModuleMarkupFile;

    getModuleName(): string;
    getOutputPath(): string;
    build(prodMode: boolean): void;
}

declare class StandaloneLibraryDependencyScripFile extends ScriptFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    getLibraryName(): string;
}

declare class StandaloneLibraryEntryScriptFile extends ScriptFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    parentModuleMarkupFiles: ModuleMarkupFile[];

    getOutputPath(): string;
    getLibraryName(): string;
    build(prodMode: boolean): void;
}

declare class VendorScriptFile extends ScriptFile {
    constructor(filePath: string, vendorName: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;
    vendorName: string;

    parentModuleMarkupFiles: ModuleMarkupFile[];

    getOutputPath(): string;
    transfer(): void;
}

declare class StyleFile extends File {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    parentStyleFiles: StyleFile[];
    childrenStyleFiles: StyleFile[];

    findImportedStyleFilePaths(): string[];
}

declare class LayoutModuleStyleFile extends StyleFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    parentLayoutModuleMarkupFile: LayoutModuleMarkupFile;

    getModuleName(): string;
    getOutputPath(): string;
    build(prodMode: boolean): void;
}

declare class LibraryStyleFile extends StyleFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;
}

declare class ModuleStyleFile extends StyleFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    parentModuleMarkupFile: ModuleMarkupFile;

    getModuleName(): string;
    getOutputPath(): string;
    build(prodMode: boolean): void;
}

declare class StandaloneLibraryDependencyStyleFile extends StyleFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    getLibraryName(): string;
}

declare class StandaloneLibraryEntryStyleFile extends StyleFile {
    constructor(filePath: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    configuration: Configuration;
    prodMode: boolean;

    parentModuleMarkupFiles: ModuleMarkupFile[];

    getLibraryName(): string;
    getOuputPath(): string;
    build(prodMOde: boolean): void;
}

declare class VendorStyleFile extends StyleFile {
    constructor(filePath: string, vendorName: string, configuration: Configuration, prodMode: boolean);

    filePath: string;
    vendorName: string;
    configuration: Configuration;
    prodMode: boolean;

    parentModuleMarkupFiles: ModuleMarkupFile[];

    getOutputPath(): string;
    transfer(): void;
}

declare class ClientController {
    constructor(options: { prodMode: boolean, dontCopyVendor: boolean, configuration: Configuration });

    configuration: Configuration;
    moduleScriptFiles: ModuleScriptFile[];
    layoutModuleScriptFiles: LayoutModuleScriptFile[];
    libraryScriptFiles: LibraryScriptFile[];
    standaloneLibraryScriptFiles: Array<StandaloneLibraryEntryScriptFile | StandaloneLibraryDependencyScriptFile>;
    allScriptFiles: ScriptFile[];
    moduleStyleFiles: ModuleStyleFile[];
    layoutModuleStyleFiles: LayoutModuleStyleFile[];
    libraryStyleFiles: LibraryStyleFile[];
    standaloneLibraryStyleFiles: Array<StandaloneLibraryEntryStyleFile | StandaloneLibraryDependencyStyleFile>;
    allStyleFiles: StyleFile[];
    layoutModuleMarkupFiles: LayoutModuleMarkupFile[];
    moduleMarkupFiles: ModuleMarkupFile[];
    templateMarkupFiles: TemplateMarkupFile[];
    vendorScriptDirectories: VendorScriptDirectory[];
    vendorStyleDirectories: VendorStyleDirectory[];
    moduleConfigurationFiles: { [key: string]: ModuleConfiguration };
    layoutModuleConfigurationFiles: { [key: string]: LayoutModuleConfiguration };
    staticScriptReferences: { name: string, url: string }[];
    staticStyleReferences: { name: string, url: string }[];
    modules: { [key: string]: { markupFile: ModuleMarkupFile } };
    layoutModules: { [key: string]: { markupFile: LayoutModuleMarkupFile } };

    build(): void;
    watch(): void;
    construct(): void;
    getModuleNameFromRoute(route: string, params: any, queries: any): string;
    findMarkupFile(moduleName: string): ModuleMarkupFile;
    getModuleMarkupFileAutputPath(moduleName: string, absolute: boolean): string;
    setImportedChildren(file: ScriptFile | StyleFile, isStyle: boolean): void;
    findMostChildMarkupFilesRecursively(markupFile: ModuleMarkupFile | LayoutModuleMarkupFile, result: []): ModuleMarkupFile[];
    findMostParentsRecursively(file: ScriptFile | StyleFile, isStyle: boolean, previous: ScriptFile | StyleFile, result: []): ScriptFile[] | StyleFile[];
}

export { ClientController }

