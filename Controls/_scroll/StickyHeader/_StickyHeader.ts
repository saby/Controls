import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Logger} from 'UI/Utils';
import {detection, constants} from 'Env/Env';
import {descriptor} from 'Types/entity';
import Context = require('Controls/_scroll/StickyHeader/Context');
import {
    getNextId,
    getOffset,
    POSITION,
    MODE,
    IOffset,
    validateIntersectionEntries,
    isHidden,
    IFixedEventData
} from 'Controls/_scroll/StickyHeader/Utils';
import IntersectionObserver = require('Controls/Utils/IntersectionObserver');
import fastUpdate from './FastUpdate';
import Model = require('Controls/_scroll/StickyHeader/_StickyHeader/Model');
import template = require('wml!Controls/_scroll/StickyHeader/_StickyHeader/StickyHeader');
import tmplNotify = require('Controls/Utils/tmplNotify');
import {RegisterUtil, UnregisterUtil} from 'Controls/event';

export const enum SHADOW_VISIBILITY {
    visible = 'visible',
    hidden = 'hidden'
}

export enum BACKGROUND_STYLE {
    TRANSPARENT = 'transparent',
    DEFAULT = 'default'
}

export interface IStickyHeaderOptions extends IControlOptions {
    position: POSITION;
    mode: MODE;
    fixedZIndex: number;
    shadowVisibility: SHADOW_VISIBILITY;
    backgroundVisible: boolean;
    backgroundStyle: string;
}

/**
 * Ensures that content sticks to the top of the parent container when scrolling down.
 * Occurs at the moment of intersection of the upper part of the content and the parent container.
 *
 * @private
 * @extends Core/Control
 * @class Controls/_scroll/StickyHeader
 */

/**
 * @name Controls/_scroll/StickyHeader#content
 * @cfg {Function} Sticky header content.
 */

/**
 * @event Controls/_scroll/StickyHeader#fixed Change the fixation state.
 * @param {Vdom/Vdom:SyntheticEvent} event Event descriptor.
 * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} information Information about the fixation event.
 */

// For android, use a large patch, because 1 pixel is not enough. For all platforms we use the minimum values since
// there may be layout problems if the headers will have paddings, margins, etc.
const
    ANDROID_GAP_FIX_OFFSET: number = 3,
    MOBILE_GAP_FIX_OFFSET: number = 1;

interface IStickyHeaderContext {
    stickyHeader: Function;
}

interface IResizeObserver {
    observe: (el: HTMLElement) => void;
    unobserve: (el: HTMLElement) => void;
    disconnect: () => void;
}

export default class StickyHeader extends Control<IStickyHeaderOptions> {

    /**
     * @type {Function} Component display template.
     * @private
     */
    protected _template: TemplateFunction = template;

    /**
     * @type {IntersectionObserver}
     * @private
     */
    private _observer: IntersectionObserver;

    private _model: Model;

    /**
     * type {Boolean} Determines whether the component is built on the Android mobile platform.
     * @private
     */
    protected _isMobilePlatform: boolean = detection.isMobilePlatform;
    protected _isMobileAndroid: boolean = detection.isMobileAndroid;
    protected _isSafari13: boolean = StickyHeader._isSafari13();
    protected _isIOSChrome: boolean = StickyHeader._isIOSChrome();
    protected _isMobileIOS: boolean = detection.isMobileIOS;

    private _isFixed: boolean = false;
    private _stickyHeadersHeight: IOffset = {
        top: null,
        bottom: null
    };

    private _index: number = null;

    private _height: number = 0;

    private _reverseOffsetStyle: string = null;
    private _minHeight: number = 0;
    private _cachedStyles: CSSStyleDeclaration = null;
    private _cssClassName: string = null;
    private _canScroll: boolean = false;
    private _lastFixedPosition: string = '';

    protected _notifyHandler: Function = tmplNotify;

    protected _moduleName: string = 'Controls/_scroll/StickyHeader/_StickyHeader';

    // Префикс для корректной установки background
    protected _backgroundStyle: string;

   _bottomShadowStyle: string = '';
   _topShadowStyle: string = '';

    private _stickyDestroy: boolean = false;
    private _scroll: HTMLElement;

    private _needUpdateObserver: boolean = false;

    protected _beforeMount(options: IStickyHeaderOptions): void {
        this._options = options;
        this._observeHandler = this._observeHandler.bind(this);
        this._index = getNextId();
        this._backgroundStyle = this._options.backgroundVisible !== false ? this._options.backgroundStyle : BACKGROUND_STYLE.TRANSPARENT;
    }

    protected _beforePaintOnMount(): void {
        RegisterUtil(this, 'updateFixed', this._updateFixed.bind(this));

        this._notify('stickyRegister', [{
            id: this._index,
            inst: this,
            container: this._container,
            position: this._options.position,
            mode: this._options.mode
        }, true], {bubbling: true});
    }

    protected _afterMount(): void {
        const children = this._children;

        // После реализации https://online.sbis.ru/opendoc.html?guid=36457ffe-1468-42bf-acc9-851b5aa24033
        // отказаться от closest.
        this._scroll = this._container.closest('.controls-Scroll');
        if (!this._scroll) {
            Logger.warn('Controls.scroll:StickyHeader: Используются фиксация заголовков вне Controls.scroll:Container. Либо используйте Controls.scroll:Container, либо уберите, либо отключите фиксацию заголовков в контролах в которых она включена.', this);
            return;
        }

        this._model = new Model({
            topTarget: children.observationTargetTop,
            bottomTarget: children.observationTargetBottom,
            position: this._options.position,
        });

        // Переделать на новые события
        // https://online.sbis.ru/opendoc.html?guid=ca70827b-ee39-4d20-bf8c-32b10d286682
        RegisterUtil(this, 'listScroll', this._onScrollStateChanged.bind(this));

        this._initObserver();
    }

    protected _beforeUnmount(): void {
        UnregisterUtil(this, 'updateFixed');
        UnregisterUtil(this, 'listScroll');
        if (this._model) {
            //Let the listeners know that the element is no longer fixed before the unmount.
            this._fixationStateChangeHandler('', this._model.fixedPosition);
            this._model.destroy();
        }
        this._stickyDestroy = true;

        // его может и не быть, если контрол рушится не успев замаунтиться
        if (this._observer) {
            this._observer.disconnect();
        }

        this._observeHandler = undefined;
        this._observer = undefined;
        this._notify('stickyRegister', [{id: this._index}, false], {bubbling: true});
    }

    getOffset(parentElement: HTMLElement, position: POSITION): number {
        return getOffset(parentElement, this._container, position);
    }

    resetSticky(): void {
        fastUpdate.resetSticky([this._container]);
    }

    get height(): number {
        const container: HTMLElement = this._container;
        if (!isHidden(container)) {
            this._height = container.offsetHeight;
        }
        return this._height;
    }

    get top(): number {
        return this._stickyHeadersHeight.top;
    }

    set top(value: number) {
        if (this._stickyHeadersHeight.top !== value) {
            this._stickyHeadersHeight.top = value;
            // ОБновляем сразу же dom дерево что бы не было скачков в интерфейсе
            fastUpdate.mutate(() => {
                this._container.style.top = `${value}px`;
            });
            this._forceUpdateIfCanScroll();
        }
    }

    get bottom(): number {
        return this._stickyHeadersHeight.bottom;
    }

    set bottom(value: number) {
        if (this._stickyHeadersHeight.bottom !== value) {
            this._stickyHeadersHeight.bottom = value;
            // ОБновляем сразу же dom дерево что бы не было скачков в интерфейсе
            this._container.style.bottom = `${value}px`;
            this._forceUpdateIfCanScroll();
        }
    }

    get shadowVisibility(): SHADOW_VISIBILITY {
        return this._options.shadowVisibility;
    }

    protected _onScrollStateChanged(eventType: string): void {
        if (eventType === 'canScroll') {
            this._canScroll = true;
            if (this._model.fixedPosition !== this._lastFixedPosition) {
                this._forceUpdate();
            }
        } else if (eventType === 'cantScroll') {
            this._canScroll = false;
        }
    }

    protected _resizeHandler(): void {
        if (this._needUpdateObserver) {
            this._initObserver();
        }
    }

    protected _selfResizeHandler(): void {
        this._notify('stickyHeaderResize', [], {bubbling: true});
    }

    private _initObserver(): void {
        // Если заголовок невидим(display: none), то мы не сможем рассчитать его положение. Вернее обсервер вернет нам
        // что тригеры невидимы, но рассчеты мы сделать не сможем. Когда заголовк станет видим, и если он находится
        // в самом верху скролируемой области, то верхний тригер останется невидимым, т.е. сбытия не будет.
        // Что бы самостоятельно не рассчитывать положение тригеров, мы просто пересоздадим обсервер когда заголовок
        // станет видимым.
        if (isHidden(this._container)) {
            this._needUpdateObserver = true;
            return;
        }

        this._destroyObserver();
        this._createObserver();
        this._needUpdateObserver = false;
    }

    private _destroyObserver(): void {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    }

    private _createObserver(): void {
        const children = this._children;
        this._observer = new IntersectionObserver(
            this._observeHandler,
            {
                root: this._scroll,
                // Рассширим область тслеживания по горизонтали чтобы ячейки за праделами вьюпорта сбоку не считались
                // невидимыми если включен горизонтальный скролл в таблицах. Значение не влияет на производительнось.
                // 20 000 должно хватить, но если повятся сценарии в которых этого значения мало, то можно увеличить.
                rootMargin: '0px 20000px'
            }
        );
        this._observer.observe(children.observationTargetTop);
        this._observer.observe(children.observationTargetBottom);
    }

    /**
     * Handles changes to the visibility of the target object of observation at the intersection of the root container.
     * @param {IntersectionObserverEntry[]} entries The intersections between the target element and its root container at a specific moment of transition.
     * @private
     */
    private _observeHandler(entries: IntersectionObserverEntry[]): number {
        /**
         * Баг IntersectionObserver на Mac OS: сallback может вызываться после отписки от слежения. Отписка происходит в
         * _beforeUnmount. Устанавливаем защиту.
         */
        if (this._stickyDestroy) {
            return;
        }
        // При скрытии родителя всегда стреляет событие о невидимости заголовков. При обратном отображении стреляет
        // событие о видимости. Но представление обновляется асинхронно.
        // Сцеарий 1. В области есть скрол контэйнер с проскроленым контентом. Его скрывают. Если этого условия нет,
        // то все заголовки считают себя не зафиксированными. Затем контент заново отображают.
        // Заголовки не зафиксированы, z-index у них не проставлен, их закрывает идущий за ними контент.
        // Через мгновение они появляются. Проблема есть в SwitchableArea и в стэковых окнах.
        // Сценарий 2. Области создаются скрытыми. а после загрузки данных отбражаются.
        if (isHidden(this._container)) {
            return;
        }

        const fixedPosition: POSITION = this._model.fixedPosition;

        this._model.update(validateIntersectionEntries(entries, this._scroll));

        if (this._model.fixedPosition !== fixedPosition) {
            this._fixationStateChangeHandler(this._model.fixedPosition, fixedPosition);
            if (this._canScroll) {
                this._lastFixedPosition = this._model.fixedPosition;
                this._forceUpdate();
            }
        }
    }

    /**
     * To inform descendants about the fixing status. To update the state of the instance.
     * @private
     */
    protected _fixationStateChangeHandler(newPosition: POSITION, prevPosition: POSITION): void {
        // If the header is hidden we cannot calculate its current height.
        // Use the height that it had before it was hidden.
        if (!isHidden(this._container)) {
            this._height = this._container.offsetHeight;
        }
        this._isFixed = !!newPosition;
        this._fixedNotifier(newPosition, prevPosition);
    }

    protected _fixedNotifier(newPosition: POSITION, prevPosition: POSITION, isFakeFixed: boolean = false): void {
        const information: IFixedEventData = {
            id: this._index,
            fixedPosition: newPosition,
            offsetHeight: this._height,
            prevPosition,
            mode: this._options.mode,
            shadowVisible: this._options.shadowVisibility === 'visible',
            isFakeFixed
        };

        this._notify('fixed', [information], {bubbling: true});
    }

    protected _getStyle(): string {
        let
            offset: number = 0,
            container: HTMLElement,
            top: number,
            bottom: number,
            fixedPosition: POSITION,
            styles: CSSStyleDeclaration,
            style: string = '',
            minHeight: number;

        /**
         * On android and ios there is a gap between child elements.
         * When the header is fixed, there is a space between the container, relative to which it is fixed,
         * and the header, through which you can see the scrolled content. Its size does not exceed one pixel.
         * https://jsfiddle.net/tz52xr3k/3/
         *
         * As a solution, move the header up and increase its size by an offset, using padding.
         * In this way, the content of the header does not change visually, and the free space disappears.
         * The offset must be at least as large as the free space. Take the nearest integer equal to one.
         */
        if (this._isMobileAndroid) {
            offset = ANDROID_GAP_FIX_OFFSET;
        } else if (this._isMobilePlatform) {
            offset = MOBILE_GAP_FIX_OFFSET;
        }

        fixedPosition = this._model ? this._model.fixedPosition : undefined;

        if (this._options.position.indexOf(POSITION.top) !== -1 && this._stickyHeadersHeight.top !== null) {
            top = this._stickyHeadersHeight.top;
            style += 'top: ' + (top - (fixedPosition ? offset : 0)) + 'px;';
        }

        if (this._options.position.indexOf(POSITION.bottom) !== -1 && this._stickyHeadersHeight.bottom !== null) {
            bottom = this._stickyHeadersHeight.bottom;
            style += 'bottom: ' + (bottom - offset) + 'px;';
        }

        if (fixedPosition) {
            if (offset) {
                container = this._getNormalizedContainer();

                styles = this._getComputedStyle();
                minHeight = parseInt(styles.minHeight, 10);
                // Increasing the minimum height, otherwise if the content is less than the established minimum height,
                // the height is not compensated by padding and the header is shifted. If the minimum height is already
                // set by the style attribute, then do not touch it.
                if (styles.boxSizing === 'border-box' && minHeight && !container.style.minHeight) {
                    this._minHeight = minHeight + offset;
                }
                if (this._minHeight) {
                    style += 'min-height:' + this._minHeight + 'px;';
                }
                // Increase border or padding by offset.
                // If the padding or border is already set by the style attribute, then don't change it.
                if (this._reverseOffsetStyle === null) {
                    const borderWidth: number = parseInt(styles['border-' + fixedPosition + '-width'], 10);

                    if (borderWidth) {
                        this._reverseOffsetStyle = 'border-' + fixedPosition + '-width:' + (borderWidth + offset) + 'px;';
                    } else {
                        this._reverseOffsetStyle = 'padding-' + fixedPosition + ':' + (parseInt(styles.paddingTop, 10) + offset) + 'px;';
                    }
                }

                style += this._reverseOffsetStyle;
                style += 'margin-' + fixedPosition + ': -' + offset + 'px;';
            }

            style += 'z-index: ' + this._options.fixedZIndex + ';';
        }

        //убрать по https://online.sbis.ru/opendoc.html?guid=ede86ae9-556d-4bbe-8564-a511879c3274
        if (this._options.task1177692247 && this._options.fixedZIndex) {
            style += 'z-index: ' + this._options.fixedZIndex + ';';
        }

        return style;
    }

    protected _getObserverStyle(position: POSITION): string {
        // The top observer has a height of 1 pixel. In order to track when it is completely hidden
        // beyond the limits of the scrollable container, taking into account round-off errors,
        // it should be located with an offset of -3 pixels from the upper border of the container.
        let coord: number = this._stickyHeadersHeight[position] + 3;
        if (position === POSITION.top && this._options.offsetTop && this._options.shadowVisibility === SHADOW_VISIBILITY.visible) {
            coord += this._options.offsetTop;
        }
        // Учитываем бордеры на фиксированных заголовках
        // Во время серверной верстки на страницах на ws3 в this._container находится какой то объект...
        // https://online.sbis.ru/opendoc.html?guid=ea21ab20-8346-4092-ac24-5ac6198ed2b8
        if (this._container && !constants.isServerSide) {
            const styles = this._getComputedStyle();
            const borderWidth = parseInt(styles[`border-${position}-width`], 10);
            if (borderWidth) {
                coord += borderWidth;
            }
        }

        // "bottom" and "right" styles does not work in list header control on ios 13. Use top instead.
        const container: HTMLElement = this._getNormalizedContainer();
        if ((this._isSafari13 || this._isIOSChrome) && position === POSITION.bottom) {
            return 'top: ' + (coord + (container ? container.offsetHeight : 0)) + 'px;';
        }

        return position + ': -' + coord + 'px;';
    }

    protected _updateFixed(ids: number[]): void {
        const isFixed: boolean = ids.indexOf(this._index) !== -1;
        if (this._isFixed !== isFixed) {
            if (!this._model) {
                // Модель еще не существует, значит заголвок только что создан и контроллер сказал
                // заголовку что он зафиксирован. Обновим тень вручную что бы не было скачков.
                fastUpdate.mutate(() => {
                    if (this._children.shadowBottom &&
                            this._context.stickyHeader.shadowPosition.indexOf(POSITION.top) !== -1) {
                        this._children.shadowBottom.classList.remove('ws-invisible');
                    }
                });
            } else if (this._model.fixedPosition) {
                if (isFixed) {
                    this._fixedNotifier(this._model.fixedPosition, '', true);
                } else {
                    this._fixedNotifier('', this._model.fixedPosition, true);
                }
            }
            this._isFixed = isFixed;
            this._forceUpdateIfCanScroll();
        }
    }

    protected _isShadowVisible(shadowPosition: POSITION): boolean {
        //The shadow from above is shown if the element is fixed from below, from below if the element is fixed from above.
        const fixedPosition: POSITION = shadowPosition === POSITION.top ? POSITION.bottom : POSITION.top;

        return !!((this._context.stickyHeader?.shadowPosition &&
            this._context.stickyHeader.shadowPosition.indexOf(fixedPosition) !== -1) &&
            ((this._model && this._model.fixedPosition === fixedPosition) || (!this._model && this._isFixed)) &&
            this._options.shadowVisibility === SHADOW_VISIBILITY.visible &&
            (this._options.mode === MODE.stackable || this._isFixed));
    }

    private _getComputedStyle(): CSSStyleDeclaration {
        const container: HTMLElement = this._getNormalizedContainer();
        if (this._cssClassName !== container.className) {
            this._cssClassName = container.className;
            this._cachedStyles = getComputedStyle(container);
        }
        return this._cachedStyles;
    }

    private _getNormalizedContainer(): HTMLElement {
        //TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
        // There's no container at first building of template.
        if (!this._container) {
            return;
        }
        return this._container.get ? this._container.get(0) : this._container;
    }

    private _forceUpdateIfCanScroll(): void {
        if (this._canScroll) {
            this._forceUpdate();
        }
    }

    static _theme: string[] = ['Controls/scroll', 'Controls/Classes'];

    static _isSafari13(): boolean {
        return detection.safariVersion >= 13;
    }

    static _isIOSChrome(): boolean {
        return detection.isMobileIOS && detection.chrome;
    }

    static contextTypes(): IStickyHeaderContext {
        return {
            stickyHeader: Context
        };
    }

    static getDefaultOptions(): IStickyHeaderOptions {
        return {
            //TODO: https://online.sbis.ru/opendoc.html?guid=a5acb7b5-dce5-44e6-aa7a-246a48612516
            fixedZIndex: 2,
            shadowVisibility: SHADOW_VISIBILITY.visible,
            backgroundVisible: true,
            backgroundStyle: BACKGROUND_STYLE.DEFAULT,
            mode: MODE.replaceable,
            position: POSITION.top
        };
    }

    static getOptionTypes(): Record<string, Function> {
        return {
            shadowVisibility: descriptor(String).oneOf([
                SHADOW_VISIBILITY.visible,
                SHADOW_VISIBILITY.hidden
            ]),
            backgroundVisible: descriptor(Boolean),
            backgroundStyle: descriptor(String),
            mode: descriptor(String).oneOf([
                MODE.replaceable,
                MODE.stackable
            ]),
            position: descriptor(String).oneOf([
                'top',
                'bottom',
                'topbottom'
            ])
        };
    }

    static _theme: string[] = ['Controls/scroll'];

}
