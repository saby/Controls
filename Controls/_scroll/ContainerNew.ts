import {constants, detection} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TemplateFunction} from 'UI/Base';
import ContainerBase, {IContainerBaseOptions} from 'Controls/_scroll/ContainerBase';
import * as ScrollData from 'Controls/_scroll/Scroll/Context';
import Observer from './IntersectionObserver/Observer';
import template = require('wml!Controls/_scroll/Container/Container');
import baseTemplate = require('wml!Controls/_scroll/ContainerBase/ContainerBase');
import ShadowsModel from './Container/ShadowsModel';
import ScrollbarsModel from './Container/ScrollbarsModel';
import PagingModel from './Container/PagingModel';
import {
    IScrollbars,
    IScrollbarsOptions,
    getDefaultOptions as getScrollbarsDefaultOptions
} from './Container/Interface/IScrollbars';
import {IShadows, SHADOW_VISIBILITY} from './Container/Interface/IShadows';
import {IIntersectionObserverObject} from './IntersectionObserver/Types';
import StickyHeaderController from './StickyHeader/Controller';
import {IFixedEventData, TRegisterEventData, TYPE_FIXED_HEADERS} from './StickyHeader/Utils';
import {POSITION} from './Container/Type';

interface IContainerOptions extends IContainerBaseOptions, IScrollbarsOptions, IShadows {
    backgroundStyle: string;
}

/**
 * Контейнер с тонким скроллом.
 *
 * @remark
 * Контрол работает как нативный скролл: скроллбар появляется, когда высота контента больше высоты контрола. Для корректной работы контрола необходимо ограничить его высоту.
 * Для корректной работы внутри WS3 необходимо поместить контрол в контроллер Controls/dragnDrop:Compound, который обеспечит работу функционала Drag-n-Drop.
 *
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less">переменные тем оформления</a>
 *
 * @class Controls/_scroll/ContainerNew
 * @extends Controls/_scroll/ContainerBase
 * @mixes Controls/_scroll/Interface/IScrollbars
 * @mixes Controls/_scroll/Interface/IShadows
 * @control
 * @public
 * @author Миронов А.Ю.
 * @category Container
 * @demo Controls-demo/Scroll/Container/Default/Index
 *
 */

/*
 * Container with thin scrollbar.
 *
 * @class Controls/_scroll/ContainerNew
 * @extends Controls/_scroll/ContainerBase
 * @control
 * @public
 * @author Красильников А.С.
 * @category Container
 * @demo Controls-demo/Scroll/Container/Default/Index
 *
 */

/**
 * @name Controls/_scroll/ContainerNew#content
 * @cfg {Content} Содержимое контейнера.
 */

/*
 * @name Controls/_scroll/ContainerNew#content
 * @cfg {Content} Container contents.
 */


/**
 * @name Controls/_scroll/ContainerNew#style
 * @cfg {String} Цветовая схема (цвета тени и скролла).
 * @variant normal Тема по умолчанию (для ярких фонов).
 * @variant inverted Преобразованная тема (для темных фонов).
 */

/*
 * @name Controls/_scroll/ContainerNew#style
 * @cfg {String} Color scheme (colors of the shadow and scrollbar).
 * @variant normal Default theme (for bright backgrounds).
 * @variant inverted Inverted theme (for dark backgrounds).
 */

/**
 * @name Controls/_scroll/ContainerNew#optimizeShadow
 * @cfg {Boolean} Включает режим быстрой отрисовки тени.
 * @default true
 * @variant true Оптимизированные тени.
 * @variant false Не оптимизированные тени.
 * @remark
 * Отключите оптимизированные тени, если:
 * <ul>
 *     <li> У скролл контейнера непрозрачный фон </li>
 *     <li> Скролл контейнер находится в элементе с непрозрачным фоном </li>
 *     <li> В скролл конейтенере присутствуют изображения. </li>
 * </ul>
 */

/**
 * @name Controls/_scroll/ContainerNew#backgroundStyle
 * @cfg {String} Определяет префикс стиля для настройки элементов которые зависят от цвета фона.
 * @default default
 * @demo Controls-demo/Scroll/BackgroundStyle/Index
 */

const SCROLL_BY_ARROWS = 40;
const DEFAULT_BACKGROUND_STYLE = 'default';

export default class Container extends ContainerBase<IContainerOptions> implements IScrollbars {
    readonly '[Controls/_scroll/Container/Interface/IScrollbars]': boolean = true;
    readonly '[Controls/_scroll/Container/Interface/IShadows]': boolean = true;

    protected _template: TemplateFunction = template;
    protected _baseTemplate: TemplateFunction = baseTemplate;

    protected _shadows: ShadowsModel;
    protected _scrollbars: ScrollbarsModel;
    protected _paging: PagingModel;
    protected _dragging: boolean = false;

    protected _intersectionObserverController: Observer;
    protected _stickyHeaderController: StickyHeaderController;

    protected _isOptimizeShadowEnabled: boolean;
    protected _optimizeShadowClass: string;
    protected _needUpdateContentSize: boolean = false;

    _beforeMount(options: IContainerOptions, context, receivedState) {
        this._shadows = new ShadowsModel(options);
        this._scrollbars = new ScrollbarsModel(options, receivedState);
        this._stickyHeaderController = new StickyHeaderController(this);
        this._isOptimizeShadowEnabled = this._getIsOptimizeShadowEnabled(options);
        this._optimizeShadowClass = this._getOptimizeShadowClass(options);

        super._beforeMount(...arguments);

        if (!receivedState) {
            return Promise.resolve(this._scrollbars.serializeState());
        }
    }

    _afterMount(options: IContainerOptions, context) {

        if (context.ScrollData?.pagingVisible) {
            this._paging = new PagingModel();
            this._scrollCssClass = this._getScrollContainerCssClass(options);
        }

        super._afterMount();

        this._stickyHeaderController.init(this._container);
    }

    protected _beforeUpdate(options: IContainerOptions, context) {
        super._beforeUpdate(...arguments);
        if (context.ScrollData?.pagingVisible) {
            this._paging.isVisible = this._state.canVerticalScroll;
        }
        this._isOptimizeShadowEnabled = this._getIsOptimizeShadowEnabled(options);
        this._optimizeShadowClass = this._getOptimizeShadowClass();
        // TODO: Логика инициализации для поддержки разных браузеров была скопирована почти полностью
        //  из старого скроллконейнера, нужно отрефакторить. Очень запутанно
        this._updateScrollContainerPaigingSccClass(options);
        this._scrollbars.updateOptions(options);
        this._shadows.updateOptions(options);
    }

    protected _afterUpdate() {
        super._afterUpdate(...arguments);
        this._stickyHeaderController.updateContainer(this._container);
        if (this._needUpdateContentSize) {
            this._needUpdateContentSize = false;
            this._updateStateAndGenerateEvents({ scrollHeight: this._children.content.scrollHeight });
        }
    }

    _beforeUnmount(): void {
        if (this._intersectionObserverController) {
            this._intersectionObserverController.destroy();
            this._intersectionObserverController = null;
        }
        this._stickyHeaderController.destroy();
    }

    _updateState(...args) {
        const isUpdated: boolean = super._updateState(...args);
        if (isUpdated) {

            // Если включены тени через стили, то нам все равно надо посчитать состояние теней
            // для фиксированных заголовков если они есть.
            if (!this._isOptimizeShadowEnabled ||
                    this._stickyHeaderController.hasFixed(POSITION.TOP) ||
                    this._stickyHeaderController.hasFixed(POSITION.BOTTOM)) {
                this._shadows.updateScrollState(this._state);
            }

            // При инициализации не обновляем скрол бары. Инициализируем их по наведению мышкой.
            if (this._isStateInitialized) {
                this._scrollbars.updateScrollState(this._state, this._container);
            }

            this._paging?.update(this._state);

            this._stickyHeaderController.setCanScroll(this._state.canVerticalScroll);
            this._stickyHeaderController.setShadowVisibility(
                this._shadows.top.isStickyHeadersShadowsEnabled(),
                this._shadows.bottom.isStickyHeadersShadowsEnabled());

            this._updateScrollContainerPaigingSccClass(this._options);
        }
        return isUpdated;
    }

    protected _updateScrollContainerPaigingSccClass(options: IContainerOptions) {
        const scrollCssClass = this._getScrollContainerCssClass(this._options);
        if (this._scrollCssClass !== scrollCssClass) {
            this._scrollCssClass = scrollCssClass;
            this._needUpdateContentSize = true;
        }
    }

    protected _getScrollContainerCssClass(options: IContainerBaseOptions): string {
        let cssClass: string = this._scrollbars.getScrollContainerClasses();
        if (this._paging?.isVisible) {
            cssClass += ' controls-Scroll__content_paging';
        }
        return cssClass;
    }

    protected _draggingChangedHandler(event: SyntheticEvent, scrollbarOrientation: string, dragging: boolean): void {
        this._dragging = dragging;

        // if (!dragging && typeof this._scrollTopAfterDragEnd !== 'undefined') {
        //    // В случае если запомненная позиция скролла для восстановления не совпадает с
        //    // текущей, установим ее при окончании перетаскивания
        //    if (this._scrollTopAfterDragEnd !== this._scrollTop) {
        //       this._scrollTop = this._scrollTopAfterDragEnd;
        //       _private.notifyScrollEvents(this, this._scrollTop);
        //    }
        //    this._scrollTopAfterDragEnd = undefined;
        // }
    }

    protected _positionChangedHandler(event, direction, position): void {
        this.scrollTo(position, direction);
    }

    protected _keydownHandler(event: SyntheticEvent): void {
        // если сами вызвали событие keydown (горячие клавиши), нативно не прокрутится, прокрутим сами
        if (!event.nativeEvent.isTrusted) {
            let offset: number;
            const scrollTop: number = this._state.scrollTop;
            const scrollContainerHeight: number = this._state.scrollHeight - this._state.clientHeight;

            if (event.nativeEvent.which === constants.key.pageDown) {
                offset = scrollTop + this._state.clientHeight;
            }
            if (event.nativeEvent.which === constants.key.down) {
                offset = scrollTop + SCROLL_BY_ARROWS;
            }
            if (event.nativeEvent.which === constants.key.pageUp) {
                offset = scrollTop - this._state.clientHeight;
            }
            if (event.nativeEvent.which === constants.key.up) {
                offset = scrollTop - SCROLL_BY_ARROWS;
            }

            if (offset > scrollContainerHeight) {
                offset = scrollContainerHeight;
            }
            if (offset < 0 ) {
                offset = 0;
            }
            if (offset !== undefined && offset !== scrollTop) {
                this.scrollTo(offset);
                event.preventDefault();
            }

            if (event.nativeEvent.which === constants.key.home && scrollTop !== 0) {
                this.scrollToTop();
                event.preventDefault();
            }
            if (event.nativeEvent.which === constants.key.end && scrollTop !== scrollContainerHeight) {
                this.scrollToBottom();
                event.preventDefault();
            }
        }
    }

    protected _arrowClickHandler(event, btnName) {
        var scrollParam;

        switch (btnName) {
            case 'Begin':
                scrollParam = 'top';
                break;
            case 'End':
                scrollParam = 'bottom';
                break;
            case 'Prev':
                scrollParam = 'pageUp';
                break;
            case 'Next':
                scrollParam = 'pageDown';
                break;
        }
        this._doScroll(scrollParam);
    }

    protected _mouseenterHandler(event) {
        // Если до mouseenter не вычисляли скроллбар, сделаем это сейчас.
        this._scrollbars.updateScrollState(this._state, this._container);
        if (this._scrollbars.take()) {
            this._notify('scrollbarTaken', [], {bubbling: true});
        }
    }

    protected _mouseleaveHandler(event) {
        if (this._scrollbars.release()) {
            this._notify('scrollbarReleased', [], {bubbling: true});
        }
    }

    protected _scrollbarTakenHandler() {
        this._scrollbars.taken();
    }

    protected _scrollbarReleasedHandler(event) {
        if (this._scrollbars.released()) {
            event.preventDefault();
        }
    }


    // Intersection observer

    private _initIntersectionObserverController(): void {
        if (!this._intersectionObserverController) {
            this._intersectionObserverController = new Observer(this._intersectHandler.bind(this));
        }
    }

    protected _intersectionObserverRegisterHandler(event: SyntheticEvent, intersectionObserverObject: IIntersectionObserverObject): void {
        this._initIntersectionObserverController();
        this._intersectionObserverController.register(this._container, intersectionObserverObject);
        if (!intersectionObserverObject.observerName) {
            event.stopImmediatePropagation();
        }
    }

    protected _intersectionObserverUnregisterHandler(event: SyntheticEvent, instId: string, observerName: string): void {
        this._intersectionObserverController.unregister(instId, observerName);
        if (!observerName) {
            event.stopImmediatePropagation();
        }
    }

    protected _intersectHandler(items): void {
        this._notify('intersect', [items]);
    }

    protected _getOptimizeShadowClass(options?: IContainerOptions): string {
        const opts:IContainerOptions = options || this._options;
        let style: string = '';
        if (this._isOptimizeShadowEnabled) {
            style += `controls-Scroll__background-Shadow_style-${opts.backgroundStyle}_theme-${opts.theme} ` +
                `controls-Scroll__background-Shadow_top-${this._shadows.top.isVisibleShadowOnCSS}_bottom-${this._shadows.bottom.isVisibleShadowOnCSS}_style-${opts.shadowStyle}_theme-${opts.theme}`;
        }
        return style;
    }

    protected _getIsOptimizeShadowEnabled(options: IContainerOptions): boolean {
        return options.optimizeShadow && !detection.isMobileIOS;
    }

    // StickyHeaderController

    _stickyFixedHandler(event: SyntheticEvent<Event>, fixedHeaderData: IFixedEventData): void {
        this._stickyHeaderController.fixedHandler(event, fixedHeaderData);
        const top = this._stickyHeaderController.getHeadersHeight(POSITION.TOP, TYPE_FIXED_HEADERS.initialFixed);
        const bottom = this._stickyHeaderController.getHeadersHeight(POSITION.BOTTOM, TYPE_FIXED_HEADERS.initialFixed);
        this._scrollbars.setOffsets({ top: top, bottom: bottom });
        this._stickyHeaderController.setShadowVisibility(
            this._shadows.top.isStickyHeadersShadowsEnabled(),
            this._shadows.bottom.isStickyHeadersShadowsEnabled());
        this._shadows.setStickyFixed(
            this._stickyHeaderController.hasFixed(POSITION.TOP) && this._stickyHeaderController.hasShadowVisible(POSITION.TOP),
            this._stickyHeaderController.hasFixed(POSITION.BOTTOM) && this._stickyHeaderController.hasShadowVisible(POSITION.BOTTOM));
        this._notify('fixed', [top, bottom]);
    }

    _stickyRegisterHandler(event: SyntheticEvent<Event>, data: TRegisterEventData, register: boolean): void {
        this._stickyHeaderController.registerHandler(event, data, register);
    }

    getHeadersHeight(position: POSITION, type: TYPE_FIXED_HEADERS = TYPE_FIXED_HEADERS.initialFixed): number {
        return this._stickyHeaderController.getHeadersHeight(position, type);
    }

    static contextTypes() {
       return {
          ScrollData
       };
    }

    static _theme: string[] = ['Controls/scroll'];

    static getDefaultOptions() {
        return {
            ...getScrollbarsDefaultOptions(),
            topShadowVisibility: SHADOW_VISIBILITY.AUTO,
            bottomShadowVisibility: SHADOW_VISIBILITY.AUTO,
            shadowStyle: 'default',
            backgroundStyle: DEFAULT_BACKGROUND_STYLE,
            scrollMode: 'vertical',
            optimizeShadow: false
        };
    }
}
