import {Control, TemplateFunction} from 'UI/Base';
import InfoBoxOpener from 'Controls/_popup/Opener/InfoBox';
import {IInfoBox, IInfoBoxOptions} from 'Controls/_popup/interface/IInfoBox';
import {IInfoBoxPopupOptions} from 'Controls/_popup/interface/IInfoBoxOpener';
import {TouchContextField} from 'Controls/context';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor} from 'Types/entity';
import * as getZIndex from 'Controls/Utils/getZIndex';
import template = require('wml!Controls/_popup/InfoBox/InfoBox');

/**
 * Контрол, отображающий всплывающую подсказку относительно указанного элемента.
 * Всплывающую подсказку вызывает событие, указанное в опции trigger.
 * В один момент времени на странице может отображаться только одна всплывающая подсказка.
 * @remark
 * Подробнее о работе с контролом читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/infobox/ здесь}.
 * См. <a href="/materials/demo-ws4-infobox">демо-пример</a>.
 * @class Controls/_popup/InfoBox
 * @implements Controls/_popup/interface/IInfoBox
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/InfoBox/InfoBoxPG
 */

const CALM_DELAY: number = 100; // During what time should not move the mouse to start opening the popup.

interface IInfoBoxTouchContext {
    isTouch: {
        isTouch: boolean;
    };
}

class InfoboxTarget extends Control<IInfoBoxOptions> implements IInfoBox {
    readonly '[Controls/_popup/interface/IInfoBox]': boolean;

    _template: TemplateFunction = template;
    _isNewEnvironment: Function = InfoBoxOpener.isNewEnvironment;
    _openId: number;
    _waitTimer: number;
    _closeId: number;
    _opened: boolean;
    _children: {
        infoBoxOpener: InfoBoxOpener
    };

    protected _beforeMount(options: IInfoBoxOptions): void {
        this._resultHandler = this._resultHandler.bind(this);
        this._closeHandler = this._closeHandler.bind(this);
    }

    protected _beforeUnmount(): void {
        this._clearWaitTimer();
        if (this._opened) {
            this.close();
        }
        this._resetTimeOut();
    }

    open(): void {
        const config: IInfoBoxPopupOptions = this._getConfig();

        if (this._isNewEnvironment()) {
            this._notify('openInfoBox', [config], {bubbling: true});
        } else {
            // To place zIndex in the old environment
            config.zIndex = getZIndex(this._children.infoBoxOpener);
            this._children.infoBoxOpener.open(config);
        }

        this._resetTimeOut();
        this._opened = true;
        this._forceUpdate();
    }

    private _getConfig(): IInfoBoxPopupOptions {
        return {
            opener: this,
            target: this._container,
            template: this._options.template,
            position: this._options.position,
            targetSide: this._options.targetSide,
            alignment: this._options.alignment,
            style: this._options.style,
            showDelay: this._options.showDelay,
            // InfoBox close by outside click only if trigger is set to 'demand' or 'click'.
            closeOnOutsideClick: this._options.trigger === 'click' || this._options.trigger === 'demand',
            floatCloseButton: this._options.floatCloseButton,
            eventHandlers: {
                onResult: this._resultHandler,
                onClose: this._closeHandler
            },
            templateOptions: this._options.templateOptions
        };
    }

    close(delay?: number): void {
        if (this._isNewEnvironment()) {
            this._notify('closeInfoBox', [delay], {bubbling: true});
        } else {
            if (!this._destroyed) {
                this._children.infoBoxOpener.close(delay);
            }
        }
        this._resetTimeOut();
        this._opened = false;
    }

    private _resetTimeOut(): void {
        if (this._openId) {
            clearTimeout(this._openId);
        }
        if (this._closeId) {
            clearTimeout(this._closeId);
        }
        this._openId = null;
        this._closeId = null;
    }

    private _clearWaitTimer(): void {
        if (this._waitTimer) {
            clearTimeout(this._waitTimer);
        }
    }

    private _startOpeningPopup(): void {
        // TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=809254e8-e179-443b-b8b7-f4a37e05f7d8
        this._resetTimeOut();

        this._openId = setTimeout(() => {
            this._openId = null;
            this.open();
            this._forceUpdate();
        }, this._options.showDelay);
    }

    protected _contentMousedownHandler(event: SyntheticEvent<MouseEvent>): void {
        if (this._options.trigger === 'click') {
            if (!this._opened) {
                this.open();
            }
            event.stopPropagation();
        }
    }

    protected _contentMousemoveHandler(): void {
        if (this._options.trigger === 'hover' || this._options.trigger === 'hover|touch') {
            // wait, until user stop mouse on target.
            // Don't open popup, if mouse moves through the target
            // On touch devices there is no real hover, although the events are triggered.
            // Therefore, the opening is not necessary.
            this._clearWaitTimer();
            this._waitTimer = setTimeout(() => {
                this._waitTimer = null;
                if (!this._opened && !this._context.isTouch.isTouch) {
                    this._startOpeningPopup();
                }
            }, CALM_DELAY);
        }
    }

    protected _contentTouchStartHandler(): void {
        if (this._options.trigger === 'hover|touch') {
            this._startOpeningPopup();
        }
    }

    protected _contentMouseleaveHandler(): void {
        if (this._options.trigger === 'hover' || this._options.trigger === 'hover|touch') {
            this._clearWaitTimer();
            clearTimeout(this._openId);
            this._closeId = setTimeout(() => {
                this._closeId = null;
                this.close();
                this._forceUpdate();
            }, this._options.hideDelay);
        }

    }

    private _resultHandler(event: SyntheticEvent<MouseEvent>): void {
        switch (event.type) {
            case 'mouseenter':
                clearTimeout(this._closeId);
                this._closeId = null;
                break;
            case 'mouseleave':
                if (this._options.trigger === 'hover' || this._options.trigger === 'hover|touch') {
                    this._contentMouseleaveHandler();
                }
                break;
            case 'mousedown':
                event.stopPropagation();
                break;
            case 'close':
                // todo Для совместимости. Удалить, как будет сделана задача
                // https://online.sbis.ru/opendoc.html?guid=dedf534a-3498-4b93-b09c-0f36f7c91ab5
                this._opened = false;
        }
    }

    private _closeHandler(): void {
        this._opened = false;
    }

    protected _scrollHandler(): void {
        this.close(0);
    }

    static contextTypes(): IInfoBoxTouchContext {
        return {
            isTouch: TouchContextField
        };
    }

    static getOptionTypes(): Record<string, Function> {
        return {
            trigger: descriptor(String).oneOf([
                'hover',
                'click',
                'hover|touch',
                'demand'
            ])
        };
    }

    static getDefaultOptions(): IInfoBoxOptions {
        return {
            targetSide: 'top',
            alignment: 'start',
            style: 'secondary',
            showDelay: 300,
            hideDelay: 300,
            trigger: 'hover'
        };
    }
}

export default InfoboxTarget;
