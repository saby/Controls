import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_explorer/View/View';
import * as cInstance from 'Core/core-instance';
import {EventUtils} from 'UI/Events';
import * as randomId from 'Core/helpers/Number/randomId';
import {SearchGridViewModel, SearchView, TreeGridView, ViewModel as TreeGridViewModel} from 'Controls/treeGrid';
import {constants} from 'Env/Env';
import {Logger} from 'UI/Utils';
import {Model} from 'Types/entity';
import {ListView} from 'Controls/list';
import {isEqual} from 'Types/object';
import {DataSet} from 'Types/source';
import {
    INavigationSourceConfig,
    INavigationPositionSourceConfig as IPositionSourceConfig,
    INavigationOptionValue as INavigation
} from 'Controls/interface';
import {JS_SELECTORS as EDIT_IN_PLACE_JS_SELECTORS} from 'Controls/editInPlace';
import {ISelectionObject} from 'Controls/interface';
import {CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {calculatePath} from 'Controls/dataSource';
import {SearchView as SearchViewNew} from 'Controls/searchBreadcrumbsGrid';
import {TreeGridView as TreeGridViewNew} from 'Controls/treeGridNew';

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
const VIEW_MODEL_CONSTRUCTORS = {
    search: SearchGridViewModel,
    tile: null,
    table: TreeGridViewModel,
    list: TreeGridViewModel
};
const USE_NEW_MODEL_VALUES = {
    search: false,
    tile: false,
    table: false,
    list: false
};
const VIEW_NAMES_NEW = {
    search: SearchViewNew,
    tile: null,
    table: TreeGridViewNew,
    list: ListView
};
const VIEW_MODEL_CONSTRUCTORS_NEW = {
    search: 'Controls/searchBreadcrumbsGrid:SearchGridCollection',
    tile: null,
    table: 'Controls/treeGrid:TreeGridCollection',
    list: 'Controls/treeGrid:TreeGridCollection'
};
const USE_NEW_MODEL_VALUES_NEW = {
    search: true,
    tile: true,
    table: true,
    list: true
};

const EXPLORER_CONSTANTS = {
    DEFAULT_VIEW_MODE: DEFAULT_VIEW_MODE,
    ITEM_TYPES: ITEM_TYPES,
    VIEW_NAMES: VIEW_NAMES,
    VIEW_MODEL_CONSTRUCTORS: VIEW_MODEL_CONSTRUCTORS
};

export default class Explorer extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _breadCrumbsItems: object[];
    protected _viewName: string;
    protected _viewMode: string;
    protected _viewModelConstructor: string;
    protected _navigation: object;
    protected _itemTemplate: TemplateFunction;
    protected _notifyHandler: EventUtils.tmplNotify = EventUtils.tmplNotify;
    protected _backgroundStyle: string;
    protected _header: object;
    protected _dataLoadErrback: Function;
    protected _serviceDataLoadCallback: Function;
    protected _itemsReadyCallback: Function;
    protected _itemsSetCallback: Function;
    protected _itemPadding: object;

    private _root: number = null;
    private _dragOnBreadCrumbs: boolean = false;
    private _hoveredBreadCrumb: string;
    private _dragControlId: string;
    private _itemsPromise: Promise<void>;
    private _markerForRestoredScroll: string;
    private _resetScrollAfterViewModeChange: boolean = false;
    private _isMounted: boolean = false;
    private _setViewModePromise: Promise<void>;
    private _firstLoad: boolean = true;
    private _needSetMarkerCallback: (item: Model, domEvent: any) => boolean;
    private _breadCrumbsDragHighlighter: any;
    private _updateHeadingPath: any;
    private _canStartDragNDrop: any;
    private _restoredMarkedKeys: { [p: string]: { markedKey: null } };
    private _headerVisibility: string;
    private _potentialMarkedKey: undefined;
    private _newItemPadding: any;
    private _newItemTemplate: any;
    private _newBackgroundStyle: any;
    private _newHeader: undefined;
    private _isGoingBack: boolean;
    private _pendingViewMode: string;
    private _dataRoot: undefined;
    private _itemsResolver: any;
    private _items: any;
    private _isGoingFront: boolean;

    protected _beforeMount(cfg): Promise<void> {
        if (cfg.itemPadding) {
            this._itemPadding = cfg.itemPadding;
        }
        if (cfg.itemTemplate) {
            this._itemTemplate = cfg.itemTemplate;
        }
        if (cfg.backgroundStyle) {
            this._backgroundStyle = cfg.backgroundStyle;
        }
        if (cfg.header) {
            this._header = cfg.viewMode === 'tile' ? undefined : cfg.header;
        }
        this._dataLoadErrback = this._dataLoadErrbackHandler.bind(this, cfg);
        this._serviceDataLoadCallback = this._serviceDataLoadCallbackFunc.bind(this);
        this._itemsReadyCallback = this._itemsReadyCallbackFunc.bind(this);
        this._itemsSetCallback = this._itemsSetCallbackFunc.bind(this);
        this._canStartDragNDrop = this._canStartDragNDropFunc.bind(this);
        this._updateHeadingPath = this._updateHeadingPathFunc.bind(this);
        this._breadCrumbsDragHighlighter = this._dragHighlighter.bind(this);
        this._needSetMarkerCallback = (item: Model, domEvent: any): boolean => {
            return domEvent.target.closest('.js-controls-ListView__checkbox')
                || item instanceof Array || item.get(this._options.nodeProperty) !== ITEM_TYPES.node;
        };

        this._itemsPromise = new Promise((res) => {
            this._itemsResolver = res;
        });
        if (!cfg.source || (cfg.sourceController && cfg.sourceController.getLoadError())) {
            this._resolveItemsPromise();
        }
        const root = this._getRoot(cfg.root);
        this._restoredMarkedKeys = {
            [root]: {
                markedKey: null
            }
        };

        this._headerVisibility = root === null ? cfg.headerVisibility || 'hasdata' : 'visible';

        // TODO: для 20.5100. в 20.6000 можно удалить
        if (cfg.displayMode) {
            Logger.error(`${this._moduleName}: Для задания многоуровневых хлебных крошек вместо displayMode используйте опцию breadcrumbsDisplayMode`, this);
        }

        this._dragControlId = randomId();
        this._navigation = cfg.navigation;
        return this._setViewMode(cfg.viewMode, cfg);
    }

    protected _afterMount(): void {
        this._isMounted = true;
    }

    protected _beforeUpdate(cfg): void {
        const isViewModeChanged = cfg.viewMode !== this._options.viewMode;
        const isRootChanged = cfg.root !== this._options.root;

        // Мы не должны ставить маркер до проваливания, т.к. это лишняя синхронизация.
        // Но если отменили проваливание, то нужно поставить маркер.
        if (this._potentialMarkedKey !== undefined && !isRootChanged) {
            this._children.treeControl.setMarkedKey(this._potentialMarkedKey);
        }
        this._potentialMarkedKey = undefined;

        const isSourceControllerLoading = cfg.sourceController && cfg.sourceController.isLoading();
        this._resetScrollAfterViewModeChange = isViewModeChanged && !isRootChanged;
        this._headerVisibility = cfg.root === null ? cfg.headerVisibility || 'hasdata' : 'visible';

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
        /*
        * Позиция скрола при выходе из папки восстанавливается через скроллирование к отмеченной записи.
        * Чтобы список мог восстановить позицию скрола по отмеченой записи, она должна быть в наборе данных.
        * Чтобы обеспечить ее присутствие, нужно загружать именно ту страницу, на которой она есть.
        * Восстановление работает только при курсорной навигации.
        * Если в момент возвращения из папки был изменен тип навигации, не нужно восстанавливать, иначе будут смешаны опции
        * курсорной и постраничной навигаций.
        * */
        const navigationChanged = !isEqual(cfg.navigation, this._options.navigation);

        if (this._isGoingBack && this._isCursorNavigation(this._options.navigation) && !navigationChanged) {
            const newRootId = this._getRoot(this._options.root);
            this._restorePositionNavigation(newRootId);
        } else if (navigationChanged) {
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
            const recreateSource = cfg.source !== this._options.source || (isSourceControllerLoading && this._options.viewMode === 'search');
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

    protected _componentDidUpdate(): void {
        if (this._markerForRestoredScroll !== null) {
            this.scrollToItem(this._markerForRestoredScroll);
            this._markerForRestoredScroll = null;
        }
    }

    protected _documentDragEnd(event, dragObject): void {
        if (this._hoveredBreadCrumb !== undefined) {
            this._notify('dragEnd', [dragObject.entity, this._hoveredBreadCrumb, 'on']);
        }
        this._dragOnBreadCrumbs = false;
    }

    protected _documentDragStart(event, dragObject): void {
        //TODO: Sometimes at the end of dnd, the parameter is not reset. Will be fixed by: https://online.sbis.ru/opendoc.html?guid=85cea965-2aa6-4f1b-b2a3-1f0d65477687
        this._hoveredBreadCrumb = undefined;

        if (
            this._options.itemsDragNDrop &&
            this._options.parentProperty &&
            cInstance.instanceOfModule(dragObject.entity, 'Controls/dragnDrop:ItemsEntity') &&
            dragObject.entity.dragControlId === this._dragControlId
        ) {
            //No need to show breadcrumbs when dragging items from the root, being in the root of the registry.
            this._dragOnBreadCrumbs = this._getRoot(this._options.root) !== this._getDataRoot(this._options) || !this._dragItemsFromRoot(dragObject.entity.getItems());
        }
    }

    protected _hoveredCrumbChanged(event, item): void {
        this._hoveredBreadCrumb = item ? item.getId() : undefined;

        // If you change hovered bread crumb, must be called installed in the breadcrumbs highlighter,
        // but is not called, because the template has no reactive properties.
        this._forceUpdate();
    }

    protected _onItemClick(event, item, clickEvent, columnIndex?: number): boolean {
        const res = this._notify('itemClick', [item, clickEvent, columnIndex]);
        event.stopPropagation();

        const changeRoot = () => {
            this._setRoot(item.getId());
            // При search не должны сбрасывать маркер, так как он встанет на папку
            if (this._options.searchNavigationMode !== 'expand') {
                this._isGoingFront = true;
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
            if ((!isSearchMode && this._options.expandByItemClick && nodeType !== ITEM_TYPES.leaf) || (nodeType !== ITEM_TYPES.node)) {
                return res;
            }

            // При проваливании ОБЯЗАТЕЛЬНО дополняем restoredKeyObject узлом, в который проваливаемся.
            // Дополнять restoredKeyObject нужно СИНХРОННО, иначе на момент вызова restoredKeyObject опции уже будут
            // новые и маркер запомнится не для того root'а. Ошибка:
            // https://online.sbis.ru/opendoc.html?guid=38d9ca66-7088-4ad4-ae50-95a63ae81ab6
            this._setRestoredKeyObject(item);

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

    protected _onBreadCrumbsClick(event, item): void {
        this._cleanRestoredKeyObject(item.getId());
        this._setRoot(item.getId());
        this._isGoingBack = true;
    }

    protected _onExternalKeyDown(event): void {
        this._onExplorerKeyDown(event);
        if (!event.stopped && event._bubbling !== false) {
            this._children.treeControl.handleKeyDown(event);
        }
    }

    protected _onExplorerKeyDown(event): void {
        EventUtils.keysHandler(event, HOT_KEYS, this, this);
    }

    protected _onArrowClick(e): void {
        let item = this._children.treeControl.getViewModel().getMarkedItem().getContents();
        this._notifyHandler(e, 'arrowClick', item);
    }

    scrollToItem(key: string | number, toBottom: boolean): void {
        this._children.treeControl.scrollToItem(key, toBottom);
    }

    reloadItem(): Promise<unknown> {
        let treeControl = this._children.treeControl;
        return treeControl.reloadItem.apply(treeControl, arguments);
    }

    beginEdit(options): Promise<unknown> {
        return this._children.treeControl.beginEdit(options);
    }

    beginAdd(options): Promise<unknown> {
        return this._children.treeControl.beginAdd(options);
    }

    cancelEdit(): Promise<unknown> {
        return this._children.treeControl.cancelEdit();
    }

    commitEdit(): Promise<unknown> {
        return this._children.treeControl.commitEdit();
    }

    reload(keepScroll, sourceConfig): Promise<unknown> {
        return this._children.treeControl.reload(keepScroll, sourceConfig);
    }

    getItems(): RecordSet {
        return this._children.treeControl.getItems();
    }

    // todo removed or documented by task:
    // https://online.sbis.ru/opendoc.html?guid=24d045ac-851f-40ad-b2ba-ef7f6b0566ac
    toggleExpanded(id): Promise<unknown> {
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

    private _resolveItemsPromise(): void {
        this._itemsResolver();
    }

    protected _getRoot(newRoot?: number): number {
        return typeof newRoot !== 'undefined' ? newRoot : this._root;
    }

    private _dragHighlighter(itemKey, hasArrow): string {
        return this._dragOnBreadCrumbs && this._hoveredBreadCrumb === itemKey && itemKey !== 'dots'
            ? 'controls-BreadCrumbsView__dropTarget_' + (hasArrow ? 'withArrow' : 'withoutArrow') : '';
    }

    private _updateHeadingPathFunc(): void {
        this._breadCrumbsItems = calculatePath(this._items).path;
    }

    private _setRoot(root, dataRoot = null): void {
        if (!this._options.hasOwnProperty('root')) {
            this._root = root;
        } else {
            this._potentialMarkedKey = root;
        }
        if (typeof this._options.itemOpenHandler === 'function') {
            this._options.itemOpenHandler(root, this._items, dataRoot);
        }
        this._notify('rootChanged', [root]);
        this._forceUpdate();
    }

    private _setRestoredKeyObject(root): void {
        const curRoot = this._getRoot(this._options.root);
        const rootId = root.getId();
        this._restoredMarkedKeys[rootId] = {
            parent: curRoot,
            markedKey: null
        };
        if (this._restoredMarkedKeys[curRoot]) {
            this._restoredMarkedKeys[curRoot].markedKey = rootId;

            if (this._isCursorNavigation(this._options.navigation)) {
                this._restoredMarkedKeys[curRoot].cursorPosition = this._getCursorPositionFor(root, this._options.navigation);
            }
        }
    }

    private _cleanRestoredKeyObject(root): void {
        this._pathCleaner(root);
    }

    private _pathCleaner(root) {
        const self = this;
        if (this._restoredMarkedKeys[root]) {
            if (this._restoredMarkedKeys[root].parent === undefined) {
                const markedKey = this._restoredMarkedKeys[root].markedKey;
                const cursorPosition = this._restoredMarkedKeys[root].cursorPosition;
                this._restoredMarkedKeys = {
                    [root]: {
                        markedKey: markedKey,
                        cursorPosition: cursorPosition
                    }
                };
                return;
            } else {
                _remover(root);
            }
        } else {
            const curRoot = this._getRoot(this._options.root);
            if (root !== curRoot) {
                delete this._restoredMarkedKeys[curRoot];
            }
        }

        function _remover(key) {
            Object.keys(self._restoredMarkedKeys).forEach((cur) => {
                if (self._restoredMarkedKeys[cur] && String(self._restoredMarkedKeys[cur].parent) === String(key)) {
                    const nextKey = cur;
                    delete self._restoredMarkedKeys[cur];
                    _remover(nextKey);
                }
            });
        }
    }

    private _resolveItemsOnFirstLoad(resolver, result): void {
        if (this._firstLoad) {
            resolver(result);
            this._firstLoad = false;
            this._fillRestoredMarkedKeysByBreadCrumbs(
                this._getDataRoot(this._options),
                this._breadCrumbsItems,
                this._restoredMarkedKeys,
                this._options.parentProperty,
                this._options.navigation
            );
        }
    }

    private _dataLoadErrbackHandler(cfg, error): void {
        this._resolveItemsOnFirstLoad(this._itemsResolver, null);
        if (cfg.dataLoadErrback) {
            cfg.dataLoadErrback(error);
        }
    }

    private _serviceDataLoadCallbackFunc(oldData, newData): void {
        this._breadCrumbsItems = calculatePath(newData).path;
        this._dataRoot = this._breadCrumbsItems && this._breadCrumbsItems.length ?
            this._getDataRoot(this._options) :
            this._dataRoot;
        this._resolveItemsOnFirstLoad(this._itemsResolver, this._breadCrumbsItems);
        this._updateSubscriptionOnBreadcrumbs(oldData, newData, this._updateHeadingPath);
    }

    private _fillRestoredMarkedKeysByBreadCrumbs(root, breadCrumbs, restoredMarkedKeys, parentProperty, navigation): void {
        restoredMarkedKeys[root] = {
            markedKey: null
        };
        if (breadCrumbs && breadCrumbs.forEach) {
            breadCrumbs.forEach((crumb) => {
                const parentKey = crumb.get(parentProperty);
                const crumbKey = crumb.getKey();
                restoredMarkedKeys[crumbKey] = {
                    parent: parentKey,
                    markedKey: null
                };
                if (restoredMarkedKeys[parentKey]) {
                    restoredMarkedKeys[parentKey].markedKey = crumbKey;

                    if (this._isCursorNavigation(navigation)) {
                        restoredMarkedKeys[parentKey].cursorPosition = this._getCursorPositionFor(crumb, navigation);
                    }
                }
            });
        }
    }

    private _itemsReadyCallbackFunc(items): void {
        this._items = items;
        if (this._options.itemsReadyCallback) {
            this._options.itemsReadyCallback(items);
        }
    }

    private _itemsSetCallbackFunc(items, newOptions): void {
        if (this._isGoingBack) {
            const options = newOptions || this._options;
            const curRoot = this._getRoot(options.root);
            if (this._restoredMarkedKeys[curRoot]) {
                const {markedKey} = this._restoredMarkedKeys[curRoot];
                this._children.treeControl.setMarkedKey(markedKey);
                this._markerForRestoredScroll = markedKey;
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
            // 5. update доходит до BaseControl'a и ключ маркера устанавливается по новым опциям(ключ папки в которую вошли).
            // [ ключ папки -> обновление бинда -> цикл -> treeControl: ключ null (itemsSetCallback) -> baseControl: ключ по бинду ]

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

    private _setViewConfig(viewMode, useNewModel): void {
        // todo useNewModel - это ветка, к котой стремимся, условие (и всё что в else) можно убрать, когда везде
        // будет использоваться Controls/explorer:View на новой модели
        if (useNewModel) {
            this._viewName = VIEW_NAMES_NEW[viewMode];
            this._useNewModel = USE_NEW_MODEL_VALUES_NEW[viewMode];
            this._viewModelConstructor = VIEW_MODEL_CONSTRUCTORS_NEW[viewMode];
        } else {
            this._viewName = VIEW_NAMES[viewMode];
            this._useNewModel = USE_NEW_MODEL_VALUES[viewMode];
            this._viewModelConstructor = VIEW_MODEL_CONSTRUCTORS[viewMode];
        }
    }

    private _setViewModeSync(viewMode, cfg): void {
        this._viewMode = viewMode;
        this._setViewConfig(this._viewMode, cfg.useNewModel);
        this._applyNewVisualOptions();

        if (this._isMounted) {
            this._notify('viewModeChanged', [viewMode]);
        }
    }

    private _setViewMode(viewMode, cfg): Promise<void> {
        if (viewMode === 'search' && cfg.searchStartingWith === 'root') {
            this._updateRootOnViewModeChanged(viewMode, cfg);
            this._breadCrumbsItems = null;
        }

        if (!VIEW_MODEL_CONSTRUCTORS[viewMode]) {
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

    private _getDataRoot(options): string {
        var result;

        if (this._breadCrumbsItems && this._breadCrumbsItems.length > 0) {
            result = this._breadCrumbsItems[0].get(this._options.parentProperty);
        } else {
            result = this._getRoot(options.root);
        }

        return result;
    }

    private _dragItemsFromRoot(dragItems): boolean {
        var
            item,
            itemFromRoot = true,
            root = this._getDataRoot(this._options);

        for (var i = 0; i < dragItems.length; i++) {
            item = this._items.getRecordById(dragItems[i]);
            if (!item || item.get(this._options.parentProperty) !== root) {
                itemFromRoot = false;
                break;
            }
        }

        return itemFromRoot;
    }

    private _loadTileViewMode(options: any): Promise<void> {
        if (options.useNewModel) {
            return new Promise((resolve) => {
                import('Controls/treeTile').then((tile) => {
                    VIEW_NAMES_NEW.tile = tile.TreeTileView;
                    VIEW_MODEL_CONSTRUCTORS_NEW.tile = 'Controls/treeTile:TreeTileCollection';
                    resolve(tile);
                }).catch((err) => {
                    Logger.error('Controls/_explorer/View: ' + err.message, this, err);
                });
            });
        } else {
            return new Promise((resolve) => {
                import('Controls/tile').then((tile) => {
                    VIEW_NAMES.tile = tile.TreeView;
                    VIEW_MODEL_CONSTRUCTORS.tile = tile.TreeViewModel;
                    resolve(tile);
                }).catch((err) => {
                    Logger.error('Controls/_explorer/View: ' + err.message, this, err);
                });
            });
        }
    }

    private _canStartDragNDropFunc(): boolean {
        return this._viewMode !== 'search';
    }

    private _updateSubscriptionOnBreadcrumbs(oldItems, newItems, updateHeadingPathCallback): void {
        const getPathRecordSet = (items) => items && items.getMetaData() && items.getMetaData().path;
        const oldPath = getPathRecordSet(oldItems);
        const newPath = getPathRecordSet(newItems);

        if (oldItems !== newItems || oldPath !== newPath) {
            if (oldPath && oldPath.getCount) {
                oldPath.unsubscribe('onCollectionItemChange', updateHeadingPathCallback);
            }
            if (newPath && newPath.getCount) {
                newPath.subscribe('onCollectionItemChange', updateHeadingPathCallback);
            }
        }
    }

    private _checkedChangeViewMode(viewMode: string, cfg): void {
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

    protected _backByPath(self): void {
        if (self._breadCrumbsItems && self._breadCrumbsItems.length > 0) {
            self._isGoingBack = true;
            self._setRoot(self._breadCrumbsItems[self._breadCrumbsItems.length - 1].get(self._options.parentProperty));
        }
    }

    private _isCursorNavigation(navigation: INavigation<INavigationSourceConfig>): boolean {
        return !!navigation && navigation.source === 'position';
    }

    /**
     * Собирает курсор для навигации относительно заданной записи.
     * @param item - запись, для которой нужно "собрать" курсор
     * @param positionNavigation - конфигурация курсорной навигации
     */
    private _getCursorPositionFor(item: Model,
                                  positionNavigation: INavigation<IPositionSourceConfig>): IPositionSourceConfig['position'] {
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
     * Одна из частей механизма сохранения позиции скролла и отмеченной записи при проваливании в папку и выходе назад.
     *
     * @param itemId id узла из которого выходим
     */
    private _restorePositionNavigation(itemId): void {
        const hasRestoreDataForCurrent = !!this._restoredMarkedKeys[itemId];
        if (hasRestoreDataForCurrent) {
            const parentId = this._restoredMarkedKeys[itemId].parent;
            const restoreDataForParent = this._restoredMarkedKeys[parentId];
            if (restoreDataForParent && typeof restoreDataForParent.cursorPosition !== 'undefined') {
                this._navigation.sourceConfig.position = restoreDataForParent.cursorPosition;
            } else {
                const fromOptions = this._options._navigation &&
                    this._options._navigation.sourceConfig && this._options._navigation.sourceConfig.position;
                this._navigation.sourceConfig.position = fromOptions || null;
            }
        }
    }

    private _setPendingViewMode(viewMode: string, options): void {
        this._pendingViewMode = viewMode;

        if (viewMode === 'search') {
            this._updateRootOnViewModeChanged(viewMode, options);
        }
    }

    private _updateRootOnViewModeChanged(viewMode: string, options): void {
        if (viewMode === 'search' && options.searchStartingWith === 'root') {
            const currentRoot = this._getRoot(options.root);
            const dataRoot = this._dataRoot !== undefined ? this._dataRoot : this._getDataRoot(options);

            if (dataRoot !== currentRoot) {
                this._setRoot(dataRoot, dataRoot);
            }
        }
    }

    static _constants: object = EXPLORER_CONSTANTS;

    static _theme: string[] = ['Controls/explorer', 'Controls/tile'];

    static getDefaultOptions(): object {
        return {
            multiSelectVisibility: 'hidden',
            viewMode: DEFAULT_VIEW_MODE,
            backButtonIconStyle: 'primary',
            backButtonFontColorStyle: 'secondary',
            stickyHeader: true,
            searchStartingWith: 'root',
            showActionButton: false
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
 * Контрол "Иерархический проводник".
 * Отображает данные иерархического списка, узел которого можно развернуть и перейти в него.
 * Позволяет переключать отображение элементов в режимы "таблица", "список" и "плитка".
 *
 * @remark
 * Сортировка применяется к запросу к источнику данных. Полученные от источника записи дополнительно не сортируются.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_explorer.less переменные тем оформления explorer}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less переменные тем оформления list}
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
 * @mixes Controls/itemActions:IItemActionsOptions
 * @mixes Controls/interface:IHierarchy
 * @implements Controls/tree/ITreeControlOptions
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
 * @mixes Controls/itemActions:IItemActionsOptions
 * @mixes Controls/interface:IHierarchy
 * @implements Controls/tree/ITreeControlOptions
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
 * Дополнительно о работе с шаблоном вы можете прочитать в {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/templates/ руководстве разработчика}.
 * @example
 * <pre class="brush: html;">
 * <Controls.explorer:View>
 *     <ws:tileItemTemplate>
 *         <ws:partial template="Controls/tile:ItemTemplate" highlightOnHover="{{false}}" />
 *     </ws:tileItemTemplate>
 * </Controls.explorer:View>
 * </pre>
 * @see itemTemplate
 * @see itemTemplateProprty
 */
/**
 * @event Происходит при клике на кнопку "Просмотр записи".
 * @name Controls/_explorer/View#arrowClick
 * @remark Кнопка отображается при наведении курсора на текущую папку хлебных крошек. Отображение кнопки "Просмотр записи" задаётся с помощью опции {@link Controls/_explorer/interface/IExplorer#showActionButton}. По умолчанию кнопка скрыта.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */
