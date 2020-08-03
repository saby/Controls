import {constants} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TemplateFunction} from 'UI/Base';
import ContainerBase, {IContainerBaseOptions} from 'Controls/_scroll/ContainerBase';
import Observer from './IntersectionObserver/Observer';
import template = require('wml!Controls/_scroll/Container/Container');
import baseTemplate = require('wml!Controls/_scroll/ContainerBase/ContainerBase');
import ShadowsModel from './Container/ShadowsModel';
import ScrollbarsModel from './Container/ScrollbarsModel';
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
 * Отпимизированные тени подходят для контейнеров, которые находятся на стандратном фоне и в случае, если внутри нет изображений.
 */

const SCROLL_BY_ARROWS = 40;

export default class Container extends ContainerBase<IContainerOptions> implements IScrollbars {
    readonly '[Controls/_scroll/Container/Interface/IScrollbars]': boolean = true;
    readonly '[Controls/_scroll/Container/Interface/IShadows]': boolean = true;

    protected _template: TemplateFunction = template;
    protected _baseTemplate: TemplateFunction = baseTemplate;

    protected _shadows: ShadowsModel;
    protected _scrollbars: ScrollbarsModel;
    protected _dragging: boolean = false;

    protected _intersectionObserverController: Observer;
    protected _stickyHeaderController: StickyHeaderController;

    _beforeMount(options: IContainerOptions, context, receivedState) {
        this._shadows = new ShadowsModel(options);
        this._scrollbars = new ScrollbarsModel(options, receivedState);
        this._stickyHeaderController = new StickyHeaderController(this);

        super._beforeMount(...arguments);

        if (!receivedState) {
            return Promise.resolve(this._scrollbars.serializeState());
        }
    }

    _afterMount() {
        super._afterMount();
        this._adjustContentMarginsForBlockRender();
        this._stickyHeaderController.init(this._container);
    }

    protected _afterUpdate() {
        this._stickyHeaderController.updateContainer(this._container);
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
            // Убираем старое поведение теней, новые тени сделаны через CSS, рассчеты производить более не требуется
            // Старое поведение нужно включать в тех местах, где присутствуют картинки и/или непрозрачный фон.
            if (!this._options.optimizeShadow) {
                this._shadows.updateScrollState(this._state);
            }
            this._scrollbars.updateScrollState(this._state);
            this._stickyHeaderController.setCanScroll(this._state.canVerticalScroll);
            this._scrollCssClass = this._getScrollContainerCssClass(this._options);
        }
        return isUpdated;
    }

    protected _getScrollContainerCssClass(options: IContainerBaseOptions): string {
        return this._scrollbars.getScrollContainerClasses();
    }

    private _adjustContentMarginsForBlockRender(): void {
        let computedStyle = getComputedStyle(this._children.scrollContainer);
        let marginTop = parseInt(computedStyle.marginTop, 10);
        let marginRight = parseInt(computedStyle.marginRight, 10);
        this._scrollbars.adjustContentMarginsForBlockRender(marginTop, marginRight);
    }

    protected _draggingChangedHandler(event, dragging): void {
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


    protected _keydownHandler(ev): void {
        // если сами вызвали событие keydown (горячие клавиши), нативно не прокрутится, прокрутим сами
        if (!ev.nativeEvent.isTrusted) {
            let offset: number;
            const scrollTop: number = this._state.scrollTop;
            if (ev.nativeEvent.which === constants.key.pageDown) {
                offset = scrollTop + this._state.clientHeight;
            }
            if (ev.nativeEvent.which === constants.key.down) {
                offset = scrollTop + SCROLL_BY_ARROWS;
            }
            if (ev.nativeEvent.which === constants.key.pageUp) {
                offset = scrollTop - this._state.clientHeight;
            }
            if (ev.nativeEvent.which === constants.key.up) {
                offset = scrollTop - SCROLL_BY_ARROWS;
            }
            if (offset !== undefined) {
                this.scrollTo(offset);
                ev.preventDefault();
            }

            if (ev.nativeEvent.which === constants.key.home) {
                this.scrollToTop();
                ev.preventDefault();
            }
            if (ev.nativeEvent.which === constants.key.end) {
                this.scrollToBottom();
                ev.preventDefault();
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

    protected _getOptimizeShadowClass(): string {
        return `controls-Scroll__background-Shadow controls-Scroll__background-Shadow_top-${this._shadows.top.isVisibleShadowOnCSS}_bottom-${this._shadows.bottom.isVisibleShadowOnCSS}`;
    }

    // StickyHeaderController

    _stickyFixedHandler(event: SyntheticEvent<Event>, fixedHeaderData: IFixedEventData): void {
        this._stickyHeaderController.fixedHandler(event, fixedHeaderData);
        const top = this._stickyHeaderController.getHeadersHeight(POSITION.TOP, TYPE_FIXED_HEADERS.initialFixed);
        const bottom = this._stickyHeaderController.getHeadersHeight(POSITION.BOTTOM, TYPE_FIXED_HEADERS.initialFixed);
        this._scrollbars.setOffsets({ top: top, bottom: bottom });
        this._shadows.setStickyFixed(!!top, !!bottom);
        this._notify('fixed', [top, bottom]);
    }

    _stickyRegisterHandler(event: SyntheticEvent<Event>, data: TRegisterEventData, register: boolean): void {
        this._stickyHeaderController.registerHandler(event, data, register);
    }

    getHeadersHeight(position: POSITION, type: TYPE_FIXED_HEADERS = TYPE_FIXED_HEADERS.initialFixed): number {
        return this._stickyHeaderController.getHeadersHeight(position, type)
    }

    static _theme: string[] = ['Controls/scroll'];

    static getDefaultOptions() {
        return {
            ...getScrollbarsDefaultOptions(),
            topShadowVisibility: SHADOW_VISIBILITY.AUTO,
            bottomShadowVisibility: SHADOW_VISIBILITY.AUTO,
            scrollMode: 'vertical',
            optimizeShadow: true
        };
    }
}
