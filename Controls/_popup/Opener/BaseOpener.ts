import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import { IOpener, IBaseOpener, IBasePopupOptions } from 'Controls/_popup/interface/IBaseOpener';
import * as CoreMerge from 'Core/core-merge';
import * as randomId from 'Core/helpers/Number/randomId';
import * as Deferred from 'Core/Deferred';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {parse as parserLib, load} from 'Core/library';
import {Logger} from 'UI/Utils';
import { DefaultOpenerFinder } from 'UI/Focus';
import * as isEmpty from 'Core/helpers/Object/isEmpty';
import rk = require('i18n!Controls');
import Template = require('wml!Controls/_popup/Opener/BaseOpener');

/**
 * Base Popup opener
 * @category Popup
 * @class Controls/_popup/Opener/BaseOpener
 * @mixes Controls/_popup/interface/IBaseOpener
 * @control
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
let ManagerWrapperCreatingPromise; // TODO: Compatible

class BaseOpener<TBaseOpenerOptions extends IBaseOpenerOptions = {}>
    extends Control<TBaseOpenerOptions> implements IOpener, IBaseOpener {

    readonly '[Controls/_popup/interface/IBaseOpener]': boolean;
    protected _template: TemplateFunction = Template;
    private _actionOnScroll: string = 'none';
    private _popupId: string = '';
    private _indicatorId: string = '';
    private _loadModulesPromise: Promise<ILoadDependencies|Error>;
    private _openerUpdateCallback: Function;
    private _openPopupTimerId: number;

    protected _afterMount(): void {
        this._openerUpdateCallback = this._updatePopup.bind(this);
        this._notify('registerOpenerUpdateCallback', [this._openerUpdateCallback], {bubbling: true});
    }

    protected _beforeUnmount(): void {
        this._notify('unregisterOpenerUpdateCallback', [this._openerUpdateCallback], {bubbling: true});
        this._toggleIndicator(false);
        if (this._options.closePopupBeforeUnmount) {
            if (this._openPopupTimerId) {
                clearTimeout(this._openPopupTimerId);
                this._openPopupTimerId = null;
            }
            ManagerController.remove(this._popupId);
        }
    }
    open(popupOptions: TBaseOpenerOptions, controller: string): Promise<string | undefined> {
        return new Promise(((resolve) => {
            this._toggleIndicator(true);
            const cfg: TBaseOpenerOptions = this._getConfig(popupOptions || {});
            // TODO Compatible: Если Application не успел загрузить совместимость - грузим сами.
            if (cfg.isCompoundTemplate) {
                this._compatibleOpen(cfg, controller);
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
                this._popupId = null;
            });
        }
    }

    /**
     * State of whether the popup is open
     * @function Controls/_popup/Opener/BaseOpener#isOpened
     * @returns {Boolean} Is popup opened
     */
    isOpened(): boolean {
        return !!ManagerController.find(this._getCurrentPopupId());
    }

    /* Защита от множественного вызова. собираем все синхронные вызовы, открываем окно с последним конфигом */
    private _showDialog(template: Control, cfg: IBasePopupOptions, controller: Control, resolve: Function): void {
        if (this._openPopupTimerId) {
            clearTimeout(this._openPopupTimerId);
        }
        this._openPopupTimerId = setTimeout(() => {
            this._openPopupTimerId = null;
            BaseOpener.showDialog(template, cfg, controller, this).addCallback((id: string) => {
                this._popupId = id;
                resolve(id);
            });
        }, OPEN_POPUP_DEBOUNCE_DELAY);
    }

    private _openPopup(cfg: TBaseOpenerOptions, controller: string): Promise<string | undefined> {
        return new Promise(((resolve) => {
            this._requireModules(cfg, controller).then((result: ILoadDependencies) => {
                cfg.id = this._getCurrentPopupId();
                this._showDialog(result.template, cfg, result.controller, resolve);
            }).catch(() => {
                this._toggleIndicator(false);
                resolve();
            });
        }));
    }

    private _requireModules(cfg: TBaseOpenerOptions, controller: string): Promise<ILoadDependencies|Error> {
        if (!this._loadModulesPromise) {
            this._loadModulesPromise = BaseOpener.requireModules(cfg, controller).then((results: ILoadDependencies) => {
                this._loadModulesPromise = null;
                // todo https://online.sbis.ru/opendoc.html?guid=b954dff3-9aa5-4415-a9b2-7d3430bb20a5
                // If Opener was destroyed while template loading, then don't open popup.
                if (!this._destroyed || this._options.closePopupBeforeUnmount === false) {
                    return results;
                }
                return new Error('Opener was destroyed');
            }).catch((error) => {
                this._loadModulesPromise = null;
                throw error;
            });
        }
        return this._loadModulesPromise;
    }

    private _getConfig(popupOptions: IBaseOpenerOptions = {}): TBaseOpenerOptions {
        const baseConfig = BaseOpener.getConfig(this._options, popupOptions);
        // if the .opener property is not set, then set the defaultOpener or the current control
        if (!baseConfig.hasOwnProperty('opener')) {
            baseConfig.opener = DefaultOpenerFinder.find(this) || this;
        }
        if (baseConfig.actionOnScroll) {
            this._actionOnScroll = baseConfig.actionOnScroll;
        }

        if (this._isPopupDestroyed()) {
            this._popupId = null;
        }
        if (!this._popupId) {
            this._popupId = randomId('popup-');
        }
        baseConfig.id = this._popupId;

        this._prepareNotifyConfig(baseConfig);
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
        // Trim the prefix "on" in the event name
        const event = eventName.substr(2).toLowerCase();

        if (event === 'close' || event === 'open') {
            this._toggleIndicator(false);
        }

        this._notify(event, args);
    }

    private _toggleIndicator(visible: boolean): void {
        if (visible) {
            // if popup was opened, then don't show indicator, because we don't have async phase
            if (this._getCurrentPopupId()) {
                return;
            }
            this._indicatorId = this._notify('showIndicator',
                [this._getIndicatorConfig()], {bubbling: true}) as string;
        } else if (this._indicatorId) {
            this._notify('hideIndicator', [this._indicatorId], {bubbling: true});
            this._indicatorId = null;
        }
    }

    protected _getIndicatorConfig() {
        return {
            id: this._indicatorId,
            message: rk('Загрузка'),
            delay: 2000 // by standart
        };
    }

    protected _scrollHandler(event: Event): void {
        if (this.isOpened() && event.type === 'scroll') {
            if (this._actionOnScroll === 'close') {
                this._closeOnTargetScroll();
            } else if (this._actionOnScroll === 'track') {
                this._updatePopup();
            }
        }
    }

    private _updatePopup(): void {
        ManagerController.popupUpdated(this._getCurrentPopupId());
    }

    private _closeOnTargetScroll(): void {
        this.close();
    }

    private _getCurrentPopupId(): string {
        return this._popupId;
    }

    private _isPopupDestroyed(): boolean {
        const popupItem = ManagerController.find(this._getCurrentPopupId());
        return popupItem &&
            (popupItem.popupState === popupItem.controller.POPUP_STATE_DESTROYING ||
             popupItem.popupState === popupItem.controller.POPUP_STATE_DESTROYED ||
             popupItem.startRemove === true);
    }

    private _compatibleOpen(cfg: TBaseOpenerOptions, controller: string): Promise<string | undefined> {
        return new Promise((resolve) => {
            requirejs(['Lib/Control/LayerCompatible/LayerCompatible'], (Layer) => {
                Layer.load().addCallback(() => {
                    this._openPopup(cfg, controller).then((popupId: string) => resolve(popupId));
                });
            });
        });
    }

    static showDialog(rootTpl: Control, cfg: IBaseOpenerOptions, controller: Control, opener?: BaseOpener) {
        const def = new Deferred();
        if (!BaseOpener.isNewEnvironment()) {
            BaseOpener.getManager().then(() => {
                BaseOpener.getZIndexUtil().addCallback((getZIndex) => {
                    const popupOpener = opener || cfg.opener;
                    if (popupOpener) {
                        // при открытии через стат. метод открыватора в верстке нет, нужно взять то что передали в опции
                        cfg.zIndex = cfg.zIndex || getZIndex(popupOpener);
                        cfg.theme = popupOpener._options.theme;
                    }
                    if (!BaseOpener.isVDOMTemplate(rootTpl)) {
                        requirejs(['Controls/compatiblePopup'], (compatiblePopup) => {
                            compatiblePopup.BaseOpener._prepareConfigForOldTemplate(cfg, rootTpl);
                            BaseOpener._openPopup(cfg, controller, def);
                        });
                    } else {
                        BaseOpener._openPopup(cfg, controller, def);
                    }
                });
            });
        } else if (BaseOpener.isVDOMTemplate(rootTpl) && !(cfg.templateOptions && cfg.templateOptions._initCompoundArea)) {
            BaseOpener.getManager().then(() => {
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
                requirejs.onError(error);
                Logger.error('Controls/popup' + ': ' + error.message, undefined, error);
                reject(error);
            });
        });
    }

    /**
     * @param {String | Function} module
     * @return {Promise.<Function>}
     * @private
     */
    static requireModule(module: string|Control): Promise<Control> {
        if (typeof module === 'string') {
            const parsedModule = parserLib(module);
            const isDefined = require.defined(parsedModule.name);
            let mod = isDefined && require(parsedModule.name);
            // Если кто-то позвал загрузку модуля, но она еще не отстрелила, require может вернуть пустой объект
            if (!isDefined || isEmpty(mod)) {
                return load(module);
            }
            if (parsedModule.path.length) {
                parsedModule.path.forEach((property) => {
                    if (mod && typeof mod === 'object' && property in mod) {
                        mod = mod[property];
                    }
                });
            }

            // It's not a library notation so mind the default export for ES6 modules
            if (mod && mod.__esModule && mod.default) {
                mod = mod.default;
            }
            return Promise.resolve(mod);
        }
        return Promise.resolve(module);
    }

    static getConfig(options: IBaseOpenerOptions, popupOptions: IBaseOpenerOptions): IBaseOpenerOptions {
        // todo https://online.sbis.ru/opendoc.html?guid=770587ec-2016-4496-bc14-14787eb8e713
        // Возвращаю правки.usedOptions - набор опций, которые мы берем с opener'a (с opener._options) и передаем в окно
        // Все опции опенера брать нельзя,т.к. ядро добавляет свои опции опенеру (в режиме совместимости),
        // которые на окно попасть не должны.
        const baseConfig = {};
        const usedOptions = [
            'id',
            'closeByExternalClick',
            'isCompoundTemplate',
            'eventHandlers',
            'autoCloseOnHide',
            'autoClose',
            'type',
            'style',
            'message',
            'details',
            'yesCaption',
            'noCaption',
            'cancelCaption',
            'okCaption',
            'autofocus',
            'isModal',
            'modal',
            'closeOnOutsideClick',
            'closeOnDeactivated',
            'closeOnTargetScroll',
            'className',
            'template',
            'templateOptions',
            'minWidth',
            'maxWidth',
            'maximize',
            'width',
            'propStorageId',
            'resizable',
            'top',
            'autoHide',
            'left',
            'maxHeight',
            'minHeight',
            'draggable',
            'horizontalAlign',
            'verticalAlign',
            'offset',
            'direction',
            'corner',
            'targetPoint',
            'targetTracking',
            'locationStrategy',
            'fittingMode',
            'actionOnScroll',
            'isWS3Compatible'
        ];

        // merge _options to popupOptions
        for (let i = 0; i < usedOptions.length; i++) {
            const option = usedOptions[i];
            if (options[option] !== undefined) {
                baseConfig[option] = options[option];
            }
        }

        delete baseConfig.theme; // todo fix?

        const templateOptions = {};
        CoreMerge(templateOptions, baseConfig.templateOptions || {});
        CoreMerge(templateOptions, popupOptions.templateOptions || {}, {rec: false});

        const baseCfg = {...baseConfig, ...popupOptions, templateOptions};

        // protect against wrong config. Opener must be specified only on popupOptions.
        if (baseCfg.templateOptions) {
            delete baseCfg.templateOptions.opener;
        }

        if (baseCfg.hasOwnProperty('verticalAlign') || baseCfg.hasOwnProperty('horizontalAlign')) {
            Logger.warn('Controls/popup:Sticky : Используются устаревшие опции verticalAlign и horizontalAlign, используйте опции offset и direction');
        }

        return baseCfg;
    }

    static getZIndexUtil() {
        const deferred = new Deferred();
        const module = 'Controls/Utils/getZIndex';
        if (requirejs.defined(module)) {
            return deferred.callback(requirejs(module));
        }
        requirejs([module], (getZIndex) => {
            return deferred.callback(getZIndex);
        });
        return deferred;
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
            closePopupBeforeUnmount: true,
            actionOnScroll: 'none'
        };
    }

     // TODO Compatible
    static isVDOMTemplate(templateClass: Control | TemplateFunction): boolean {
        return !!(templateClass.prototype && templateClass.prototype._template) ||
            !!templateClass.stable || !!(templateClass[0] && templateClass[0].func);
    }

    // TODO Compatible
    static isNewEnvironment(): boolean {
        return isNewEnvironment();
    }

    // TODO Compatible
    static getManager(): Promise<void> {
        if (!ManagerWrapperCreatingPromise) {
            if (!isNewEnvironment()) {
                const managerContainer = document.createElement('div');
                managerContainer.classList.add('controls-PopupContainer');
                document.body.insertBefore(managerContainer, document.body.firstChild);

                ManagerWrapperCreatingPromise = new Promise((resolve) => {
                    require(['Core/Creator', 'Controls/compatiblePopup'], (Creator, compatiblePopup) => {
                        Creator(compatiblePopup.ManagerWrapper, {}, managerContainer).then(resolve);
                    });
                });
            } else {
                // Защита от случаев, когда позвали открытие окна до полного построения страницы
                if (ManagerController.getManager()) {
                    return Promise.resolve();
                } else {
                    ManagerWrapperCreatingPromise = new Promise((resolve) => {
                        const intervalDelay: number = 20;
                        const intervalId: number = setInterval(() => {
                            if (ManagerController.getManager()) {
                                clearInterval(intervalId);
                                resolve();
                            }
                        }, intervalDelay);
                    });
                }
            }
        }

        return ManagerWrapperCreatingPromise;
    }
}

export default BaseOpener;
