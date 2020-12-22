import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {isStickySupport} from 'Controls/_scroll/StickyHeader/Utils';
import {Logger} from 'UI/Utils';
import {constants, detection} from 'Env/Env';
import {descriptor} from 'Types/entity';
import {
    getGapFixSize,
    getNextId,
    getOffset,
    IFixedEventData,
    IOffset,
    isHidden,
    MODE,
    POSITION,
    SHADOW_VISIBILITY,
    validateIntersectionEntries
} from 'Controls/_scroll/StickyHeader/Utils';
import fastUpdate from './StickyHeader/FastUpdate';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {IScrollState} from '../Utils/ScrollState';
import {getScrollPositionTypeByState, SCROLL_DIRECTION, SCROLL_POSITION} from './Utils/Scroll';
import Context = require('Controls/_scroll/StickyHeader/Context');
import {IntersectionObserver} from 'Controls/sizeUtils';
import Model = require('Controls/_scroll/StickyHeader/Model');
import template = require('wml!Controls/_scroll/StickyHeader/StickyHeader');
import {EventUtils} from 'UI/Events';

export enum BACKGROUND_STYLE {
    TRANSPARENT = 'transparent',
    DEFAULT = 'default'
}

export interface IStickyHeaderOptions extends IControlOptions {
    position: POSITION;
    mode: MODE;
    fixedZIndex: number;
    zIndex: number;
    shadowVisibility: SHADOW_VISIBILITY;
    backgroundStyle: string;
}

interface IResizeObserver {
    observe: (el: HTMLElement) => void;
    unobserve: (el: HTMLElement) => void;
    disconnect: () => void;
}
/**
 * Обеспечивает прилипание контента к верхней или нижней части родительского контейнера при прокрутке.
 * Прилипание происходит в момент пересечения верхней или нижней части контента и родительского контейнера.
 * @remark
 * Фиксация заголовка в IE и Edge версии ниже 16 не поддерживается.
 *
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less переменные тем оформления}
 *
 * @public
 * @extends Core/Control
 * @class Controls/_scroll/StickyHeader
 *
 * @mixes Control/interface:IBackgroundStyle
 *
 * @author Красильников А.С.
 */

/*
 * Ensures that content sticks to the top or bottom of the parent container when scrolling.
 * Occurs at the moment of intersection of the upper or lower part of the content and the parent container.
 * @remark
 * Fixing in IE and Edge below version 16 is not supported.
 *
 * @public
 * @extends Core/Control
 * @class Controls/_scroll/StickyHeader
 * @author Красильников А.С.
 */
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
    protected _isIOSChrome: boolean = StickyHeader._isIOSChrome();
    protected _isMobileIOS: boolean = detection.isMobileIOS;

    private _isFixed: boolean = false;
    private _isShadowVisibleByController: boolean = true;
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
    private _scrollState: IScrollState = {
        canVerticalScroll: false,
        verticalPosition: detection.isMobileIOS ? SCROLL_POSITION.START : null,
        hasUnrenderedContent: {
            top: false,
            bottom: false
        }
    };
    private _negativeScrollTop: boolean = false;

    protected _notifyHandler: Function = EventUtils.tmplNotify;

    protected _moduleName: string = 'Controls/_scroll/StickyHeader/_StickyHeader';

    /**
     * The position property with sticky value is not supported in ie and edge lower version 16.
     * https://developer.mozilla.org/ru/docs/Web/CSS/position
     */
    protected _isStickySupport: boolean = isStickySupport();

    protected _style: string = '';

    protected _isBottomShadowVisible: boolean = false;
    protected _isTopShadowVisible: boolean = false;

    protected _topObserverStyle: string = '';
    protected _bottomObserverStyle: string = '';

    protected _scrollShadowPosition: string = '';

    private _stickyDestroy: boolean = false;
    private _scroll: HTMLElement;

    private _needUpdateObserver: boolean = false;

    // Считаем заголовок инициализированным после того как контроллер установил ему top или bottom.
    // До этого не синхронизируем дом дерево при изменении состояния.
    private _initialized: boolean = false;

    protected _beforeMount(options: IStickyHeaderOptions, context): void {
        if (!this._isStickySupport) {
            return;
        }

        this._observeHandler = this._observeHandler.bind(this);
        this._index = getNextId();
        this._scrollShadowPosition = context?.stickyHeader?.shadowPosition;
        this._updateStyles(options);
    }

    protected _componentDidMount(): void {
        if (!this._isStickySupport) {
            return;
        }
        this._notify('stickyRegister', [{
            id: this._index,
            inst: this,
            position: this._options.position,
            mode: this._options.mode,
            shadowVisibility: this._options.shadowVisibility
        }, true], {bubbling: true});
    }

    getHeaderContainer(): HTMLElement {
        return this._container;
    }

    protected _beforeUpdate(options: IStickyHeaderOptions, context): void {
        if (!this._isStickySupport) {
            return;
        }
        if (options.fixedZIndex !== this._options.fixedZIndex) {
            this._updateStyle(options.position, options.fixedZIndex, options.zIndex, options.task1177692247);
        }
        if (context?.stickyHeader?.shadowPosition !== this._scrollShadowPosition) {
            this._scrollShadowPosition = context?.stickyHeader?.shadowPosition;
            this._updateShadowStyles(options.mode, options.shadowVisibility);
        }
    }

    protected _afterUpdate(options: IStickyHeaderOptions): void {
        this._updateComputedStyle();
    }

    protected _afterMount(): void {
        if (!this._isStickySupport) {
            return;
        }
        const children = this._children;

        this._updateComputedStyle();

        // После реализации https://online.sbis.ru/opendoc.html?guid=36457ffe-1468-42bf-acc9-851b5aa24033
        // отказаться от closest.
        this._scroll = this._container.closest('.controls-Scroll, .controls-Scroll-Container');
        if (!this._scroll) {
            Logger.warn('Controls.scroll:StickyHeader: Используются фиксация заголовков вне Controls.scroll:Container. Либо используйте Controls.scroll:Container, либо уберите, либо отключите фиксацию заголовков в контролах в которых она включена.', this);
            return;
        }

        this._model = new Model({
            topTarget: children.observationTargetTop,
            bottomTarget: children.observationTargetBottom,
            position: this._options.position,
        });

        RegisterUtil(this, 'scrollStateChanged', this._onScrollStateChanged);

        RegisterUtil(this, 'controlResize', this._resizeHandler);

        this._initObserver();
    }

    protected _beforeUnmount(): void {
        if (!this._isStickySupport) {
            return;
        }
        UnregisterUtil(this, 'controlResize');
        UnregisterUtil(this, 'scrollStateChanged');
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
        let offset = getOffset(parentElement, this._container, position);
        if (this._model?.isFixed()) {
            offset += getGapFixSize();
        }
        return offset;
    }

    resetSticky(): void {
        fastUpdate.resetSticky([this._container]);
    }

    get height(): number {
        const container: HTMLElement = this._container;
        if (!isHidden(container)) {
            // Проблема: заголовок помечен зафиксированным, но еще не успел пройти цикл синхронизации
            // где навешиваются padding/margin/top. Из-за этого высота, получаемая через .offsetHeight будет
            // не актуальная, когда цикл обновления завершится. Неактуальные размеры придут в scroll:Container
            // и вызовут полную перерисовку, т.к. контрол посчитает что изменились высоты контента.
            // При след. замерах возьмется актуальная высота и опять начнется перерисовка.
            // Т.к. смещения только на ios добавляем, считаю высоту через clientHeight только для ios.
            if (detection.isMobileIOS) {
                this._height = container.clientHeight;
            } else {
                this._height = container.offsetHeight;
                if (!detection.isMobileAndroid) {
                    // offsetHeight округляет к ближайшему числу, из-за этого на масштабе просвечивают полупиксели.
                    // Такое решение подходит тоько для десктопа, т.к. на мобильных устройствах devicePixelRatio всегда
                    // равен 2.75
                    this._height -= Math.abs(1 - window.devicePixelRatio);
                }
            }
            if (this._model?.isFixed()) {
                this._height -= getGapFixSize();
            }
        }
        return this._height;
    }

    get top(): number {
        return this._stickyHeadersHeight.top;
    }

    set top(value: number) {
        if (this._stickyHeadersHeight.top !== value) {
            this._stickyHeadersHeight.top = value;
            this._initialized = true;
            // При установке top'а учитываем gap
            const offset = getGapFixSize();
            const topValue = value - offset;
            // ОБновляем сразу же dom дерево что бы не было скачков в интерфейсе
            fastUpdate.mutate(() => {
                this._container.style.top = `${topValue}px`;
            });
            this._updateStylesIfCanScroll();
        }
    }

    get bottom(): number {
        return this._stickyHeadersHeight.bottom;
    }

    set bottom(value: number) {
        if (this._stickyHeadersHeight.bottom !== value) {
            this._stickyHeadersHeight.bottom = value;
            this._initialized = true;
            // При установке bottom учитываем gap
            const offset = getGapFixSize();
            const bottomValue = value - offset;
            // ОБновляем сразу же dom дерево что бы не было скачков в интерфейсе
            this._container.style.bottom = `${bottomValue}px`;
            this._updateStylesIfCanScroll();
        }
    }

    get shadowVisibility(): SHADOW_VISIBILITY {
        return this._options.shadowVisibility;
    }

    protected _onScrollStateChanged(scrollState: IScrollState, oldScrollState: IScrollState): void {
        let changed: boolean = false;

        const isInitializing = Object.keys(oldScrollState).length === 0;
        // Если нет скролла, то и заголовки незачем обновлять
        if (isInitializing || !scrollState.canVerticalScroll) {
            return;
        }

        if (scrollState.canVerticalScroll !== this._scrollState.canVerticalScroll) {
            changed = true;
        }
        this._canScroll = scrollState.canVerticalScroll;
        this._negativeScrollTop = scrollState.scrollTop < 0;

        if (this._scrollState.verticalPosition !== scrollState.verticalPosition ||
            this._scrollState.hasUnrenderedContent.top !== scrollState.hasUnrenderedContent.top ||
            this._scrollState.hasUnrenderedContent.bottom !== scrollState.hasUnrenderedContent.bottom) {
            changed = true;
        }

        this._scrollState = scrollState;

        if (changed && this._initialized) {
            this._updateStyles(this._options);
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

        // Не отклеиваем заголовки scrollTop отрицательный.
        if (this._negativeScrollTop && this._model.fixedPosition === '') {
            return;
        }

        if (this._model.fixedPosition !== fixedPosition) {
            this._fixationStateChangeHandler(this._model.fixedPosition, fixedPosition);
            if (this._canScroll && this._initialized) {
                this._updateStyles(this._options);
            }
        }
    }

    /**
     * To inform descendants about the fixing status. To update the state of the instance.
     * @private
     */
    protected _fixationStateChangeHandler(newPosition: POSITION, prevPosition: POSITION): void {
        this._isFixed = !!newPosition;
        this._fixedNotifier(newPosition, prevPosition);
    }

    protected _fixedNotifier(newPosition: POSITION, prevPosition: POSITION, isFakeFixed: boolean = false): void {
        const information: IFixedEventData = {
            id: this._index,
            fixedPosition: newPosition,
            prevPosition,
            mode: this._options.mode,
            shadowVisible: this._options.shadowVisibility === 'visible',
            isFakeFixed
        };

        this._notify('fixed', [information], {bubbling: true});
    }

    private _updateStyles(options: IStickyHeaderOptions): void {
        this._updateStyle(options.position, options.fixedZIndex, options.zIndex, options.task1177692247);
        this._updateShadowStyles(options.mode, options.shadowVisibility);
        this._updateObserversStyles(options.offsetTop, options.shadowVisibility);
    }

    private _updateStyle(position: POSITION, fixedZIndex: number, zIndex: number, task1177692247): void {
        const style = this._getStyle(position, fixedZIndex, zIndex, task1177692247);
        if (this._style !== style) {
            this._style = style;
        }
    }

    protected _getStyle(positionFromOptions: POSITION, fixedZIndex: number, zIndex: number, task1177692247?): string {
        let
            offset: number = 0,
            container: HTMLElement,
            top: number,
            bottom: number,
            fixedPosition: POSITION,
            styles: CSSStyleDeclaration,
            style: string = '',
            minHeight: number;

        // Этот костыль нужен, чтобы убрать щели между заголовками. Для прозрачных заголовков он не нужен.
        offset = this._options.backgroundStyle !== 'transparent' ? getGapFixSize() : 0;

        fixedPosition = this._model ? this._model.fixedPosition : undefined;
        // Включаю оптимизацию для всех заголовков на ios, в 5100 проблем выявлено не было
        const isIosOptimizedMode = this._isMobileIOS;

        if (positionFromOptions.indexOf(POSITION.top) !== -1 && this._stickyHeadersHeight.top !== null) {
            top = this._stickyHeadersHeight.top;
            const checkOffset = fixedPosition || isIosOptimizedMode;
            style += 'top: ' + (top - (checkOffset ? offset : 0)) + 'px;';
        }

        if (positionFromOptions.indexOf(POSITION.bottom) !== -1 && this._stickyHeadersHeight.bottom !== null) {
            bottom = this._stickyHeadersHeight.bottom;
            style += 'bottom: ' + (bottom - offset) + 'px;';
        }

        // На IOS чтобы избежать дерганий скролла при достижении нижней или верхей границы, требуется
        // отключить обновления в DOM дереве дочерних элементов скролл контейнера. Сейчас обновления происходят
        // в прилипающих заголовках в аттрибуте style при закреплении/откреплении заголовка. Опция позволяет
        // отключить эти обновления.
        // Повсеместно включать нельзя, на заголовках где есть бордеры или в контенте есть разные цвета фона
        // могут наблюдаться проблемы.
        let position = fixedPosition;
        if (!position && isIosOptimizedMode && positionFromOptions !== 'topbottom') {
            position = this._options.position;
        }
        if (position && this._container) {
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
                    const borderWidth: number = parseInt(styles['border-' + position + '-width'], 10);

                    if (borderWidth) {
                        this._reverseOffsetStyle = 'border-' + position + '-width:' + (borderWidth + offset) + 'px;';
                    } else {
                        const padding = parseInt(styles['padding-' + position], 10);
                        this._reverseOffsetStyle = 'padding-' + position + ':' + (padding + offset) + 'px;';
                    }
                }

                style += this._reverseOffsetStyle;
                style += 'margin-' + position + ': -' + offset + 'px;';
            }

            style += 'z-index: ' + fixedZIndex + ';';
        } else if (zIndex) {
            style += 'z-index: ' + zIndex + ';';
        }

        //убрать по https://online.sbis.ru/opendoc.html?guid=ede86ae9-556d-4bbe-8564-a511879c3274
        if (task1177692247 && fixedZIndex && !fixedPosition) {
            style += 'z-index: ' + fixedZIndex + ';';
        }

        return style;
    }

    private _updateObserversStyles(offsetTop: number, shadowVisibility: SHADOW_VISIBILITY): void {
        this._topObserverStyle = this._getObserverStyle(POSITION.top, offsetTop, shadowVisibility);
        this._bottomObserverStyle = this._getObserverStyle(POSITION.bottom, offsetTop, shadowVisibility);
    }

    protected _getObserverStyle(position: POSITION, offsetTop: number, shadowVisibility: SHADOW_VISIBILITY): string {
        // The top observer has a height of 1 pixel. In order to track when it is completely hidden
        // beyond the limits of the scrollable container, taking into account round-off errors,
        // it should be located with an offset of -3 pixels from the upper border of the container.
        let coord: number = this._stickyHeadersHeight[position] + 2;
        if (StickyHeader.getDevicePixelRatio() !== 1) {
            coord += 1;
        }
        if (position === POSITION.top && offsetTop && shadowVisibility === SHADOW_VISIBILITY.visible) {
            coord += offsetTop;
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

        return position + ': -' + coord + 'px;';
    }

    protected updateFixed(ids: number[]): void {
        const isFixed: boolean = ids.indexOf(this._index) !== -1;
        if (this._isFixed !== isFixed) {
            if (!this._model) {
                // Модель еще не существует, значит заголвок только что создан и контроллер сказал
                // заголовку что он зафиксирован. Обновим тень вручную что бы не было скачков.
                fastUpdate.mutate(() => {
                    if (this._children.shadowBottom &&
                        this._isShadowVisibleByScrollState(POSITION.bottom)) {
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
            this._updateStylesIfCanScroll();
        }
    }

    private _updateShadowStyles(mode: MODE, shadowVisibility: SHADOW_VISIBILITY): void {
        this._isTopShadowVisible = this._isShadowVisible(POSITION.top, mode, shadowVisibility);
        this._isBottomShadowVisible = this._isShadowVisible(POSITION.bottom, mode, shadowVisibility);
    }

    protected updateShadowVisibility(isVisible: boolean): void {
        if (this._isShadowVisibleByController !== isVisible) {
            this._isShadowVisibleByController = isVisible;
            this._updateStylesIfCanScroll();
        }
    }

    protected _isShadowVisible(shadowPosition: POSITION, mode: MODE, shadowVisibility: SHADOW_VISIBILITY): boolean {
        //The shadow from above is shown if the element is fixed from below, from below if the element is fixed from above.
        const fixedPosition: POSITION = shadowPosition === POSITION.top ? POSITION.bottom : POSITION.top;

        const shadowEnabled: boolean = this._isShadowVisibleByScrollState(shadowPosition);

        return !!(shadowEnabled &&
            ((this._model && this._model.fixedPosition === fixedPosition) || (!this._model && this._isFixed)) &&
            (shadowVisibility === SHADOW_VISIBILITY.visible || shadowVisibility === SHADOW_VISIBILITY.lastVisible) &&
            (mode === MODE.stackable || this._isFixed));
    }

    private _isShadowVisibleByScrollState(shadowPosition: POSITION): boolean {
        const fixedPosition: POSITION = shadowPosition === POSITION.top ? POSITION.bottom : POSITION.top;

        if (this._scrollState.hasUnrenderedContent[fixedPosition]) {
            return true;
        }

        const shadowVisible: boolean = !!(this._scrollState.verticalPosition &&
            (shadowPosition === POSITION.bottom && this._scrollState.verticalPosition !== SCROLL_POSITION.START ||
                shadowPosition === POSITION.top && this._scrollState.verticalPosition !== SCROLL_POSITION.END));

        return  this._isShadowVisibleByController && shadowVisible;
    }

    _updateComputedStyle(): void {
        const container: HTMLElement = this._getNormalizedContainer();
        if (this._cssClassName !== container.className) {
            this._cssClassName = container.className;
            const styles = getComputedStyle(container) as CSSStyleDeclaration;
            // Сразу запрашиваем и сохраняем нужные стили. Recalculate Style происходит не в момент вызова
            // getComputedStyle, а при обращении к стилям в из полученного объекта.
            this._cachedStyles = {
                'border-top-width': styles['border-top-width'],
                'border-bottom-width': styles['border-bottom-width'],
                'padding-top': styles['padding-top'],
                'padding-bottom': styles['padding-bottom'],
                minHeight: styles.minHeight,
                boxSizing: styles.boxSizing
            };
        }
    }

    private _getComputedStyle(): CSSStyleDeclaration | object {
        // В ядре проблема, что до маунта вызывают апдейт контрола. Пока они разбираются, ставлю защиту
        return this._cachedStyles || {};
    }

    private _getNormalizedContainer(): HTMLElement {
        //TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
        // There's no container at first building of template.
        if (!this._container) {
            return;
        }
        return this._container.get ? this._container.get(0) : this._container;
    }

    private _updateStylesIfCanScroll(): void {
        if (this._canScroll && this._initialized) {
            this._updateStyles(this._options);
        }
    }

    static _theme: string[] = ['Controls/scroll', 'Controls/Classes'];

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
            backgroundStyle: BACKGROUND_STYLE.DEFAULT,
            mode: MODE.replaceable,
            position: POSITION.top
        };
    }

    static getOptionTypes(): Record<string, Function> {
        return {
            shadowVisibility: descriptor(String).oneOf([
                SHADOW_VISIBILITY.visible,
                SHADOW_VISIBILITY.hidden,
                SHADOW_VISIBILITY.lastVisible
            ]),
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

    static getDevicePixelRatio(): number {
        if (window?.devicePixelRatio) {
            return window.devicePixelRatio;
        }
        return 1;
    }

    static _theme: string[] = ['Controls/scroll'];

}
/**
 * @name Controls/_scroll/StickyHeader#content
 * @cfg {Function} Содержимое заголовка, которое будет зафиксировано.
 */

/*
 * @name Controls/_scroll/StickyHeader#content
 * @cfg {Function} Sticky header content.
 */

/**
 * @name Controls/_scroll/StickyHeader#mode
 * @cfg {String} Режим прилипания заголовка.
 * @variant replaceable Заменяемый заголовок. Следующий заголовок заменяет текущий.
 * @variant stackable Составной заголовок. Следующий заголовок прилипает к нижней части текущего.
 */

/*
 * @name Controls/_scroll/StickyHeader#mode
 * @cfg {String} Sticky header mode.
 * @variant replaceable Replaceable header. The next header replaces the current one.
 * @variant stackable Stackable header.  The next header is stick to the bottom of the current one.
 */

/**
 * @name Controls/_scroll/StickyHeader#shadowVisibility
 * @cfg {String} Устанавливает видимость тени.
 * @variant visible Показать тень.
 * @variant hidden Не показывать.
 * @default visible
 */

/*
 * @name Controls/_scroll/StickyHeader#shadowVisibility
 * @cfg {String} Shadow visibility.
 * @variant visible Show.
 * @variant hidden Do not show.
 * @default visible
 */

/**
 * @name Controls/_scroll/StickyHeader#position
 * @cfg {String} Определяет позицию прилипания.
 * @variant top Прилипание к верхнему краю.
 * @variant bottom Прилипание к нижнему краю.
 * @variant topbottom Прилипание к верхнему и нижнему краю.
 * @default top
 */

/*
 * @name Controls/_scroll/StickyHeader#position
 * @cfg {String} Determines which side the control can sticky.
 * @variant top Top side.
 * @variant bottom Bottom side.
 * @variant topbottom Top and bottom side.
 * @default top
 */

/**
 * @name Controls/_scroll/StickyHeader#fixedZIndex
 * @cfg {Number} Определяет значение z-index на заголовке, когда он зафиксирован
 * @default 2
 */

/**
 * @name Controls/_scroll/StickyHeader#zIndex
 * @cfg {Number} Определяет значение z-index на заголовке, когда он не зафиксирован
 * @default undefined
 */

/**
 * @event Происходит при изменении состояния фиксации.
 * @name Controls/_scroll/StickyHeader#fixed
 * @param {Vdom/Vdom:SyntheticEvent} event Дескриптор события.
 * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} information Информация о событии фиксации.
 */

/*
 * @event Change the fixation state.
 * @name Controls/_scroll/StickyHeader#fixed
 * @param {Vdom/Vdom:SyntheticEvent} event Event descriptor.
 * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} information Information about the fixation event.
 */
