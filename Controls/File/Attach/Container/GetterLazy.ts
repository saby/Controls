/// <amd-module name="Controls/File/Attach/Container/GetterLazy" />
// dependency for types
import {IResourceGetter, IResourceGetterConstructor} from "Controls/File/IResourceGetter";
// real dependency
import Deferred = require("Core/Deferred");
import moduleStubs = require("Core/moduleStubs");
import GetterContainer = require("Controls/File/Attach/Container/Getter");

/**
 * Контейнер для работы с различными реализациями {@link Controls/File/IResourceGetter},
 * позволяющий работать посредством ленивой подгрузки
 * @class Controls/File/Attach/Container/GetterLazy
 * @private
 * @see Controls/File/IResourceGetter
 * @author Заляев А.В.
 */
class GetterContainerLazy extends GetterContainer {
    /**
     * ссылки на экземпляры IResourceGetter для ленивой загрузки
     * @private
     */
    private _links: HashMap<string>;
    private _options: HashMap<any>;

    constructor() {
        super();
        this._links = Object.create(null);
        this._options = Object.create(null);
    }
    /**
     * Метод асинхронного получения экземпляра IResourceGetter
     * @param {String} name Имя модуля
     * @return {Core/Deferred<Controls/File/IResourceGetter>}
     * @see Controls/File/IResourceGetter#getType
     */
    get(name: string): Deferred<IResourceGetter> {
        return super.get(name).addErrback((error) => {
            if (!this._links[name]) {
                return error;
            }
            /*
             * Загружаем Модуль через optional! т.к. не все проекты включают в себя модули из репозитория СБИС Плагина
             */
            return moduleStubs.require(
                "optional!" + this._links[name]
            ).addCallback((modules: [IResourceGetterConstructor]) => {
                let ResourceGetter = modules[0];
                delete this._links[name];
                if (!ResourceGetter) {
                    return Deferred.fail(`ResourceGetter \"${name}\" is not supported in this project`);
                }
                let getter =  new ResourceGetter(this._options[name]);
                this.push(getter);
                return getter;
            });
        });
    }
    /**
     * Зарегестрирован ли источник ресурсов в контейнере
     * @param {String} name Имя источника
     * @return {Boolean}
     * @see Controls/File/IResourceGetter
     */
    has(name: string): boolean {
        return super.has(name) || !!this._links[name];
    }
    /**
     * Регистрация ссылки для последующей ленивой загрузки
     * @param {String} name Имя модуля
     * @param {String} link Ссылка на модуль
     * @param {} options Параметры для конструирования
     * @see Controls/File/IResourceGetter
     */
    register(name: string, link: string, options?): void {
        this._links[name] = link;
        this._options[name] = options;
    }
    destroy() {
        for (let name in this._links) {
            delete this._links[name];
            delete this._options[name]
        }
        super.destroy();
    }
}

export = GetterContainerLazy;
