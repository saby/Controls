/// <amd-module name="Controls/File/Attach/Container/SourceLazy" />
import SourceContainer = require("Controls/File/Attach/Container/Source");
import ISource = require("WS.Data/Source/ISource");
import Deferred = require("Core/Deferred");
import moduleStubs = require("Core/moduleStubs");

type Wrapper = {
    fileType: IFileDataConstructor;
}
type CreateWrappers = Wrapper & {
    source: Deferred<ISource>;
}
type LazyWrapper = Wrapper & {
    link: string;
    options: any;
}

/**
 * Фильтрует массив обёрток над ISource по типу файла
 * @param {Array<Wrapper>} array
 * @param {Controls/File/IFileData} file
 * @return {Wrapper}
 * @private
 * @author Заляев А.В.
 */
let instanceFilter = <T> (array: Array<Wrapper>, file) => {
    return array.filter((wrapper) => {
        return file instanceof wrapper.fileType;
    })[0];
};

/**
 * Класс для хранения экземпляров ISource по типам отправляеммых ресурсов
 * @class Controls/File/Attach/Container/SourceLazy
 * @extends Controls/File/Attach/Container/Source
 * @author Заляев А.В.
 * @private
 */
class SourceContainerLazy extends SourceContainer {
    private _lazyWrappers: Array<LazyWrapper>;
    private _createWrappers: Array<CreateWrappers>;

    constructor() {
        super();
        this._lazyWrappers = [];
        this._createWrappers = [];
    }

    /**
     * Ленивая егистрация источников данных для загрузки определённого типа ресурса
     * @param {Controls/File/IFileDataConstructor} fileType конструктор обёртки над ресурсом
     * @param {String} link Ссылка на источник данных
     * @param {*} options Параметры вызова конструктора обёртки
     * @see Controls/File/LocalFile
     * @see Controls/File/LocalFileLink
     * @see Controls/File/HttpFileLink
     */
    register(fileType: IFileDataConstructor, link: string, options: any): void {
        this._lazyWrappers.push({
            fileType,
            link,
            options
        })
    }
    /**
     * Зарегестрирован ли для текущего ресурса источник данных
     * @param {Controls/File/IFileData} file
     * @return {boolean}
     * @see Controls/File/LocalFile
     * @see Controls/File/LocalFileLink
     * @see Controls/File/HttpFileLink
     */
    has(file: IFileData): boolean {
        return super.has(file) || !!this._getLazyWrapper(file);
    }
    /**
     * Возвращает источник данных для ресурса
     * @param {Controls/File/IFileData} file
     * @return {Core/Deferred<ISource>}
     * @see Controls/File/LocalFile
     * @see Controls/File/LocalFileLink
     * @see Controls/File/HttpFileLink
     */
    get(file: IFileData): Deferred<ISource> {
        return super.get(file).addErrback((error) => {
            let lazyWrapper = this._getLazyWrapper(file);
            if (!lazyWrapper) {
                return error;
            }
            return this._createSource(lazyWrapper);
        });
    }
    /**
     * Возвращает список зарегестрированый обёрток
     * @return {Array<Controls/File/IFileDataConstructor>}
     * @see Controls/File/LocalFile
     * @see Controls/File/LocalFileLink
     * @see Controls/File/HttpFileLink
     */
    getRegisteredResource(): Array<IFileDataConstructor> {
        return super.getRegisteredResource().concat(this._lazyWrappers.map((wrapper) => {
            return wrapper.fileType;
        }));
    }
    private _getLazyWrapper(file: IFileData): LazyWrapper {
        return <LazyWrapper>instanceFilter(this._lazyWrappers, file);
    }
    private _createSource(wrapper: LazyWrapper): Deferred<ISource> {
        let createWrapper = <CreateWrappers>instanceFilter(this._createWrappers, wrapper.fileType);
        if (createWrapper) {
            return createWrapper.source.createDependent()
        }
        // Подгружаем и сохраняем инстанс ISource
        return moduleStubs.require(
            "optional!" + wrapper.link
        ).addCallback((modules) => {
            if (!modules[0]) {
                return Deferred.fail(`FileSource \"${wrapper.link}\" is not supported in this project`);
            }
            let source = new modules[0](wrapper.options);
            this.push(source, wrapper.fileType);
            return source;
        }).addBoth((result) => {
            // убираем найденную обёрку из списка ленивых
            this._lazyWrappers = this._lazyWrappers.filter((w) => {
                return w !== wrapper;
            });
            // так же чистим список ожидающх
            this._createWrappers = this._createWrappers.filter((w) => {
                return w !== createWrapper;
            });
            return result;
        });
    }
    destroy() {
        this._lazyWrappers = [];
        this._createWrappers = [];
        super.destroy();
    }
}

export = SourceContainerLazy;
