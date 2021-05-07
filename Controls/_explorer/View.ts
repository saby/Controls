// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_explorer/View/View';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as cInstance from 'Core/core-instance';
import {EventUtils} from 'UI/Events';
import * as randomId from 'Core/helpers/Number/randomId';
import {constants} from 'Env/Env';
import {Logger} from 'UI/Utils';
import {Model} from 'Types/entity';
import {IItemPadding, IList, ListView} from 'Controls/list';
import {isEqual} from 'Types/object';
import {CrudEntityKey, DataSet, LOCAL_MOVE_POSITION} from 'Types/source';
import {
    IBasePageSourceConfig, IBaseSourceConfig,
    IDraggableOptions, IFilterOptions, IHeaderCell,
    IHierarchyOptions,
    INavigationOptions,
    INavigationOptionValue,
    INavigationOptionValue as INavigation,
    INavigationPageSourceConfig,
    INavigationPositionSourceConfig as IPositionSourceConfig,
    INavigationSourceConfig,
    ISelectionObject, ISortingOptions, ISourceOptions,
    TKey,
    IGridControl
} from 'Controls/interface';
import {JS_SELECTORS as EDIT_IN_PLACE_JS_SELECTORS} from 'Controls/editInPlace';
import {RecordSet} from 'Types/collection';
import {NewSourceController, Path} from 'Controls/dataSource';
import {SearchView, SearchViewTable} from 'Controls/searchBreadcrumbsGrid';
import {TreeGridView, TreeGridViewTable } from 'Controls/treeGrid';
import {SyntheticEvent} from 'UI/Vdom';
import {IDragObject} from 'Controls/_dragnDrop/Container';
import {ItemsEntity} from 'Controls/dragnDrop';
import {TExplorerViewMode} from 'Controls/_explorer/interface/IExplorer';
import {TreeControl} from 'Controls/tree';
import {IEditableListOption} from 'Controls/_list/interface/IEditableList';
import 'css!Controls/tile';
import 'css!Controls/explorer';
import { isFullGridSupport } from 'Controls/display';
import PathController from 'Controls/_explorer/PathController';
import {Object as EventObject} from "Env/Event";

const HOT_KEYS = {
    _backByPath: constants.key.backspace
};
const ITEM_TYPES = {
    node: true,
    hiddenNode: false,
    leaf: null
};
const DEFAULT_VIEW_MODE = 'table';

const VIEW_NAMES = {
    search: SearchView,
    tile: null,
    table: TreeGridView,
    list: ListView
};
const VIEW_TABLE_NAMES = {
    search: SearchViewTable,
    tile: null,
    table: TreeGridViewTable,
    list: ListView
};
const VIEW_MODEL_CONSTRUCTORS = {
    search: 'Controls/searchBreadcrumbsGrid:SearchGridCollection',
    tile: null,
    table: 'Controls/treeGrid:TreeGridCollection',
    list: 'Controls/treeGrid:TreeGridCollection'
};

const EXPLORER_CONSTANTS = {
    DEFAULT_VIEW_MODE,
    ITEM_TYPES,
    VIEW_NAMES,
    VIEW_MODEL_CONSTRUCTORS
};

interface IExplorerOptions
    extends
        IControlOptions,
        IHierarchyOptions,
        IDraggableOptions,
        IList,
        IEditableListOption,
        INavigationOptions<IBasePageSourceConfig>,
        IGridControl,
        ISourceOptions,
        IFilterOptions,
        ISortingOptions {
    root?: TKey;

    viewMode?: TExplorerViewMode;
    searchNavigationMode?: string;
    displayMode?: string;
    itemTemplate?: TemplateFunction;
    items?: RecordSet;
    itemOpenHandler?: Function;
    searchStartingWith?: 'root' | 'current';
    sourceController?: NewSourceController;
    useOldModel?: boolean;
    expandByItemClick?: boolean;
    /**
     * Задает режим вывода строки с хлебными крошками в результатах поиска
     *  * row - все ячейки строки с хлебными крошками объединяются в одну ячейку в которой выводятся хлебные крошки.
     *  * cell - ячейки строки с хлебными крошками не объединяются, выводятся в соответствии с заданной
     *  конфигурацией колонок. При таком режиме прикладной разработчик может задать кастомное содержимое для ячеек
     *  строки с хлебными крошками.
     */
    breadCrumbsMode?: 'row' | 'cell';
}

interface IMarkedKeysStore {
    [p: string]: { markedKey: TKey, parent?: TKey, cursorPosition?: unknown };
}

export default class Explorer extends Control<IExplorerOptions> {
    protected _template: TemplateFunction = template;
    protected _viewName: string;
    protected _viewMode: TExplorerViewMode;
    protected _viewModelConstructor: string;
    private _navigation: object;
    protected _itemTemplate: TemplateFunction;
    protected _groupTemplate: TemplateFunction;
    protected _notifyHandler: typeof EventUtils.tmplNotify = EventUtils.tmplNotify;
    protected _backgroundStyle: string;
    protected _header: object;
    protected _itemsReadyCallback: Function;
    protected _itemsSetCallback: Function;
    protected _itemPadding: object;
    protected _dragOnBreadCrumbs: boolean = false;
    protected _needSetMarkerCallback: (item: Model, domEvent: Event) => boolean;
    protected _breadCrumbsDragHighlighter: Function;
    protected _canStartDragNDrop: Function;
    protected _headerVisibility: string;
    protected _children: {
        treeControl: TreeControl,
        pathController: PathController
    };
    protected _dataLoadCallback: Function;

    /**
     * Идентификатор узла данные которого отображаются в текущий момент.
     */
    private _root: TKey = null;
    /**
     * Идентификатор самого верхнего корневого элемента.
     * Вычисляется на основании хлебных крошек либо на основании текущего root
     * если хлебные крошки отсутствуют.
     */
    private _topRoot: TKey;
    private _hoveredBreadCrumb: string;
    private _dragControlId: string;
    private _markerForRestoredScroll: TKey;
    private _resetScrollAfterViewModeChange: boolean = false;
    private _isMounted: boolean = false;
    // TODO: используется только в ф-ии _setViewMode, нет смысла хранить это промис
    private _setViewModePromise: Promise<void>;
    private _restoredMarkedKeys: IMarkedKeysStore;
    private _potentialMarkedKey: TKey;
    private _newItemPadding: IItemPadding;
    private _newItemTemplate: TemplateFunction;
    private _newBackgroundStyle: string;
    private _newHeader: IHeaderCell[];
    private _isGoingBack: boolean;
    // Восстановленное значение курсора при возврате назад по хлебным крошкам
    private _restoredCursor: unknown;
    private _pendingViewMode: TExplorerViewMode;

    private _items: RecordSet;
    private _isGoingFront: boolean;

    protected _beforeMount(cfg: IExplorerOptions): Promise<void> {
        if (cfg.itemPadding) {
            this._itemPadding = cfg.itemPadding;
        }
        if (cfg.itemTemplate) {
            this._itemTemplate = cfg.itemTemplate;
        }
        if (cfg.groupTemplate) {
            this._groupTemplate = cfg.groupTemplate;
        }
        if (cfg.backgroundStyle) {
            this._backgroundStyle = cfg.backgroundStyle;
        }
        if (cfg.header) {
            this._header = cfg.viewMode === 'tile' ? undefined : cfg.header;
        }

        this._itemsReadyCallback = this._itemsReadyCallbackFunc.bind(this);
        this._itemsSetCallback = this._itemsSetCallbackFunc.bind(this);
        this._canStartDragNDrop = this._canStartDragNDropFunc.bind(this);
        this._breadCrumbsDragHighlighter = this._dragHighlighter.bind(this);
        this._needSetMarkerCallback = (item: Model, domEvent: Event): boolean => {
            return !!(domEvent.target as HTMLElement).closest('.js-controls-ListView__checkbox')
                || item instanceof Array || item.get(this._options.nodeProperty) !== ITEM_TYPES.node;
        };
        this._onCollectionChange = this._onCollectionChange.bind(this);

        this._dragControlId = randomId();
        this._navigation = cfg.navigation;

        const root = this._getRoot(cfg.root);
        this._headerVisibility = this._getHeaderVisibility(root, cfg.headerVisibility);
        this._restoredMarkedKeys = {
            [root]: {
                markedKey: null
            }
        };

        // TODO: для 20.5100. в 20.6000 можно удалить
        if (cfg.displayMode) {
            Logger.error(`${this._moduleName}: Для задания многоуровневых хлебных крошек вместо displayMode используйте опцию breadcrumbsDisplayMode`, this);
        }

        return this._setViewMode(cfg.viewMode, cfg);
    }

    protected _afterMount(): void {
        this._isMounted = true;
    }

    protected _beforeUpdate(cfg: IExplorerOptions): void {
        const isViewModeChanged = cfg.viewMode !== this._options.viewMode;
        // Проверяем именно root в опциях
        // https://online.sbis.ru/opendoc.html?guid=4b67d75e-1770-4e79-9629-d37ee767203b
        const isRootChanged = cfg.root !== this._options.root;

        // Мы не должны ставить маркер до проваливания, т.к. это лишняя синхронизация.
        // Но если отменили проваливание, то нужно поставить маркер.
        if (this._potentialMarkedKey !== undefined && !isRootChanged) {
            this._children.treeControl.setMarkedKey(this._potentialMarkedKey);
        }
        this._potentialMarkedKey = undefined;

        const isSourceControllerLoading = cfg.sourceController && cfg.sourceController.isLoading();
        this._resetScrollAfterViewModeChange = isViewModeChanged && !isRootChanged;
        // Видимость заголовка зависит непосредственно от рута и от данных в нем.
        // Поэтому при смене рута мы не можем менять видимость прямо тут, нужно дождаться получения данных
        // иначе перерисовка может быть в два этапа. Например, показываем пустые результаты поиска в режиме
        // searchStartingWith === 'root', после сбрасываем поиск и возвращаем root в предыдущую папку после чего
        // этот код покажет заголовок и только после получения данных они отрисуются
        if (!isRootChanged) {
            this._headerVisibility = this._getHeaderVisibility(cfg.root, cfg.headerVisibility);
        }

        if (!isEqual(cfg.itemPadding, this._options.itemPadding)) {
            this._newItemPadding = cfg.itemPadding;
        }

        if (cfg.itemTemplate !== this._options.itemTemplate) {
            this._newItemTemplate = cfg.itemTemplate;
        }

        if (cfg.backgroundStyle !== this._options.backgroundStyle) {
            this._newBackgroundStyle = cfg.backgroundStyle;
        }

        if (cfg.header !== this._options.header || isViewModeChanged) {
            this._newHeader = cfg.viewMode === 'tile' ? undefined : cfg.header;
        }

        const navigationChanged = !isEqual(cfg.navigation, this._options.navigation);
        if (navigationChanged) {
            this._navigation = cfg.navigation;
        }

        if ((isViewModeChanged && isRootChanged && !cfg.sourceController) ||
            this._pendingViewMode && cfg.viewMode !== this._pendingViewMode) {
            // Если меняется и root и viewMode, не меняем режим отображения сразу,
            // потому что тогда мы перерисуем explorer в новом режиме отображения
            // со старыми записями, а после загрузки новых получим еще одну перерисовку.
            // Вместо этого запомним, какой режим отображения от нас хотят, и проставим
            // его, когда новые записи будут установлены в модель (itemsSetCallback).
            this._setPendingViewMode(cfg.viewMode, cfg);
        } else if (isViewModeChanged && !this._pendingViewMode) {
            // Также отложенно необходимо устанавливать viewMode, если при переходе с viewMode === "search" на "table"
            // или "tile" будет перезагрузка. Этот код нужен до тех пор, пока не будут спускаться данные сверху-вниз.
            // https://online.sbis.ru/opendoc.html?guid=f90c96e6-032c-404c-94df-cc1b515133d6
            const filterChanged = !isEqual(cfg.filter, this._options.filter);
            const recreateSource = cfg.source !== this._options.source ||
                (isSourceControllerLoading && this._options.viewMode === 'search');
            const sortingChanged = !isEqual(cfg.sorting, this._options.sorting);
            if ((filterChanged || recreateSource || sortingChanged || navigationChanged) && !cfg.sourceController) {
                this._setPendingViewMode(cfg.viewMode, cfg);
            } else {
                this._checkedChangeViewMode(cfg.viewMode, cfg);
            }
        } else if (!isViewModeChanged &&
            this._pendingViewMode &&
            cfg.viewMode === this._pendingViewMode &&
            cfg.sourceController) {
            // https://online.sbis.ru/opendoc.html?guid=7d20eb84-51d7-4012-8943-1d4aaabf7afe
            if (!VIEW_MODEL_CONSTRUCTORS[this._pendingViewMode]) {
                this._loadTileViewMode(cfg).then(() => {
                    this._setViewModeSync(this._pendingViewMode, cfg);
                });
            } else {
                this._setViewModeSync(this._pendingViewMode, cfg);
            }
        } else {
            this._applyNewVisualOptions();
        }
    }

    protected _beforeRender(): void {
        // Сбрасываем скролл при режима отображения
        // https://online.sbis.ru/opendoc.html?guid=d4099117-ef37-4cd6-9742-a7a921c4aca3
        if (this._resetScrollAfterViewModeChange) {
            this._notify('doScroll', ['top'], {bubbling: true});
            this._resetScrollAfterViewModeChange = false;
        }

    }

    protected _afterRender(): void {
        if (this._markerForRestoredScroll !== null) {
            this.scrollToItem(this._markerForRestoredScroll);
            this._markerForRestoredScroll = null;
        }
    }

    protected _beforeUnmount(): void {
        this._unsubscribeOnCollectionChange();
    }

    protected _documentDragEnd(event: SyntheticEvent, dragObject: IDragObject): void {
        if (this._hoveredBreadCrumb !== undefined) {
            this._notify('dragEnd', [dragObject.entity, this._hoveredBreadCrumb, 'on']);
        }
        this._dragOnBreadCrumbs = false;
    }

    protected _documentDragStart(event: SyntheticEvent, dragObject: IDragObject<ItemsEntity>): void {
        // TODO: Sometimes at the end of dnd, the parameter is not reset. Will be fixed by:
        //  https://online.sbis.ru/opendoc.html?guid=85cea965-2aa6-4f1b-b2a3-1f0d65477687
        this._hoveredBreadCrumb = undefined;

        if (
            this._options.itemsDragNDrop &&
            this._options.parentProperty &&
            cInstance.instanceOfModule(dragObject.entity, 'Controls/dragnDrop:ItemsEntity') &&
            dragObject.entity.dragControlId === this._dragControlId
        ) {
            // Принудительно показываем "домик" в хлебных крошках если находимся не в корневом узле
            // или не все перетаскиваемые итемы лежат в корне
            this._dragOnBreadCrumbs =
                this._getRoot(this._options.root) !== this._topRoot ||
                !this._dragItemsFromRoot(dragObject.entity.getItems());
        }
    }

    protected _hoveredCrumbChanged(event: SyntheticEvent, item: Model): void {
        this._hoveredBreadCrumb = item ? item.getKey() : undefined;

        // If you change hovered bread crumb, must be called installed in the breadcrumbs highlighter,
        // but is not called, because the template has no reactive properties.
        this._forceUpdate();
    }

    protected _onCollectionChange(
        event: EventObject,
        action: string,
        newItems: unknown[],
        newItemsIndex: number,
        oldItems: unknown[],
        oldItemsIndex: number,
        reason: string
    ): void {
        // После получения данных обновим видимость заголовка т.к. мы не можем это сделать на
        // beforeUpdate в следствии того, что между сменой root и получением данных есть задержка
        // и в противном случае перерисовка будет в два этапа, сначала обновится видимость заголовка,
        // а потом придут и отрисуются данные
        if (reason === 'assign') {
            this._updateHeaderVisibility();
        }
    }

    protected _updateHeaderVisibility(): void {
        const curRoot = this._options.sourceController
            ? this._options.sourceController.getRoot()
            : this._getRoot(this._options.root);
        this._headerVisibility = this._getHeaderVisibility(curRoot, this._options.headerVisibility);
    }

    protected _subscribeOnCollectionChange(): void {
        this._items.subscribe('onCollectionChange', this._onCollectionChange);
    }

    protected _unsubscribeOnCollectionChange(): void {
        if (this._items) {
            this._items.unsubscribe('onCollectionChange', this._onCollectionChange);
        }
    }

    protected _onItemClick(
        event: SyntheticEvent,
        item: Model|Model[],
        clickEvent: SyntheticEvent,
        columnIndex?: number
    ): boolean {
        if (item instanceof Array) {
            item = item[item.length - 1];
        }

        const res = this._notify('itemClick', [item, clickEvent, columnIndex]) as boolean;
        event.stopPropagation();

        const changeRoot = () => {
            this._setRoot(item.getKey());
            // При search не должны сбрасывать маркер, так как он встанет на папку
            if (this._options.searchNavigationMode !== 'expand') {
                this._isGoingFront = true;
            }

            // При проваливании нужно сбросить восстановленное значение курсора
            // иначе данные загрузятся не корректные
            if (
                this._isCursorNavigation(this._navigation) &&
                this._restoredCursor === this._navigation.sourceConfig.position
            ) {
                this._navigation.sourceConfig.position = null;
            }
        };

        // Не нужно проваливаться в папку, если должно начаться ее редактирование.
        // TODO: После перехода на новую схему редактирования это должен решать baseControl или treeControl.
        //    в данной реализации получается, что в дереве с возможностью редактирования не получится
        //    развернуть узел кликом по нему (expandByItemClick).
        //    https://online.sbis.ru/opendoc.html?guid=f91b2f96-d6e7-45d0-b929-a0030f0a2788
        const isNodeEditable = () => {
            const hasEditOnClick = !!this._options.editingConfig && !!this._options.editingConfig.editOnClick;
            return hasEditOnClick && !clickEvent.target.closest(`.${EDIT_IN_PLACE_JS_SELECTORS.NOT_EDITABLE}`);
        };

        const shouldHandleClick = res !== false && !isNodeEditable();

        if (shouldHandleClick) {
            const nodeType = item.get(this._options.nodeProperty);
            const isSearchMode = this._viewMode === 'search';

            // Проваливание возможно только в узел (ITEM_TYPES.node).
            // Проваливание невозможно, если по клику следует развернуть узел/скрытый узел.
            if (
                (!isSearchMode && this._options.expandByItemClick && nodeType !== ITEM_TYPES.leaf) ||
                (nodeType !== ITEM_TYPES.node)
            ) {
                return res;
            }

            // Если в списке запущено редактирование, то проваливаемся только после успешного завершения.
            if (!this._children.treeControl.isEditing()) {
                changeRoot();
            } else {
                this.commitEdit().then((result) => {
                    if (!(result && result.canceled)) {
                        changeRoot();
                    }
                    return result;
                });
            }

            // Проваливание в папку и попытка проваливания в папку не должны вызывать разворот узла.
            // Мы не можем провалиться в папку, пока на другом элементе списка запущено редактирование.
            return false;
        }

        return res;
    }

    /**
     * Обрабатываем изменение хлебных крошек от внутреннего DataContainer.
     * Сейчас хлебные крошки используются:
     *  * для вычисления topRoot
     *  * для вычисления id записи, которая должна быть помечена при возврате
     *  назад по хлебным крошкам.
     *
     * TODO: нужно подумать над вариантами избавления от breadcrumbs для этого функционала
     *  https://online.sbis.ru/opendoc.html?guid=b08d48ac-b6c2-4278-b48e-cb58618c7ffd
     */
    protected _onBreadcrumbsChanged(event: SyntheticEvent, breadcrumbs: Path): void {
        if (this._isGoingBack) {
            const curRoot = this._getRoot(this._options.root);

            if (this._restoredMarkedKeys[curRoot]) {
                this._potentialMarkedKey = this._restoredMarkedKeys[curRoot].markedKey;
            }
        }

        const parentProperty = this._options.parentProperty;
        this._topRoot = this._getTopRoot(breadcrumbs, parentProperty, this._options.root);

        // На основании новых данных заполним хранилище в котором хранятся идентификаторы
        // помеченных записей для каждого корня
        this._initMarkedKeys(
            this._getRoot(this._options.root),
            this._topRoot,
            breadcrumbs,
            parentProperty,
            this._options.navigation
        );
    }

    protected _onBreadCrumbsClick(event: SyntheticEvent, item: Model): void {
        const newRoot = item.getKey();
        const rootChanged = this._setRoot(newRoot);

        // Если смену root отменили, то и делать ничего не надо, т.к.
        // остаемся в текущей папке
        if (rootChanged === false) {
            return;
        }

        this._isGoingBack = true;

        // При переходе назад нужно проставить сохраненный маркер для этого корня.
        // По факту он конечно сейчас не проставится, но это вызовет событие об изменении
        // markerKey и если у прикладника был bind, то это обновит значение опции и все
        // последующие синхронизации будут идти с актуальным markedKey.
        // В противном случае setMarkedKey в itemsSetCallback может не сработать в этом же
        // цикле синхронизации если сверху был передан markedKey !== undefined. Т.к. в
        // BaseControl метод setMarkedKey проставляет маркер синхронно только если в опциях
        // не указан markedKey
        const markedKey = this._restoredMarkedKeys[newRoot].markedKey;
        if (markedKey) {
            this._children.treeControl.setMarkedKey(markedKey);
        }

        /**
         * Позиция скрола при выходе из папки восстанавливается через скроллирование к отмеченной записи.
         * Чтобы список мог восстановить позицию скрола по отмеченой записи, она должна быть в наборе данных.
         * Чтобы обеспечить ее присутствие, нужно загружать именно ту страницу, на которой она есть.
         * Восстановление работает только при курсорной навигации.
         *
         * Далее какой-то странный сценарий, непонятно на сколько он актуальный:
         * Если в момент возвращения из папки был изменен тип навигации, не нужно восстанавливать, иначе будут
         * смешаны опции курсорной и постраничной навигаций.
         */
        // Если загрузка данных осуществляется снаружи explorer и включена навигация по курсору,
        // то нужно восстановить курсор что бы тот, кто грузит данные сверху выполнил запрос с
        // корректным значением курсора
        if (this._isCursorNavigation(this._options.navigation)) {
            this._restoredCursor = this._restorePositionNavigation(newRoot);
        }
    }

    protected _onExternalKeyDown(event: SyntheticEvent): void {
        this._onExplorerKeyDown(event);
        if (!event.stopped && event._bubbling !== false) {
            this._children.treeControl.handleKeyDown(event);
        }
    }

    protected _onExplorerKeyDown(event: SyntheticEvent): void {
        // Хитрая система обработки нажатия клавиш.
        // В данном случае обрабатываем только Backspace, вызывая наш метод _backByPath,
        // в который первым аргументом придет null (4й аргумент ф-ии keysHandler),
        // а вторым объект события (1й аргумент ф-ии keysHandler)
        EventUtils.keysHandler(event, HOT_KEYS, this, null, false);
    }

    /**
     * Обработчик нажатия клавиши Backspace
     * @see _onExplorerKeyDown
     */
    protected _backByPath(scope: unknown, event: Event): void {
        this._children.pathController.goBack(event);
    }

    protected _onArrowClick(e: SyntheticEvent): void {
        const item = this._children.treeControl.getViewModel().getMarkedItem().getContents();
        this._notifyHandler(e, 'arrowClick', item);
    }

    scrollToItem(key: string | number, toBottom?: boolean): void {
        this._children.treeControl.scrollToItem(key, toBottom);
    }

    reloadItem(): Promise<unknown> {
        const treeControl = this._children.treeControl;
        return treeControl.reloadItem.apply(treeControl, arguments);
    }

    beginEdit(options: object): Promise<unknown> {
        return this._children.treeControl.beginEdit(options);
    }

    beginAdd(options: object): Promise<unknown> {
        return this._children.treeControl.beginAdd(options);
    }

    cancelEdit(): Promise<unknown> {
        return this._children.treeControl.cancelEdit();
    }

    commitEdit(): Promise<unknown> {
        return this._children.treeControl.commitEdit();
    }

    reload(keepScroll: boolean, sourceConfig: IBaseSourceConfig): Promise<unknown> {
        return this._children.treeControl.reload(keepScroll, sourceConfig);
    }

    getItems(): RecordSet {
        return this._children.treeControl.getItems();
    }

    // todo removed or documented by task:
    // https://online.sbis.ru/opendoc.html?guid=24d045ac-851f-40ad-b2ba-ef7f6b0566ac
    toggleExpanded(id: TKey): Promise<unknown> {
        return this._children.treeControl.toggleExpanded(id);
    }

    // region mover

    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<DataSet> {
        return this._children.treeControl.moveItems(selection, targetKey, position);
    }

    moveItemUp(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.treeControl.moveItemUp(selectedKey);
    }

    moveItemDown(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.treeControl.moveItemDown(selectedKey);
    }

    moveItemsWithDialog(selection: ISelectionObject): Promise<DataSet> {
        return this._children.treeControl.moveItemsWithDialog(selection);
    }

    // endregion mover

    // region remover

    removeItems(selection: ISelectionObject): Promise<void> {
        return this._children.treeControl.removeItems(selection);
    }

    removeItemsWithConfirmation(selection: ISelectionObject): Promise<void> {
        return this._children.treeControl.removeItemsWithConfirmation(selection);
    }

    // endregion remover

    /**
     * Возвращает идентификатор текущего корневого узла
     */
    protected _getRoot(newRoot?: TKey): TKey {
        return typeof newRoot !== 'undefined' ? newRoot : this._root;
    }

    private _dragHighlighter(itemKey: TKey, hasArrow: boolean): string {
        return this._dragOnBreadCrumbs && this._hoveredBreadCrumb === itemKey && itemKey !== 'dots'
            ? 'controls-BreadCrumbsView__dropTarget_' + (hasArrow ? 'withArrow' : 'withoutArrow') : '';
    }

    /**
     * Посылает событие о смене root и возвращает результат обработки этого события
     */
    private _setRoot(root: TKey, dataRoot: TKey = null): boolean {
        let result = true;

        if (!this._options.hasOwnProperty('root')) {
            this._root = root;
        }

        if (typeof this._options.itemOpenHandler === 'function') {
            this._options.itemOpenHandler(root, this._items, dataRoot);
        }

        if (this._isMounted) {
            result = this._notify('rootChanged', [root]);
        }

        this._forceUpdate();
        return result;
    }

    private _initMarkedKeys(
        root: TKey,
        topRoot: TKey,
        breadcrumbs: Path,
        parentProperty: string,
        navigation: INavigationOptionValue<INavigationPageSourceConfig>
    ): void {

        const store = this._restoredMarkedKeys = {
            [root]: {
                markedKey: null
            }
        } as IMarkedKeysStore;

        // Если хлебных крошек нет, то дальне идти нет смысла
        if (!breadcrumbs?.length) {
            return;
        }

        store[topRoot] = {
            markedKey: null
        };

        breadcrumbs?.forEach((crumb) => {
            const crumbKey = crumb.getKey();
            const parentKey = crumb.get(parentProperty);

            store[crumbKey] = {
                parent: parentKey,
                markedKey: null
            };

            if (store[parentKey]) {
                store[parentKey].markedKey = crumbKey;

                if (this._isCursorNavigation(navigation)) {
                    store[parentKey].cursorPosition = this._getCursorPositionFor(crumb, navigation);
                }
            }
        });
    }

    /**
     * На основании переданного root и значения опции headerVisibility вычисляет
     * итоговую видимость заголовка таблицы.
     *    * Если находимся в корне то видимость берем либо из headerVisibility
     *    либо проставляем 'hasdata'.
     *    * Если находимся не в корне, то заголовок всегда делаем видимым
     *    https://online.sbis.ru/doc/19106882-fada-47f7-96bd-516f9fb0522f
     */
    private _getHeaderVisibility(root: TKey, headerVisibility: string): string {
        return root === null ? (headerVisibility || 'hasdata') : 'visible';
    }

    private _itemsReadyCallbackFunc(items: RecordSet): void {
        if (this._items) {
            this._unsubscribeOnCollectionChange();
        }
        this._items = items;
        this._subscribeOnCollectionChange();
        this._updateHeaderVisibility();
        if (this._options.itemsReadyCallback) {
            this._options.itemsReadyCallback(items);
        }
    }

    private _itemsSetCallbackFunc(items: RecordSet, newOptions: IExplorerOptions): void {
        if (this._isGoingBack) {
            if (this._potentialMarkedKey) {
                this._children.treeControl.setMarkedKey(this._potentialMarkedKey);
                this._markerForRestoredScroll = this._potentialMarkedKey;
                this._potentialMarkedKey = undefined;
            }
            if (this._children.treeControl.isAllSelected()) {
                this._children.treeControl.clearSelection();
            }
            this._isGoingBack = false;
        }

        if (this._isGoingFront) {
            // Проверить. Возможно, больше этот код не нужен.
            // До перевода на наследование работало так:
            // 1. При входе в папку через хлебные крошки маркер контроллер устанавливал новую опцию
            // 2. baseControl стрелял событие markedKeyChanged, контрол-родитель(в кейсе - демка),
            // забиндивший опцию ловил его и менял у себя состояние.
            // 3. Происходил еще один цикл синхронизации, в котором старое и новое значение ключа разные.
            // 4. По иерархии, шло обновление treeControl, который тут устанавливал снова новый ключ
            // маркера - null (в itemsSetCallback от эксплорера).
            // 5. update доходит до BaseControl'a и ключ маркера устанавливается по новым опциям
            // (ключ папки в которую вошли).
            // [ ключ папки -> обновление бинда -> цикл -> treeControl: ключ null (itemsSetCallback) ->
            // baseControl: ключ по бинду ]

            // https://online.sbis.ru/opendoc.html?guid=fe8dec0c-8396-45d3-9609-6163eee40346
            // this._children.treeControl.setMarkedKey(null);

            // После перехода на наследование, между обновлением treeControl и baseControl разрыва нет, более того,
            // поменялся порядок апдейтов контролов. После перевода на наследование сначала обновляется BaseControl.
            this._isGoingFront = false;
        }

        if (this._pendingViewMode) {
            this._checkedChangeViewMode(this._pendingViewMode, this._options);
            this._pendingViewMode = null;
        }
    }

    private _setViewConfig(viewMode: TExplorerViewMode): void {
        if (isFullGridSupport()) {
            this._viewName = VIEW_NAMES[viewMode];
        } else {
            this._viewName = VIEW_TABLE_NAMES[viewMode];
        }
        this._viewModelConstructor = VIEW_MODEL_CONSTRUCTORS[viewMode];
    }

    private _setViewModeSync(viewMode: TExplorerViewMode, cfg: IExplorerOptions): void {
        this._viewMode = viewMode;
        this._setViewConfig(this._viewMode);
        this._applyNewVisualOptions();

        if (this._isMounted) {
            this._notify('viewModeChanged', [viewMode]);
        }
    }

    private _setViewMode(viewMode: TExplorerViewMode, cfg: IExplorerOptions): Promise<void> {
        if (viewMode === 'search' && cfg.searchStartingWith === 'root') {
            this._updateRootOnViewModeChanged(viewMode, cfg);
        }

        if (cfg.useOldModel && viewMode !== 'tile') {
            this._setViewModePromise = this._loadOldViewMode(cfg).then(() => {
                this._setViewModeSync(viewMode, cfg);
            });
        } else if (!VIEW_MODEL_CONSTRUCTORS[viewMode]) {
            this._setViewModePromise = this._loadTileViewMode(cfg).then(() => {
                this._setViewModeSync(viewMode, cfg);
            });
        } else {
            this._setViewModePromise = Promise.resolve();
            this._setViewModeSync(viewMode, cfg);
        }

        return this._setViewModePromise;
    }

    private _applyNewVisualOptions(): void {
        if (this._newItemPadding) {
            this._itemPadding = this._newItemPadding;
            this._newItemPadding = null;
        }
        if (this._newItemTemplate) {
            this._itemTemplate = this._newItemTemplate;
            this._newItemTemplate = null;
        }
        if (this._newBackgroundStyle) {
            this._backgroundStyle = this._newBackgroundStyle;
            this._newBackgroundStyle = null;
        }
        if (this._newHeader) {
            this._header = this._newHeader;
            this._newHeader = null;
        }
    }

    /**
     * Возвращает идентификатор самого верхнего известного корневого узла.
     */
    private _getTopRoot(breadcrumbs: Path, parentProperty: string, root: TKey): TKey {
        let result;

        // Если есть хлебные крошки, то получаем top root из них.
        // В противном случае просто возвращаем текущий root
        if (breadcrumbs?.length) {
            result = breadcrumbs[0].get(parentProperty);
        } else {
            result = this._getRoot(root);
        }

        return result;
    }

    /**
     * Вернет true если все перетаскиваемые итемы лежат в корне
     */
    private _dragItemsFromRoot(dragItems: TKey[]): boolean {
        let itemFromRoot = true;

        for (let i = 0; i < dragItems.length; i++) {
            const item = this._items.getRecordById(dragItems[i]);

            if (!item || item.get(this._options.parentProperty) !== this._topRoot) {
                itemFromRoot = false;
                break;
            }
        }

        return itemFromRoot;
    }

    private _loadTileViewMode(options: IExplorerOptions): Promise<void> {
        if (!options.useOldModel) {
            return new Promise((resolve) => {
                import('Controls/treeTile').then((tile) => {
                    VIEW_NAMES.tile = tile.TreeTileView;
                    VIEW_TABLE_NAMES.tile = tile.TreeTileView;
                    VIEW_MODEL_CONSTRUCTORS.tile = 'Controls/treeTile:TreeTileCollection';
                    resolve();
                }).catch((err) => {
                    Logger.error('Controls/_explorer/View: ' + err.message, this, err);
                });
            });
        } else {
            return new Promise((resolve) => {
                import('Controls/tileOld').then((tile) => {
                    VIEW_NAMES.tile = tile.TreeView;
                    VIEW_TABLE_NAMES.tile = tile.TreeView;
                    VIEW_MODEL_CONSTRUCTORS.tile = tile.TreeViewModel;
                    resolve();
                }).catch((err) => {
                    Logger.error('Controls/_explorer/View: ' + err.message, this, err);
                });
            });
        }
    }

    private _loadOldViewMode(options: IExplorerOptions): Promise<void> {
        return new Promise((resolve) => {
            import('Controls/treeGridOld').then((treeGridOld) => {
                VIEW_NAMES.table = treeGridOld.TreeGridView;
                VIEW_NAMES.search = treeGridOld.SearchView;
                VIEW_TABLE_NAMES.table = treeGridOld.TreeGridView;
                VIEW_TABLE_NAMES.search = treeGridOld.SearchView;

                VIEW_MODEL_CONSTRUCTORS.table = treeGridOld.ViewModel;
                VIEW_MODEL_CONSTRUCTORS.list = treeGridOld.ViewModel;
                VIEW_MODEL_CONSTRUCTORS.search = treeGridOld.SearchGridViewModel;
                resolve();
            }).catch((err) => {
                Logger.error('Controls/_explorer/View: ' + err.message, this, err);
            });
        });
    }

    private _canStartDragNDropFunc(): boolean {
        return this._viewMode !== 'search';
    }

    private _checkedChangeViewMode(viewMode: TExplorerViewMode, cfg: IExplorerOptions): void {
        this._setViewMode(viewMode, cfg)
            // Обрабатываем searchNavigationMode только после того как
            // проставится setViewMode, т.к. он может проставится асинхронно
            // а код ниже вызывает изменение версии модели что приводит к лишней
            // перерисовке до изменения viewMode
            .then(() => {
                if (cfg.searchNavigationMode !== 'expand') {
                    this._children.treeControl.resetExpandedItems();
                }
            });
    }

    private _isCursorNavigation(navigation: INavigation<INavigationSourceConfig>): boolean {
        return !!navigation && navigation.source === 'position';
    }

    /**
     * Собирает курсор для навигации относительно заданной записи.
     * @param item - запись, для которой нужно "собрать" курсор
     * @param positionNavigation - конфигурация курсорной навигации
     */
    private _getCursorPositionFor(
        item: Model,
        positionNavigation: INavigation<IPositionSourceConfig>
    ): IPositionSourceConfig['position'] {

        const position: unknown[] = [];
        const optField = positionNavigation.sourceConfig.field;
        const fields: string[] = (optField instanceof Array) ? optField : [optField];

        fields.forEach((field) => {
            position.push(item.get(field));
        });

        return position;
    }

    /**
     * Восстанавливает значение курсора для курсорной навигации при выходе из папки.
     * Одна из частей механизма сохранения позиции скролла и отмеченной записи
     * при проваливании в папку и выходе назад.
     *
     * @param rootId id узла в который возвращаемся
     */
    private _restorePositionNavigation(rootId: TKey): unknown {
        const rootInfo = this._restoredMarkedKeys[rootId];
        if (!rootInfo) {
            return;
        }

        let cursor;
        if (typeof rootInfo?.cursorPosition !== 'undefined') {
            cursor = rootInfo.cursorPosition;
        } else {
            cursor = this._options._navigation?.sourceConfig?.position;
        }

        this._navigation.sourceConfig.position = cursor || null;
        return cursor;
    }

    private _setPendingViewMode(viewMode: TExplorerViewMode, options: IExplorerOptions): void {
        this._pendingViewMode = viewMode;

        if (viewMode === 'search') {
            this._updateRootOnViewModeChanged(viewMode, options);
        }
    }

    private _updateRootOnViewModeChanged(viewMode: string, options: IExplorerOptions): void {
        if (viewMode === 'search' && options.searchStartingWith === 'root') {
            const currentRoot = this._getRoot(options.root);

            if (this._topRoot !== currentRoot) {
                this._setRoot(this._topRoot, this._topRoot);
            }
        }
    }

    static _constants: object = EXPLORER_CONSTANTS;

    static getDefaultOptions(): object {
        return {
            multiSelectVisibility: 'hidden',
            viewMode: DEFAULT_VIEW_MODE,
            backButtonIconStyle: 'primary',
            backButtonFontColorStyle: 'secondary',
            stickyHeader: true,
            searchStartingWith: 'root',
            showActionButton: false,
            isFullGridSupport: isFullGridSupport(),
            breadCrumbsMode: 'row'
        };
    }
}

Object.defineProperty(Explorer, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Explorer.getDefaultOptions();
    }
});

/**
 * Контрол "Иерархический проводник" позволяет отображать данные из различных источников данных в одном из четырех режимов: плоский список, дерево, плитка и поиск.
 * В режимах отображения "дерево" и "поиск" над контролом отображаются хлебные крошки, используемые для навигации по разделам.
 * В контроле можно включить поведение проваливания в узел, когда при клике по узлу — такой узел становится корнем иерархии.
 * При этом контрол будет отображать только содержимое выбранного узла.
 * Если для контрола настроена навигация, тогда после проваливания в узел начинает работать подгрузка дочерних элементов по скроллу.
 *
 * @remark
 * Сортировка применяется к запросу к источнику данных. Полученные от источника записи дополнительно не сортируются.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_explorer.less переменные тем оформления explorer}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_list.less переменные тем оформления list}
 *
 * @demo Controls-demo/Explorer/Explorer
 * @demo Controls-demo/Explorer/Search
 *
 * @class Controls/_explorer/View
 * @extends UI/Base:Control
 * @implements Controls/interface:IErrorController
 * @implements Controls/list:IReloadableList
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/ITreeGridItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/list:IList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/interface:IHierarchy
 * @implements Controls/tree:ITreeControl
 * @mixes Controls/explorer:IExplorer
 * @mixes Controls/interface:IDraggable
 * @mixes Controls/tile:ITile
 * @mixes Controls/list:IVirtualScrollConfig
 * @mixes Controls/interface/IGroupedGrid
 * @mixes Controls/grid:IGridControl
 * @mixes Controls/list:IClickableView
 * @mixes Controls/list:IMovableList
 * @mixes Controls/list:IRemovableList
 * @mixes Controls/marker:IMarkerList
 *
 * @public
 * @author Авраменко А.С.
 */

/*
 * Hierarchical list that can expand and go inside the folders. Can load data from data source.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExplorer%2FExplorer">Demo example</a>.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExplorer%2FSearch">Demo example with search</a>.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/explorer/'>here</a>.
 *
 * @class Controls/_explorer/View
 * @extends UI/Base:Control
 * @implements Controls/interface:IErrorController
 * @implements Controls/list:IReloadableList
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/ITreeGridItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/list:IList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/interface:IHierarchy
 * @implements Controls/tree:ITreeControl
 * @mixes Controls/explorer:IExplorer
 * @mixes Controls/interface:IDraggable
 * @mixes Controls/tile:ITile
 * @mixes Controls/list:IVirtualScrollConfig
 * @mixes Controls/interface/IGroupedGrid
 * @mixes Controls/grid:IGridControl
 * @mixes Controls/list:IClickableView
 * @mixes Controls/list:IMovableList
 * @mixes Controls/list:IRemovableList
 * @mixes Controls/marker:IMarkerList
 *
 * @public
 * @author Авраменко А.С.
 */

/**
 * @name Controls/_explorer/View#displayProperty
 * @cfg {string} Имя свойства элемента, содержимое которого будет отображаться.
 * @remark Поле используется для вывода хлебных крошек.
 * @example
 * <pre>
 * <Controls.explorers:View displayProperty="title">
 *     ...
 * </Controls.explorer:View>
 * </pre>
 */

/*
 * @name Controls/_explorer/View#displayProperty
 * @cfg {string} sets the property to be displayed in search results
 * @example
 * <pre class="brush:html">
 * <Controls.explorers:View
 *   ...
 *   displayProperty="title">
 *       ...
 * </Controls.explorer:View>
 * </pre>
 */

/**
 * @name Controls/_explorer/View#breadcrumbsDisplayMode
 * @cfg {Boolean} Отображение крошек в несколько строк {@link Controls/breadcrumbs:HeadingPath#displayMode}
 */

/**
 * @name Controls/_explorer/View#afterBreadCrumbsTemplate
 * @cfg {TemplateFunction|string} Пользовательский шаблон, который будет выведен справа от {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/breadcrumbs/ хлебных крошек}.
 */

/**
 * @name Controls/_explorer/View#tileItemTemplate
 * @cfg {String|TemplateFunction} Шаблон отображения элемента в режиме "Плитка".
 * @default undefined
 * @markdown
 * @remark
 * Позволяет установить пользовательский шаблон отображения элемента (**именно шаблон**, а не контрол!). При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/tile:ItemTemplate}.
 *
 * Также шаблон Controls/tile:ItemTemplate поддерживает {@link Controls/tile:ItemTemplate параметры}, с помощью которых можно изменить отображение элемента.
 *
 * В разделе "Примеры" показано как с помощью директивы {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial} задать пользовательский шаблон. Также в опцию tileItemTemplate можно передавать и более сложные шаблоны, которые содержат иные директивы, например {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-if ws:if}. В этом случае каждая ветка вычисления шаблона должна заканчиваться директивой ws:partial, которая встраивает Controls/tile:ItemTemplate.
 *
 * Дополнительно о работе с шаблоном вы можете прочитать в {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/item/ руководстве разработчика}.
 * @example
 * <pre class="brush: html;">
 * <Controls.explorer:View>
 *     <ws:tileItemTemplate>
 *         <ws:partial template="Controls/tile:ItemTemplate" highlightOnHover="{{false}}" />
 *     </ws:tileItemTemplate>
 * </Controls.explorer:View>
 * </pre>
 * @see itemTemplate
 * @see itemTemplateProperty
 */

/**
 * @name Controls/_explorer/View#tileGroupTemplate
 * @cfg {String|TemplateFunction} Шаблон отображения группы в режиме "Плитка".
 * @default undefined
 * @markdown@remark
 * Позволяет установить пользовательский шаблон отображения группы (**именно шаблон**, а не контрол!). При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/list:GroupTemplate}.
 * @example
 * <pre class="brush: html;">
 * <Controls.explorer:View>
 *     <ws:tileGroupTemplate>
 *         <ws:partial template="Controls/list:GroupTemplate"/>
 *     </ws:tileGroupTemplate>
 * </Controls.explorer:View>
 * </pre>
 * @see itemTemplate
 * @see itemTemplateProperty
 */

/**
 * @typedef {String} TBreadCrumbsMode
 * @variant row - все ячейки строки с хлебными крошками объединяются в одну ячейку в которой выводятся хлебные крошки.
 * @variant cell - ячейки строки с хлебными крошками не объединяются, выводятся в соответствии с заданной
 * конфигурацией колонок. При таком режиме прикладной разработчик может задать кастомное содержимое для ячеек
 * строки с хлебными крошками.
 */

/**
 * @name Controls/_explorer/View#breadCrumbsMode
 * @cfg {TBreadCrumbsMode} Задает режим вывода строки с хлебными крошками в результатах поиска
 * @default row
 * @markdown
 * @remark
 * Данная опция позволяет сконфигурировать вывод строки с хлебными крошками. Возможны 2 варианта:
 * <ul>
 *     <li>row - все ячейки строки с хлебными крошками объединяются в одну ячейку в которой выводятся хлебные крошки.</li>
 *     <li>cell - ячейки строки с хлебными крошками не объединяются, выводятся в соответствии с заданной
 * конфигурацией колонок. При таком режиме прикладной разработчик может задать кастомное содержимое для ячеек
 * строки с хлебными крошками.</li>
 * </ul>
 */

/**
 * @event Происходит при клике на кнопку "Просмотр записи".
 * @name Controls/_explorer/View#arrowClick
 * @remark Кнопка отображается при наведении курсора на текущую папку хлебных крошек. Отображение кнопки "Просмотр записи" задаётся с помощью опции {@link Controls/_explorer/interface/IExplorer#showActionButton}. По умолчанию кнопка скрыта.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */
