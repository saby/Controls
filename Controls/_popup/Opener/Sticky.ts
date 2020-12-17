import BaseOpener, {IBaseOpenerOptions, ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import {Logger} from 'UI/Utils';
import {IStickyOpener, IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import {TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls/_popup/Opener/Sticky');
import {detection} from 'Env/Env';
import ManagerController from 'Controls/_popup/Manager/ManagerController';

const getStickyConfig = (config) => {
    config = config || {};
    config.isDefaultOpener = config.isDefaultOpener !== undefined ? config.isDefaultOpener : true;
    // Открывается всегда вдомным
    return config;
};

const POPUP_CONTROLLER = 'Controls/popupTemplate:StickyController';

interface IStickyOpenerOptions extends IStickyPopupOptions, IBaseOpenerOptions {}
/**
 * Контрол, открывающий всплывающее окно, которое позиционируется относительно вызывающего элемента.
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/sticky/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less переменные тем оформления}
 * Для открытия прилипающих окон из кода используйте {@link Controls/popup:StickyOpener}.
 *
 * @class Controls/_popup/Opener/Sticky
 * @extends Controls/_popup/Opener/BaseOpener
 * @mixes Controls/_popup/interface/IBaseOpener
 *
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/Opener/StickyPG
 * @public
 */
class Sticky extends BaseOpener<IStickyOpenerOptions> implements IStickyOpener {
    protected _template: TemplateFunction = Template;
    readonly '[Controls/_popup/interface/IStickyOpener]': boolean;
    private _actionOnScroll: string = 'none';

    open(popupOptions: IStickyPopupOptions): Promise<string | undefined> {
        return super.open(getStickyConfig(popupOptions), this._getController());
    }

    protected _getController(): string {
        return POPUP_CONTROLLER;
    }

    protected _getConfig(popupOptions: IStickyOpenerOptions = {}): IStickyOpenerOptions {
        const baseConfig = super._getConfig(popupOptions);
        if (baseConfig.actionOnScroll) {
            this._actionOnScroll = baseConfig.actionOnScroll;
        }
        return baseConfig;
    }

    protected _getIndicatorConfig(): void {
        // В случае со стики глобальный индикатор только мешает, к примеру в саггесте пока вводят в поле ввода
        // зовется открытие автодополнения. при открытии глобальный индикатор блокирует нажатие клавиш и не позволяет
        // вводить символы, пока саггест не откроется, хотя в этом случае блокировка не нужна.
        // По сути так со всеми окнами, открывающимися от таргета.
        const baseConfig = super._getIndicatorConfig();
        baseConfig.isGlobal = false;
        return baseConfig;
    }

    protected _scrollHandler(event: Event, scrollEvent: Event, initiator: string): void {
        if (this.isOpened() && event.type === 'scroll') {
            // Из-за флага listenAll на listener'e, подписка доходит до application'a всегда.
            // На ios при показе клавиатуры стреляет событие скролла, что приводит к вызову текущего обработчика
            // и закрытию окна. Для ios отключаю реакцию на скролл, событие скролла стрельнуло на body.
            if (detection.isMobileIOS && (scrollEvent.target === document.body || scrollEvent.target === document)) {
                return;
            } else if (this._actionOnScroll === 'close') {
                this.close();
            } else if (this._actionOnScroll === 'track') {
                this._updatePopup();
            }
        }
    }

    private _updatePopup(): void {
        ManagerController.popupUpdated(this._getCurrentPopupId());
    }

    static getDefaultOptions(): IStickyOpenerOptions {
        const baseConfig: IStickyPopupOptions = BaseOpener.getDefaultOptions();
        baseConfig.actionOnScroll = 'none';
        return baseConfig;
    }

    static openPopup(config: IStickyPopupOptions, popupController: string = POPUP_CONTROLLER): Promise<string> {
        return new Promise((resolve) => {
            const newCfg = getStickyConfig(config);
            if (!newCfg.hasOwnProperty('isHelper')) {
                Logger.warn('Controls/popup:Sticky: Для открытия прилипающих окон из кода используйте StickyOpener');
            }
            if (!newCfg.hasOwnProperty('opener')) {
                Logger.error('Controls/popup:Sticky: Для открытия окна через статический метод, обязательно нужно указать опцию opener');
            }
            BaseOpener.requireModules(newCfg, popupController).then((result: ILoadDependencies) => {
                BaseOpener.showDialog(result.template, newCfg, result.controller).then((popupId: string) => {
                    resolve(popupId);
                });
            });
        });
    }

    static closePopup(popupId: string): void {
        BaseOpener.closeDialog(popupId);
    }
}

export default Sticky;
