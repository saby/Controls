import {compatibility, constants, detection} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TemplateFunction} from 'UI/Base';
import ContainerBase, {IContainerBaseOptions} from 'Controls/_scroll/ContainerBase';
import Observer from './IntersectionObserver/Observer';
import ShadowsModel from './Container/ShadowsModel';
import ScrollbarsModel from './Container/ScrollbarsModel';
import PagingModel, {TPagingModeScroll} from './Container/PagingModel';
import {
    getDefaultOptions as getScrollbarsDefaultOptions,
    IScrollbars,
    IScrollbarsOptions
} from './Container/Interface/IScrollbars';
import {
    getDefaultOptions as getShadowsDefaultOptions,
    IShadows,
    IShadowsOptions,
    IShadowsVisibilityByInnerComponents,
    SHADOW_MODE,
    SHADOW_VISIBILITY
} from './Container/Interface/IShadows';
import {IIntersectionObserverObject} from './IntersectionObserver/Types';
import fastUpdate from './StickyBlock/FastUpdate';
import StickyHeaderController from './StickyBlock/Controller';
import {IFixedEventData, TRegisterEventData, TYPE_FIXED_HEADERS, MODE} from './StickyBlock/Utils';
import StickyBlock from './StickyBlock';
import {POSITION} from './Container/Type';
import {SCROLL_DIRECTION} from './Utils/Scroll';
import {IHasUnrenderedContent, IScrollState} from './Utils/ScrollState';
import template = require('wml!Controls/_scroll/Container/Container');
import baseTemplate = require('wml!Controls/_scroll/ContainerBase/ContainerBase');
import {descriptor} from "Types/entity";
import {setSettings} from 'Controls/Application/SettingsController';
import WheelEventSettings from 'Controls/_scroll/Utils/getWheelEventSettings';

/**
 * @typeof {String} TPagingPosition
 * @variant left Отображения пэйджинга слева.
 * @variant right Отображения пэйджинга справа.
 */
type TPagingPosition= 'left' | 'right';

interface IContainerOptions extends IContainerBaseOptions, IScrollbarsOptions, IShadowsOptions {
    backgroundStyle: string;
    pagingMode?: TPagingModeScroll;
    pagingContentTemplate?: Function | string;
    pagingPosition?: TPagingPosition;
    pagingVisible: boolean;
    syncDomOptimization: boolean;
}

const SCROLL_BY_ARROWS = 40;
const DEFAULT_BACKGROUND_STYLE = 'default';
/**
 * Контейнер с тонким скроллом.
 *
 * @remark
 * Контрол работает как нативный скролл: скроллбар появляется, когда высота контента больше высоты контрола. Для корректной работы контрола необходимо ограничить его высоту.
 * Для корректной работы внутри WS3 необходимо поместить контрол в контроллер Controls/dragnDrop:Compound, который обеспечит работу функционала Drag-n-Drop.
 *
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less переменные тем оформления}
 *
 * @extends Controls/_scroll/ContainerBase
 * @implements Controls/scroll:IScrollbars
 * @implements Controls/scroll:IShadows
 *
 * @public
 * @author Миронов А.Ю.
 * @demo Controls-demo/Scroll/Container/Default/Index
 *
 */

/*
 * Container with thin scrollbar.
 *
 * @class Controls/_scroll/Container
 * @extends Controls/_scroll/ContainerBase
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Scroll/Container/Default/Index
 *
 */
export default class Container extends ContainerBase<IContainerOptions> implements IScrollbars {
    readonly '[Controls/_scroll/Container/Interface/IScrollbars]': boolean = true;
    readonly '[Controls/_scroll/Container/Interface/IShadows]': boolean = true;

    protected _template: TemplateFunction = template;
    protected _baseTemplate: TemplateFunction = baseTemplate;
    protected _options: IContainerOptions;

    protected _shadows: ShadowsModel;
    protected _scrollbars: ScrollbarsModel;
    protected _paging: PagingModel;
    protected _dragging: boolean = false;

    protected _intersectionObserverController: Observer;
    protected _stickyHeaderController: StickyHeaderController;

    protected _isOptimizeShadowEnabled: boolean;
    protected _optimizeShadowClass: string;
    private _isControllerInitialized: boolean;
    private _wasMouseEnter: boolean = false;
    private _gridAutoShadows: boolean = true;

    _beforeMount(options: IContainerOptions) {
        // Будем показывать скроллбар до тех пор, пока пользователь не воспользовался колесиком мышки, даже если
        // прикладник задал опцию scrollbarVisible=false.
        // Таким образом пользователи без колесика мышки смогут скроллить контент.
        // Если пользователь использовал колесико мышки - записываем это в localstorage
        WheelEventSettings.getWheelEventSettingPromise().then((data) => {
            ScrollbarsModel.wheelEventHappened = data;
        });
        this._shadows = new ShadowsModel(this._getShadowsModelOptions(options));
        this._scrollbars = new ScrollbarsModel(options);
        this._stickyHeaderController = new StickyHeaderController({ resizeCallback: this._headersResizeHandler.bind(this) });
        // При инициализации оптимизированные тени включаем только если они явно включены, или включен режим auto.
        // В режиме mixed используем тени на css что бы не вызывать лишние синхронизации. Когда пользователь наведет
        // мышкой на скролл контейнер или по другим обнавлениям тени начнут работать через js.
        this._isOptimizeShadowEnabled = Container._isCssShadowsSupported() &&
            (options.shadowMode === SHADOW_MODE.CSS ||
                (options.shadowMode === SHADOW_MODE.MIXED &&
                    (options.topShadowVisibility === SHADOW_VISIBILITY.AUTO || options.bottomShadowVisibility === SHADOW_VISIBILITY.AUTO)));
        this._optimizeShadowClass = this._getOptimizeShadowClass(options);

        super._beforeMount(...arguments);
    }

    _afterMount(options: IContainerOptions) {

        if (this._isPagingVisible(this._options)) {
            this._paging = new PagingModel();
            this._scrollCssClass = this._getScrollContainerCssClass(options);
            this._paging.pagingMode = this._options.pagingMode;
        }

        super._afterMount();

        const hasBottomHeaders = (): boolean => {
            const headers = Object.values(this._stickyHeaderController._headers);
            for (let i = 0; i < headers.length; i++) {
                const position = headers[i].position;
                if (position?.vertical === POSITION.BOTTOM || position?.horizontal === POSITION.RIGHT) {
                    return true;
                }
            }
            return false;
        };

        // Если есть заголовки, фиксирующиеся снизу, то при построении нужно обновить им позицию,
        // т.к. они будут зафиксированы.
        // Если тени принудительно включены, то надо инициализировать заголовки, что бы отрисовать тени на них.
        if (compatibility.touch || hasBottomHeaders() || this._shadows.hasVisibleShadow()) {
            this._initHeaderController();
        }
    }

    protected _isPagingVisible(options: IContainerOptions): boolean {
        if (typeof options.pagingMode !== 'undefined') {
            return options.pagingMode !== 'hidden';
        }
        return options.pagingVisible;
    }

    protected _beforeUpdate(options: IContainerOptions) {
        super._beforeUpdate(...arguments);
        if (this._isPagingVisible(options)) {
            if (!this._paging) {
                this._paging = new PagingModel();
            }
            this._paging.isVisible = this._scrollModel.canVerticalScroll && this._options.scrollOrientation !== 'none';
            if (this._options.pagingMode !== options.pagingMode) {
                this._paging.pagingMode = options.pagingMode;
            }
            this._updateContentWrapperCssClass();
        } else if (this._paging) {
            this._paging = null;
            this._updateContentWrapperCssClass();
        }

        this._updateShadows(this._scrollModel, options);
        this._isOptimizeShadowEnabled = this._getIsOptimizeShadowEnabled(options);
        this._optimizeShadowClass = this._getOptimizeShadowClass();
        // TODO: Логика инициализации для поддержки разных браузеров была скопирована почти полностью
        //  из старого скроллконейнера, нужно отрефакторить. Очень запутанно
        this._updateScrollContainerPaigingSccClass(options);
        if (options.scrollOrientation !== this._options.scrollOrientation) {
            this._scrollbars.updateScrollbarsModels(options);
        }
        this._scrollbars.updateOptions(options);
        this._shadows.updateOptions(this._getShadowsModelOptions(options));
    }

    protected _afterUpdate() {
        super._afterUpdate(...arguments);
        this._stickyHeaderController.updateContainer(this._children.content);
    }

    protected _beforeUnmount(): void {

        if (this._intersectionObserverController) {
            this._intersectionObserverController.destroy();
            this._intersectionObserverController = null;
        }
        this._stickyHeaderController.destroy();
        super._beforeUnmount();
    }

    private _initHeaderController(): void {
        if (!this._isControllerInitialized) {
            this._stickyHeaderController.init(this._children.content);
            this._isControllerInitialized = true;
        }
    }

    private _updateShadowMode(options?: IContainerOptions): boolean {
        let changed: boolean = false;
        const isOptimizeShadowEnabled = this._getIsOptimizeShadowEnabled(options || this._options);
        if (this._isOptimizeShadowEnabled !== isOptimizeShadowEnabled) {
            this._isOptimizeShadowEnabled = isOptimizeShadowEnabled;
            this._optimizeShadowClass = this._getOptimizeShadowClass();
            changed = true;
        }
        return changed;
    }

    _updateShadows(sate?: IScrollState, options?: IContainerOptions): void {
        const changed: boolean = this._updateShadowMode(options);
        if (changed) {
            this._shadows.updateScrollState(sate || this._scrollModel);
        }
    }

    private _getShadowsModelOptions(options: IContainerBaseOptions): any {
        const shadowsModel = {...options};
        // gridauto нужно для таблицы
        if (options.topShadowVisibility === 'gridauto') {
            shadowsModel.topShadowVisibility = this._gridAutoShadows ? 'visible' : 'auto';
        }
        if (options.bottomShadowVisibility === 'gridauto') {
            shadowsModel.bottomShadowVisibility = this._gridAutoShadows ? 'visible' : 'auto';
        }
        return shadowsModel;
    }

    protected _scrollHandler(e: SyntheticEvent): void {
        super._scrollHandler(e);
        this._initHeaderController();
    }

    _controlResizeHandler(): void {
        super._controlResizeHandler();
        this._stickyHeaderController.controlResizeHandler();
    }

    _updateState(...args) {
        const isUpdated: boolean = super._updateState(...args);
        if (isUpdated) {
            if (this._wasMouseEnter && this._scrollModel?.canVerticalScroll && !this._oldScrollState.canVerticalScroll) {
                this._updateShadowMode();
            }

            // Если включены тени через стили, то нам все равно надо посчитать состояние теней
            // для фиксированных заголовков если они есть.
            if (!this._isOptimizeShadowEnabled ||
                    this._stickyHeaderController.hasFixed(POSITION.TOP) ||
                    this._stickyHeaderController.hasFixed(POSITION.BOTTOM)) {
                this._shadows.updateScrollState(this._scrollModel);
            }

            if (this._scrollModel && this._isInitializationDelayed()) {
                this._scrollbars.updateScrollState(this._scrollModel, this._container);
            }

            this._paging?.update(this._scrollModel);

            this._stickyHeaderController.setCanScroll(this._scrollModel.canVerticalScroll);
            this._stickyHeaderController.setShadowVisibility(
                this._shadows.top?.getStickyHeadersShadowsVisibility(),
                this._shadows.bottom?.getStickyHeadersShadowsVisibility());

            this._updateScrollContainerPaigingSccClass(this._options);
        }
        return isUpdated;
    }

    protected _updateScrollContainerPaigingSccClass(options: IContainerOptions) {
        const scrollCssClass = this._getScrollContainerCssClass(this._options);
        if (this._scrollCssClass !== scrollCssClass) {
            this._scrollCssClass = scrollCssClass;
            this._updateContentWrapperCssClass(options);
        }
    }

    protected _getScrollContainerCssClass(options: IContainerBaseOptions): string {
        let cssClass: string = this._scrollbars.getScrollContainerClasses();
        return cssClass;
    }

    protected _getContentWrapperCssClass(): string {
        let cssClass = super._getContentWrapperCssClass();
        if (this._paging?.isVisible) {
            cssClass += ' controls-Scroll__content_paging'
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

    protected _positionChangedHandler(event, direction, scrollPosition): void {
        // В вертикальном направлении скролим с учетом виртуального скрола.
        if (direction === SCROLL_DIRECTION.VERTICAL) {
            this._setScrollTop(scrollPosition);
        } else {
            this.scrollTo(scrollPosition, direction);
        }
    }

    protected _stickyModeChanged(event: SyntheticEvent<Event>, stickyId: number, newMode: MODE): void {
        this._stickyHeaderController.updateStickyMode(stickyId, newMode);
    }

    protected _updateShadowVisibility(event: SyntheticEvent, shadowsVisibility: IShadowsVisibilityByInnerComponents): void {
        event.stopImmediatePropagation();
        if (this._gridAutoShadows) {
            this._gridAutoShadows = false;
            this._shadows.updateOptions(this._getShadowsModelOptions(this._options));
        }
        const needUpdate = this._wasMouseEnter || !this._isOptimizeShadowEnabled;
        this._shadows.updateVisibilityByInnerComponents(shadowsVisibility, needUpdate);

        // Если принудительно включили тени изнутри, то надо инициализировать заголовки что бы отрисовать тени на них.
        if (this._shadows.hasVisibleShadow()) {
            this._initHeaderController();
        }
        this._stickyHeaderController.setShadowVisibility(
                this._shadows.top?.getStickyHeadersShadowsVisibility(),
                this._shadows.bottom?.getStickyHeadersShadowsVisibility());

        this._updateStateAndGenerateEvents(this._scrollModel);
    }

    // Сейчас наличие контента сверху и снизу мы определяем косвенно по информации от списков надо ли отображать тень.
    // Это надо переделывать. Списки ничего не должны знать о тенях, и должны общаться со скролл контенером
    // в терминах виртуального скрола. Значение gridauto должно быть не у опций topShadowVisibility и
    // bottomShadowVisibility. На мой взгляд должна быть опция говорящая не то, что надо отображеть тень, а работающая
    // тоже в терминах виртуального скрола. Т.е. чтото типа hasUnrenderedContent. Список может поменять значене этой
    // опции изнутри.
    protected _getHasUnrenderedContentState(): IHasUnrenderedContent {
        return {
            top: (this._gridAutoShadows && this._options.topShadowVisibility === 'gridauto') ||
                this._shadows.top?.getVisibilityByInnerComponents() === SHADOW_VISIBILITY.VISIBLE,
            bottom: (this._gridAutoShadows && this._options.bottomShadowVisibility === 'gridauto') ||
                this._shadows.bottom?.getVisibilityByInnerComponents() === SHADOW_VISIBILITY.VISIBLE
        }
    }

    protected _getFullStateFromDOM(): IScrollState {
        const state: IScrollState = super._getFullStateFromDOM();
        return {
            ...state,
            hasUnrenderedContent: this._getHasUnrenderedContentState()
        };
    }

    protected _updateStateAndGenerateEvents(newState: IScrollState): void {
        super._updateStateAndGenerateEvents({
            ...newState,
            hasUnrenderedContent: this._getHasUnrenderedContentState()
        })

    }

    protected _getScrollNotifyConfig(): any[] {
        const baseConfig = super._getScrollNotifyConfig();
        const topShadowVisible = this._shadows.top?.getVisibilityByInnerComponents() === SHADOW_VISIBILITY.VISIBLE;
        const bottomShadowVisible = this._shadows.bottom?.getVisibilityByInnerComponents() === SHADOW_VISIBILITY.VISIBLE;
        baseConfig.push(topShadowVisible, bottomShadowVisible);
        return baseConfig;
    }

    protected _keydownHandler(event: SyntheticEvent): void {
        // если сами вызвали событие keydown (горячие клавиши), нативно не прокрутится, прокрутим сами
        if (!event.nativeEvent.isTrusted) {
            let offset: number;
            let headersHeight = 0;
            if (detection.isBrowserEnv) {
                headersHeight = this._stickyHeaderController.getHeadersHeight('top', 'allFixed');
            }
            const
                clientHeight = this._scrollModel.clientHeight - headersHeight,
                scrollTop: number = this._scrollModel.scrollTop;
            const scrollContainerHeight: number = this._scrollModel.scrollHeight - this._scrollModel.clientHeight;

            if (event.nativeEvent.which === constants.key.pageDown) {
                offset = scrollTop + clientHeight;
            }
            if (event.nativeEvent.which === constants.key.down) {
                offset = scrollTop + SCROLL_BY_ARROWS;
            }
            if (event.nativeEvent.which === constants.key.pageUp) {
                offset = scrollTop - clientHeight;
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

    protected _onWheelHandler(): void {
        if (!ScrollbarsModel.wheelEventHappened) {
            setSettings({scrollContainerWheelEventHappened: true });
            ScrollbarsModel.wheelEventHappened = true;
        }
    }

    protected _mouseenterHandler(event) {
        if (this._gridAutoShadows && this._scrollModel?.canVerticalScroll) {
            this._gridAutoShadows = false;
            this._shadows.updateOptions(this._getShadowsModelOptions(this._options));
            this._updateShadows();
        }

        // Если до mouseenter не вычисляли скроллбар, сделаем это сейчас.
        if (!this._wasMouseEnter) {
            this._wasMouseEnter = true;
            // При открытии плавающих панелей, когда курсор находится над скрлл контейнером,
            // иногда события по которым инициализируется состояние скролл контейнера стреляют после mouseenter.
            // В этом случае не обновляем скролбары, а просто делаем _wasMouseEnter = true выше.
            // Скроллбары рассчитаются после инициализации состояния скролл контейнера.
            if (this._scrollModel) {
                this._scrollbars.updateScrollState(this._scrollModel, this._container);
            }
            if (!compatibility.touch) {
                this._initHeaderController();
            }
        }

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

    _updatePlaceholdersSize(e: SyntheticEvent<Event>, placeholdersSizes): void {
        super._updatePlaceholdersSize(...arguments);
        this._scrollbars.updatePlaceholdersSize(placeholdersSizes);
    }

    private _isInitializationDelayed(): boolean {
        // Оптимизация отключена для ie. С оптимизацией некорректно работал :hover для скролбаров.
        // На демке без наших стилей иногда не появляется скролбар по ховеру. Такое впечатление что не происходит
        // paint после ховера и после снятия ховера. Изменение любых стилей через девтулсы исправляет ситуаци.
        // Если покрасить подложку по которой движется скролл красным, то после ховера видно, как она перерисовыатся
        // только в местах где по ней проехал скролбар.
        // После отключения оптимизации проблема почему то уходит.
        return this._wasMouseEnter || detection.isIE;
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
        if (this._intersectionObserverController) {
            this._intersectionObserverController.unregister(instId, observerName);
        }
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
            style += `controls-Scroll__backgroundShadow ` +
                `controls-Scroll__background-Shadow_style-${opts.backgroundStyle}_theme-${opts.theme} ` +
                `controls-Scroll__background-Shadow_top-${this._shadows.top?.isVisibleShadowOnCSS}_bottom-${this._shadows.bottom?.isVisibleShadowOnCSS}_style-${opts.shadowStyle}_theme-${opts.theme}`;
        }
        return style;
    }

    protected _getIsOptimizeShadowEnabled(options: IContainerOptions): boolean {
        return options.shadowMode === SHADOW_MODE.CSS && Container._isCssShadowsSupported();
    }

    // StickyHeaderController

    _stickyFixedHandler(event: SyntheticEvent<Event>, fixedHeaderData: IFixedEventData): void {
        this._stickyHeaderController.fixedHandler(event, fixedHeaderData);
        this._headersResizeHandler();
        // Если включены оптимизированные тени, то мы не обновляем состояние теней при изменении состояния скрола
        // если нет зафиксированных заголовков. Что бы тени на заголовках отображались правильно, рассчитаем состояние
        // теней в скролл контейнере.
        if (this._isOptimizeShadowEnabled) {
            this._shadows.updateScrollState(this._scrollModel, false);
        }
        this._stickyHeaderController.setShadowVisibility(
            this._shadows.top?.getStickyHeadersShadowsVisibility(),
            this._shadows.bottom?.getStickyHeadersShadowsVisibility());
        const needUpdate = this._wasMouseEnter || this._options.shadowMode === SHADOW_MODE.JS;
        this._shadows.setStickyFixed(
            this._stickyHeaderController.hasFixed(POSITION.TOP) && this._stickyHeaderController.hasShadowVisible(POSITION.TOP),
            this._stickyHeaderController.hasFixed(POSITION.BOTTOM) && this._stickyHeaderController.hasShadowVisible(POSITION.BOTTOM),
            needUpdate);

        const stickyHeaderOffsetTop = this._stickyHeaderController.getHeadersHeight(POSITION.TOP, TYPE_FIXED_HEADERS.fixed);
        const stickyHeaderOffsetBottom = this._stickyHeaderController.getHeadersHeight(POSITION.BOTTOM, TYPE_FIXED_HEADERS.fixed);
        this._notify('fixed', [stickyHeaderOffsetTop, stickyHeaderOffsetBottom]);

        // Спилить метод после того как будет сделана задача
        // https://online.sbis.ru/opendoc.html?guid=8089ac76-89d3-42c0-9ef2-8b187014559f
        if (fixedHeaderData.fixedPosition && !this._shadows.top?.isEnabled && this._children.hasOwnProperty('topShadow')) {
            fastUpdate.mutate(() => {
                this._children.topShadow.classList.add('ws-hidden');
            });
        }
    }

    _stickyRegisterHandler(event: SyntheticEvent<Event>, data: TRegisterEventData, register: boolean): void {
        // Синхронно Посчитаем и обновим информацию о фиксации заголовков только если известно,
        // что надо отображать тень сверху. Что бы лишний раз не лазить в дом, в других сценариях,
        // состояние заголовков обновится асинхронно по срабатыванию IntersectionObserver.
        this._stickyHeaderController.registerHandler(event, data, register, this._shadows.top?.isVisible, this._options.syncDomOptimization);
    }

    protected _headersResizeHandler(): void {
        const scrollbarOffsetTop = this._stickyHeaderController.getHeadersHeight(POSITION.TOP, TYPE_FIXED_HEADERS.initialFixed);
        const scrollbarOffsetBottom = this._stickyHeaderController.getHeadersHeight(POSITION.BOTTOM, TYPE_FIXED_HEADERS.initialFixed);
        // Обновляем скролбары только после наведения мышкой.
        this._scrollbars.setOffsets({ top: scrollbarOffsetTop, bottom: scrollbarOffsetBottom },
            this._isInitializationDelayed());
        if (this._scrollbars.vertical && this._scrollbars.vertical.isVisible && this._children.hasOwnProperty('scrollBar')) {
            this._children.scrollBar.setViewportSize(
                this._children.content.offsetHeight - scrollbarOffsetTop - scrollbarOffsetBottom);
        }
    }

    protected _stickyHeaderOffsetTopChangedHandler(): void {
        this._stickyHeaderController.resizeHandler();
    }

    getHeadersHeight(position: POSITION, type: TYPE_FIXED_HEADERS = TYPE_FIXED_HEADERS.initialFixed): number {
        return this._stickyHeaderController.getHeadersHeight(position, type);
    }
    // FIXME: костыль для input:Area, чтобы она напрямую в детей не лазала
    getScrollTop(): number {
        return this._children.content.scrollTop;
    }

    static _isCssShadowsSupported(): boolean {
        // Ie и Edge неправильно позиционируют фон со стилями
        // background-position: bottom и background-attachment: local
        return !detection.isMobileIOS && !detection.isIE;
    }

    static _theme: string[] = ['Controls/scroll'];

    static getOptionTypes(): object {
        return {
            ...ContainerBase.getOptionTypes(),

            topShadowVisibility: descriptor(String).oneOf([
                SHADOW_VISIBILITY.AUTO,
                SHADOW_VISIBILITY.HIDDEN,
                SHADOW_VISIBILITY.VISIBLE,
                'gridauto'
            ]),
            bottomShadowVisibility: descriptor(String).oneOf([
                SHADOW_VISIBILITY.AUTO,
                SHADOW_VISIBILITY.HIDDEN,
                SHADOW_VISIBILITY.VISIBLE,
                'gridauto'
            ]),
            shadowMode: descriptor(String).oneOf([
                SHADOW_MODE.CSS,
                SHADOW_MODE.JS,
                SHADOW_MODE.MIXED
            ])
        };
    }

    static getDefaultOptions(): object {
        return {
            ...ContainerBase.getDefaultOptions(),
            ...getScrollbarsDefaultOptions(),
            ...getShadowsDefaultOptions(),
            shadowStyle: 'default',
            backgroundStyle: DEFAULT_BACKGROUND_STYLE,
            syncDomOptimization: true
        };
    }
}
/**
 * @name Controls/_scroll/Container#content
 * @cfg {Content} Содержимое контейнера.
 */

/*
 * @name Controls/_scroll/Container#content
 * @cfg {Content} Container contents.
 */

/**
 * @name Controls/_scroll/Container#style
 * @cfg {String} Цветовая схема (цвета тени и скролла).
 * @variant normal Тема по умолчанию (для ярких фонов).
 * @variant inverted Преобразованная тема (для темных фонов).
 * @see backgroundStyle
 */

/*
 * @name Controls/_scroll/Container#style
 * @cfg {String} Color scheme (colors of the shadow and scrollbar).
 * @variant normal Default theme (for bright backgrounds).
 * @variant inverted Inverted theme (for dark backgrounds).
 */

/**
 * @name Controls/_scroll/Container#backgroundStyle
 * @cfg {String} Определяет префикс стиля для настройки элементов, которые зависят от цвета фона.
 * @default default
 * @demo Controls-demo/Scroll/Container/BackgroundStyle/Index
 * @see style
 */

/**
 * @typedef {String} TPagingModeScroll
 * @variant hidden Предназначен для отключения отображения пейджинга в реестре.
 * @variant basic Предназначен для пейджинга в реестре с подгрузкой по скроллу.
 * @variant edge Предназначен для пейджинга с отображением одной команды прокрутки. Отображается кнопка в конец, либо в начало, в зависимости от положения.
 * @variant end Предназначен для пейджинга с отображением одной команды прокрутки. Отображается только кнопка в конец.
 */

/**
 * @name Controls/_scroll/Container#pagingMode
 * @cfg {TPagingModeScroll} Определяет стиль отображения пэйджинга.
 * @default hidden
 * @demo Controls-demo/Scroll/Paging/Basic/Index
 * @demo Controls-demo/Scroll/Paging/Edge/Index
 * @demo Controls-demo/Scroll/Paging/End/Index
 */

/**
 * @name Controls/_scroll/Container#pagingContentTemplate
 * @cfg {Function} Опция управляет отображением произвольного шаблона внутри пэйджинга.
 * @demo Controls-demo/Scroll/Paging/ContentTemplate/Index
 */

/**
 * @name Controls/_scroll/Container#pagingPosition
 * @property {TPagingPosition} pagingPosition Опция управляет позицией пэйджинга.
 * @default right
 * @demo Controls-demo/Scroll/Paging/PositionLeft/Index
 */

/**
 * @name Controls/_scroll/Container#shadowStyle
 * @cfg {String} Определяет постфикс у класса тени
 * @default default
 */

/**
 * @name Controls/_scroll/Container#scrollOrientation
 * @cfg {String} Определяет направление скроллирования
 * @demo Controls-demo\Scroll\ScrollMode\Index
 * @default vertical
 * @variant vertical Скроллирование по вертикали
 * @variant horizontal Скроллирование по горизонтали
 * @variant verticalHorizontal Скроллирование по вертикали и по горизонтали
 */

Object.defineProperty(Container, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Container.getDefaultOptions();
   }
});
