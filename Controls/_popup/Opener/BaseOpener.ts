import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import { IOpener, IBaseOpener, IBasePopupOptions } from 'Controls/_popup/interface/IBaseOpener';
import BaseOpenerUtil from 'Controls/_popup/Opener/BaseOpenerUtil';
import {loadModule, getModuleByName} from 'Controls/_popup/utils/moduleHelper';
import * as CoreMerge from 'Core/core-merge';
import * as randomId from 'Core/helpers/Number/randomId';
import * as Deferred from 'Core/Deferred';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {isVDOMTemplate} from 'Controls/_popup/utils/isVdomTemplate';
import {Logger} from 'UI/Utils';
import {DefaultOpenerFinder} from 'UI/Focus';
import Template = require('wml!Controls/_popup/Opener/BaseOpener');

/**
 * Base Popup opener
 * @class Controls/_popup/Opener/BaseOpener
 * @mixes Controls/_popup/interface/IBasePopupOptions
 * 
 * @private
 * @author Красильников А.С.
 */

export interface ILoadDependencies {
    template: Control;
    controller: Control;
}

export interface IBaseOpenerOptions extends IBasePopupOptions, IControlOptions {
    id?: string;
    closePopupBeforeUnmount?: boolean;
}

const OPEN_POPUP_DEBOUNCE_DELAY: number = 10;

class BaseOpener<TBaseOpenerOptions extends IBaseOpenerOptions = {}>
    extends Control<TBaseOpenerOptions> implements IOpener, IBaseOpener {

    readonly '[Controls/_popup/interface/IBaseOpener]': boolean;
    protected _template: TemplateFunction = Template;
    private _popupId: string = '';
    private _openerUnmounted: boolean = false;
    private _indicatorId: string = '';
    private _loadModulesPromise: Promise<ILoadDependencies|Error>;

    protected _beforeUnmount(): void {
        this._toggleIndicator(false);
        this._openerUnmounted = true;
        if (this._options.closePopupBeforeUnmount) {
            ManagerController.remove(this._popupId);
        }
    }
    open(popupOptions: TBaseOpenerOptions, controller: string): Promise<string | undefined> {
        return new Promise(((resolve) => {
            const cfg: TBaseOpenerOptions = this._getConfig(popupOptions);
            this._toggleIndicator(true, cfg);
            // TODO Compatible: Если Application не успел загрузить совместимость - грузим сами.
            if (cfg.isCompoundTemplate) {
                BaseOpenerUtil.loadCompatibleLayer(() => {
                    this._openPopup(cfg, controller);
                });
            } else {
                this._openPopup(cfg, controller);
            }

            // Удалить resultPromise после перевода страниц на application
            // Сейчас эта ветка нужно, чтобы запомнить ws3Action, который откроет окно на старой странице
            // На вдоме отдаем id сразу
            resolve(cfg.id);
        }));
    }

    /**
     * Closes a popup
     * @function Controls/_popup/Opener/BaseOpener#close
     */
    close(): void {
        const popupId: string = this._getCurrentPopupId();
        if (popupId) {
            (BaseOpener.closeDialog(popupId) as Promise<void>).then(() => {
                // Пока закрывали текущее окно, уже могли открыть новое с новым popupId.
                // Если popupId новый, то не нужно чистить старое значение
                if (!this.isOpened()) {
                    this._popupId = null;
                }
            });
        }
    }

    /**
     * State of whether the popup is open
     * @function Controls/_popup/Opener/BaseOpener#isOpened
     * @returns {Boolean} Is popup opened
     */
    isOpened(): boolean {
        return BaseOpener.isOpened(this._popupId);
    }

    private _openPopup(cfg: TBaseOpenerOptions, controller: string): Promise<string | undefined> {
        return new Promise(((resolve) => {
            const syncResult: ILoadDependencies = this._getModulesSync(cfg, controller);
            // Если зависимости загружены, действуем синхронно, без промисов
            if (syncResult) {
                this._loadDepsCallback(cfg, syncResult, resolve);
            } else {
                this._requireModules(cfg, controller).then((result: ILoadDependencies) => {
                    this._loadDepsCallback(cfg, result, resolve);
                }).catch(() => {
                    this._toggleIndicator(false);
                    resolve();
                });
            }
        }));
    }

    _loadDepsCallback(cfg: TBaseOpenerOptions, result: ILoadDependencies, resolve: Function): void {
        const showPopup = () => {
            cfg.id = this._getCurrentPopupId();
            BaseOpener.showDialog(result.template, cfg, result.controller, this).addCallback((id: string) => {
                this._popupId = id;
                resolve(id);
            });
        };

        // TODO: Compatible На старой странице могут несколько раз синхронно вызвать показ окна.
        // Пока не построился менеджер, то проверить открыто ли окно с таким id корректно нельзя, дожидаюсь менеджера.
        if (!isNewEnvironment()) {
            BaseOpenerUtil.getManagerWithCallback(showPopup);
        } else {
            showPopup();
        }
    }

    private _getModulesSync(config: TBaseOpenerOptions, controller: string): ILoadDependencies|null {
        const templateModule = getModuleByName(config.template);
        const controllerModule = getModuleByName(controller);
        if (templateModule && controllerModule) {
            return {
                template: templateModule,
                controller: controllerModule
            };
        }
        return null;
    }

    private _requireModules(cfg: TBaseOpenerOptions, controller: string): Promise<ILoadDependencies|Error> {
        if (!this._loadModulesPromise) {
            this._loadModulesPromise = BaseOpener.requireModules(cfg, controller).then((results: ILoadDependencies) => {
                this._loadModulesPromise = null;
                // todo https://online.sbis.ru/opendoc.html?guid=b954dff3-9aa5-4415-a9b2-7d3430bb20a5
                // If Opener was destroyed while template loading, then don't open popup.
                if (!this._openerUnmounted || this._options.closePopupBeforeUnmount === false) {
                    return results;
                }
                Logger.warn(`Controls/popup: Во время открытия окна с шаблоном ${cfg.template} задестроился opener`);
                throw new Error('Opener was destroyed');
            }).catch((error) => {
                this._loadModulesPromise = null;
                throw error;
            });
        }
        return this._loadModulesPromise;
    }

    protected _getConfig(popupOptions: IBaseOpenerOptions = {}): TBaseOpenerOptions {
        const baseConfig = BaseOpener.getConfig(this._options, popupOptions);
        // if the .opener property is not set, then set the defaultOpener or the current control
        if (!baseConfig.hasOwnProperty('opener')) {
            baseConfig.opener = DefaultOpenerFinder.find(this) || this;
        }

        if (ManagerController.isDestroying(this._getCurrentPopupId())) {
            this._popupId = null;
        }
        if (!this._popupId) {
            this._popupId = randomId('popup-');
        }
        baseConfig.id = this._popupId;

        this._prepareNotifyConfig(baseConfig);

        if (this._options.closePopupBeforeUnmount === false) {
            const message = 'Если при дестрое опенера окно не должно закрываться, используйте ' +
                'статический метод openPopup вместо опции closePopupBeforeUnmount';
            Logger.warn(` ${this._moduleName}: ${message}`);
        }

        return baseConfig;
    }

    private _prepareNotifyConfig(cfg: TBaseOpenerOptions): void {
        this._popupHandler = this._popupHandler.bind(this);

        // Handlers for popup events
        cfg._events = {
            onOpen: this._popupHandler,
            onResult: this._popupHandler,
            onClose: this._popupHandler
        };
    }

    private _popupHandler(eventName: string, args: any[]): void {
        // В ядре появилась новая фича, при дестрое контрола через несколько секунд очищаются все св-ва и методы
        // с инстанса. Если закроют окно после того, как открыватор был задестроен, то метода _notify уже не будет.
        if (!this._openerUnmounted) {
            // Trim the prefix "on" in the event name
            const event = eventName.substr(2).toLowerCase();

            if (event === 'close' || event === 'open') {
                this._toggleIndicator(false);
            }

            this._notify(event, args);
        }
    }

    private _toggleIndicator(visible: boolean, cfg?: TBaseOpenerOptions): void {
        if (!this._options.showIndicator) {
            return;
        }

        if (visible) {
            // if popup was opened, then don't show indicator, because we don't have async phase
            if (this._getCurrentPopupId()) {
                return;
            }
            this._indicatorId = this._notify('showIndicator',
                [BaseOpenerUtil.getIndicatorConfig(this._indicatorId, cfg)], {bubbling: true}) as string;
        } else if (this._indicatorId) {
            this._notify('hideIndicator', [this._indicatorId], {bubbling: true});
            this._indicatorId = null;
        }
    }

    protected _getCurrentPopupId(): string {
        if (this.isOpened()) {
            return this._popupId;
        }
        return null;
    }

    static showDialog(rootTpl: Control, cfg: IBaseOpenerOptions, controller: Control, opener?: BaseOpener) {
        const def = new Deferred();
        // protect against wrong config. Opener must be specified only on popupOptions.
        if (cfg?.templateOptions?.opener) {
            delete cfg.templateOptions.opener;
            Logger.error('Controls/popup: Опция opener не должна задаваться на templateOptions');
        }

        // Если открывают не через инстанс опенера (инстанс сейчас сам показываем индикатор, т.к. грузит зависимости)
        // И если опционально показ индикатора не отключен, то на момент построения окна покажем индикатор
        if (!cfg._events && cfg.showIndicator !== false) {
            // Если окно уже открыто или открывается, новые обработчики не создаем
            const popupItem = ManagerController.find(cfg.id);
            if (popupItem) {
                cfg._events = popupItem.popupOptions._events;
            } else {
                // Даже если окна с переданным id нет, синхронизатор иногда считает что такой контрол у него есть
                // (например окно с таким id только удалилось) и не вызовет на созданном окне фазу afterMount.
                // Из-за этого открываемый инидкатор не скроется. Чищу id, если он не актуальный.
                delete cfg.id;
                BaseOpenerUtil.showIndicator(cfg);
            }
        }

        if (!isNewEnvironment()) {
            BaseOpenerUtil.getManagerWithCallback(() => {
                // при открытии через стат. метод открыватора в верстке нет, нужно взять то что передали в опции
                // Если topPopup, то zIndex менеджер высчитает сам

                if (!cfg.zIndex) {
                    if (!cfg.topPopup) {
                        // На старой странице могут открывать на одном уровне 2 стековых окна.
                        // Последнее открытое окно должно быть выше предыдущего, для этого должно знать его zIndex.
                        // Данные хранятся в WM
                        const oldWindowManager = requirejs('Core/WindowManager');
                        const compatibleManagerWrapperName = 'Controls/Popup/Compatible/ManagerWrapper/Controller';
                        let managerWrapperMaxZIndex = 0;
                        // На старой странице может быть бутерброд из старых и новых окон. zIndex вдомных окон берем
                        // из менеджера совместимости. Ищем наибольший zIndex среди всех окон
                        if (requirejs.defined(compatibleManagerWrapperName)) {
                            managerWrapperMaxZIndex = requirejs(compatibleManagerWrapperName).default.getMaxZIndex();
                        }
                        const zIndexStep = 9;
                        const item = ManagerController.find(cfg.id);
                        // zindex окон, особенно на старой странице, никогда не обновлялся внутренними механизмами
                        // Если окно уже открыто, zindex не меняем
                        if (item) {
                            cfg.zIndex = item.popupOptions.zIndex;
                        } else if (oldWindowManager) {
                            // Убираем нотификационные окна из выборки старого менеджера
                            const baseOldZIndex = 1000;
                            const oldMaxZWindow = oldWindowManager.getMaxZWindow((control) => {
                                return control._options.isCompoundNotification !== true;
                            });
                            const oldMaxZIndex = oldMaxZWindow?.getZIndex() || baseOldZIndex;
                            const maxZIndex = Math.max(oldMaxZIndex, managerWrapperMaxZIndex);
                            cfg.zIndex = maxZIndex + zIndexStep;
                        }
                    }
                }
                if (!isVDOMTemplate(rootTpl)) {
                    requirejs(['Controls/compatiblePopup'], (compatiblePopup) => {
                        compatiblePopup.BaseOpener._prepareConfigForOldTemplate(cfg, rootTpl);
                        BaseOpener._openPopup(cfg, controller, def);
                    });
                } else {
                    BaseOpener._openPopup(cfg, controller, def);
                }
            });
        } else if (isVDOMTemplate(rootTpl) &&
            !(cfg.templateOptions && cfg.templateOptions._initCompoundArea)) {
            BaseOpenerUtil.getManagerWithCallback(() => {
                BaseOpener._openPopup(cfg, controller, def);
            });
        } else {
            requirejs(['Controls/compatiblePopup'], (compatiblePopup) => {
                compatiblePopup.BaseOpener._prepareConfigForOldTemplate(cfg, rootTpl);
                BaseOpener._openPopup(cfg, controller, def);
            });
        }
        return def;
    }

    static closeDialog(popupId: string): Promise<void> | void {
        return ManagerController.remove(popupId);
    }

    static isOpened(popupId: string): boolean {
        return !!ManagerController.find(popupId);
    }

    /**
     *
     * @param config
     * @param controller
     * @return {Promise.<{template: Function; controller: Function}>}
     * @private
     */
     static requireModules(config: IBaseOpenerOptions, controller: string): Promise<ILoadDependencies|Error> {
        return new Promise<ILoadDependencies|Error>((resolve, reject) => {
            Promise.all([
                BaseOpener.requireModule(config.template),
                BaseOpener.requireModule(controller)
            ]).then((result: [Control, Control]) => {
                resolve({
                    template: result[0],
                    controller: result[1]
                });
            }).catch((error: RequireError) => {
                // requirejs.onError бросает ошибку, из-за чего код ниже не выполняется.
                try {
                    requirejs.onError(error);
                } finally {
                    import('Controls/dataSource').then((dataSource) => {
                        dataSource.error.process({error}).then(() => {
                            Logger.error('Controls/popup' + ': ' + error.message, undefined, error);
                            reject(error);
                        });
                    });
                }
            });
        });
    }

    /**
     * @param {String | Function} module
     * @return {Promise.<Function>}
     * @private
     */
    static requireModule(module: string|Control): Promise<Control> {
        return loadModule(module);
    }

    static getConfig(options: IBaseOpenerOptions, popupOptions: IBaseOpenerOptions): IBaseOpenerOptions {
        // Все опции опенера брать нельзя, т.к. ядро добавляет свои опции опенеру (в режиме совместимости),
        // которые на окно попасть не должны.
        const baseConfig = {...options};
        const ignoreOptions = [
            'iWantBeWS3',
            '_$createdFromCode',
            '_logicParent',
            'theme',
            'vdomCORE',
            'name',
            'esc'
        ];

        for (let i = 0; i < ignoreOptions.length; i++) {
            const option = ignoreOptions[i];
            if (options[option] !== undefined) {
                delete baseConfig[option];
            }
        }

        const templateOptions = {};
        CoreMerge(templateOptions, baseConfig.templateOptions || {});
        CoreMerge(templateOptions, popupOptions.templateOptions || {}, {rec: false});

        const baseCfg = {...baseConfig, ...popupOptions, templateOptions};

        return baseCfg;
    }

    static _openPopup(cfg: IBaseOpenerOptions, controller: Control, def: Promise<string>): void {
        if (!ManagerController.isPopupCreating(cfg.id)) {
            cfg.id = ManagerController.show(cfg, controller);
        } else {
            ManagerController.updateOptionsAfterInitializing(cfg.id, cfg);
        }
        def.callback(cfg.id);
    }

    static getDefaultOptions(): IBaseOpenerOptions {
        return {
            showIndicator: true,
            closePopupBeforeUnmount: true
        };
    }

    // TODO Compatible
    static getManager(): Promise<void> {
        return BaseOpenerUtil.getManager();
    }
}

BaseOpener.util = BaseOpenerUtil; // for tests
export default BaseOpener;
