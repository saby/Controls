import Control = require('Core/Control');
import template = require('wml!Controls/_explorer/View/View');
import cInstance = require('Core/core-instance');
import {EventUtils} from 'UI/Events';
import randomId = require('Core/helpers/Number/randomId');
import {SearchGridViewModel, SearchView, TreeGridView, ViewModel as TreeGridViewModel} from 'Controls/treeGrid';
import {factory} from 'Types/chain';
import {constants} from 'Env/Env';
import {Logger} from 'UI/Utils';
import {Model} from 'Types/entity';
import {ListView} from 'Controls/list';
import {isEqual} from 'Types/object';
import {
   INavigationSourceConfig,
   INavigationPositionSourceConfig as IPositionSourceConfig,
   INavigationOptionValue as INavigation
} from 'Controls/interface';
import {JS_SELECTORS as EDIT_IN_PLACE_JS_SELECTORS} from 'Controls/editInPlace';
import {ISelectionObject} from 'Controls/interface';
import {CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import { RecordSet } from 'Types/collection';
import {calculatePath} from 'Controls/dataSource';

var
      HOT_KEYS = {
         backByPath: constants.key.backspace
      };

   var
      ITEM_TYPES = {
         node: true,
         hiddenNode: false,
         leaf: null
      },
      DEFAULT_VIEW_MODE = 'table',
      VIEW_NAMES = {
         search: SearchView,
         tile: null,
         table: TreeGridView,
         list: ListView
      },
      VIEW_MODEL_CONSTRUCTORS = {
         search: SearchGridViewModel,
         tile: null,
         table: TreeGridViewModel,
         list: TreeGridViewModel
      },
      _private = {
         setRoot: function(self, root, dataRoot = null) {
            if (!self._options.hasOwnProperty('root')) {
               self._root = root;
            }
            self._notify('rootChanged', [root]);
            if (typeof self._options.itemOpenHandler === 'function') {
               self._options.itemOpenHandler(root, self._items, dataRoot);
            }
            self._forceUpdate();
         },
         setRestoredKeyObject: function(self, root) {
            const curRoot = _private.getRoot(self, self._options.root);
            const rootId = root.getId();
            self._restoredMarkedKeys[rootId] = {
               parent: curRoot,
               markedKey: null
            };
            if (self._restoredMarkedKeys[curRoot]) {
               self._restoredMarkedKeys[curRoot].markedKey = rootId;

               if (_private.isCursorNavigation(self._options.navigation)) {
                  self._restoredMarkedKeys[curRoot].cursorPosition = _private.getCursorPositionFor(root, self._options.navigation);
               }
            }
         },
          cleanRestoredKeyObject: function(self, root) {
              _private.pathCleaner(self, root);
          },
         pathCleaner: function(self, root) {
            if (self._restoredMarkedKeys[root]) {
               if (self._restoredMarkedKeys[root].parent === undefined) {
                  const markedKey = self._restoredMarkedKeys[root].markedKey;
                  const cursorPosition = self._restoredMarkedKeys[root].cursorPosition;
                  self._restoredMarkedKeys = {
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
               const curRoot = _private.getRoot(self, self._options.root);
               if (root !== curRoot) {
                  delete self._restoredMarkedKeys[curRoot];
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
         },
         getRoot: function(self, newRoot) {
            return typeof newRoot !== 'undefined' ? newRoot : self._root;
         },
         resolveItemsOnFirstLoad(self, resolver, result) {
            if (self._firstLoad) {
               resolver(result);
               self._firstLoad = false;
               _private.fillRestoredMarkedKeysByBreadCrumbs(
                   _private.getDataRoot(self, self._options),
                   self._breadCrumbsItems,
                   self._restoredMarkedKeys,
                   self._options.parentProperty,
                   self._options.navigation
               );
            }
         },
         dataLoadErrback: function(self, cfg, error) {
            _private.resolveItemsOnFirstLoad(self, self._itemsResolver, null);
            if (cfg.dataLoadErrback) {
               cfg.dataLoadErrback(error);
            }
         },
         serviceDataLoadCallback: function(self, oldData, newData) {
            self._breadCrumbsItems = calculatePath(newData).path;
            _private.resolveItemsOnFirstLoad(self, self._itemsResolver, self._breadCrumbsItems);
            _private.updateSubscriptionOnBreadcrumbs(oldData, newData, self._updateHeadingPath);
         },
         fillRestoredMarkedKeysByBreadCrumbs: function(root, breadCrumbs, restoredMarkedKeys, parentProperty, navigation) {
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

                     if (_private.isCursorNavigation(navigation)) {
                        restoredMarkedKeys[parentKey].cursorPosition = _private.getCursorPositionFor(crumb, navigation);
                     }
                  }
               });
            }
         },
         itemsReadyCallback: function(self, items) {
            self._items = items;
            if (self._options.itemsReadyCallback) {
               self._options.itemsReadyCallback(items);
            }
         },
         itemsSetCallback: function(self) {
            if (self._isGoingBack) {
               const curRoot = _private.getRoot(self, self._options.root);
               if (self._restoredMarkedKeys[curRoot]) {
                  const { markedKey } = self._restoredMarkedKeys[curRoot];
                  self._children.treeControl.setMarkedKey(markedKey);
                  self._markerForRestoredScroll = markedKey;
               }
               if (self._children.treeControl.isAllSelected()) {
                  self._children.treeControl.clearSelection();
               }
               self._isGoingBack = false;
            }
            if (self._isGoingFront) {
               self._children.treeControl.setMarkedKey(null);
               self._isGoingFront = false;
            }
            if (self._pendingViewMode) {
               _private.checkedChangeViewMode(self, self._pendingViewMode, self._options);
               self._pendingViewMode = null;
            }
         },

         setViewConfig: function (self, viewMode) {
            self._viewName = VIEW_NAMES[viewMode];
            self._viewModelConstructor = VIEW_MODEL_CONSTRUCTORS[viewMode];
         },
         setViewModeSync: function(self, viewMode, cfg): void {
            self._viewMode = viewMode;
            _private.setViewConfig(self, self._viewMode);
            _private.applyNewVisualOptions(self);
         },
         setViewMode: function(self, viewMode, cfg): Promise<void> {
            var result;

            if (viewMode === 'search' && cfg.searchStartingWith === 'root') {
               _private.updateRootOnViewModeChanged(self, viewMode, cfg);
               self._breadCrumbsItems = null;
            }

            if (!VIEW_MODEL_CONSTRUCTORS[viewMode]) {
               result = _private.loadTileViewMode(self).then(() => {
                  _private.setViewModeSync(self, viewMode, cfg);
               });
            } else {
               result = Promise.resolve();
               _private.setViewModeSync(self, viewMode, cfg);
            }

            return result;
         },
         applyNewVisualOptions(self): void {
            if (self._newItemPadding) {
               self._itemPadding = self._newItemPadding;
               self._newItemPadding = null;
            }
            if (self._newItemTemplate) {
               self._itemTemplate = self._newItemTemplate;
               self._newItemTemplate = null;
            }
            if (self._newBackgroundStyle) {
               self._backgrounStyle = self._newBackgroundStyle;
               self._newBackgroundStyle = null;
            }
            if (self._newHeader) {
               self._header = self._newHeader;
               self._newHeader = null;
            }
         },
         backByPath: function(self) {
            if (self._breadCrumbsItems && self._breadCrumbsItems.length > 0) {
               self._isGoingBack = true;
               _private.setRoot(self, self._breadCrumbsItems[self._breadCrumbsItems.length - 1].get(self._options.parentProperty));
            }
         },
         getDataRoot: function(self, options) {
            var result;

            if (self._breadCrumbsItems && self._breadCrumbsItems.length > 0) {
               result = self._breadCrumbsItems[0].get(self._options.parentProperty);
            } else {
               result = _private.getRoot(self, options.root);
            }

            return result;
         },
         dragItemsFromRoot: function(self, dragItems) {
            var
               item,
               itemFromRoot = true,
               root = _private.getDataRoot(self, self._options);

            for (var i = 0; i < dragItems.length; i++) {
               item = self._items.getRecordById(dragItems[i]);
               if (!item || item.get(self._options.parentProperty) !== root) {
                  itemFromRoot = false;
                  break;
               }
            }

            return itemFromRoot;
         },
         loadTileViewMode: function (self) {
            return new Promise((resolve) => {
               import('Controls/tile').then((tile) => {
                  VIEW_NAMES.tile = tile.TreeView;
                  VIEW_MODEL_CONSTRUCTORS.tile = tile.TreeViewModel;
                  resolve(tile);
               }).catch((err) => {
                  Logger.error('Controls/_explorer/View: ' + err.message, self, err);
               });
            });
         },
         canStartDragNDrop(self): boolean {
            return self._viewMode !== 'search';
         },
         updateSubscriptionOnBreadcrumbs(oldItems, newItems, updateHeadingPathCallback): void {
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
         },
         checkedChangeViewMode(self, viewMode: string, cfg): void {
            _private.setViewMode(self, viewMode, cfg);
            if (cfg.searchNavigationMode !== 'expand') {
               self._children.treeControl.resetExpandedItems();
            }
         },

         isCursorNavigation(navigation: INavigation<INavigationSourceConfig>): boolean {
            return !!navigation && navigation.source === 'position';
         },

         /**
          * Собирает курсор для навигации относительно заданной записи.
          * @param item - запись, для которой нужно "собрать" курсор
          * @param positionNavigation - конфигурация курсорной навигации
          */
         getCursorPositionFor(item: Model, positionNavigation: INavigation<IPositionSourceConfig>): IPositionSourceConfig['position'] {
            const position: unknown[] = [];
            const optField = positionNavigation.sourceConfig.field;
            const fields: string[] = (optField instanceof Array) ? optField : [optField];

            fields.forEach((field) => {
               position.push(item.get(field));
            });

            return position;
         },

         /**
          * Восстанавливает значение курсора для курсорной навигации при выходе из папки.
          * Одна из частей механизма сохранения позиции скролла и отмеченной записи при проваливании в папку и выходе назад.
          *
          * @param self
          * @param itemId id узла из которого выходим
          */
         restorePositionNavigation(self, itemId): void {
            const hasRestoreDataForCurrent = !!self._restoredMarkedKeys[itemId];
            if (hasRestoreDataForCurrent) {
               const parentId = self._restoredMarkedKeys[itemId].parent;
               const restoreDataForParent = self._restoredMarkedKeys[parentId];
               if (restoreDataForParent && typeof restoreDataForParent.cursorPosition !== 'undefined') {
                  self._navigation.sourceConfig.position = restoreDataForParent.cursorPosition;
               } else {
                  const fromOptions = self._options._navigation && self._options._navigation.sourceConfig && self._options._navigation.sourceConfig.position;
                  self._navigation.sourceConfig.position = fromOptions || null;
               }
            }
         },

         setPendingViewMode(self, viewMode: string, options): void {
            self._pendingViewMode = viewMode;

            if (viewMode === 'search') {
               _private.updateRootOnViewModeChanged(self, viewMode, options);
            }
         },

         updateRootOnViewModeChanged(self, viewMode: string, options): void {
            if (viewMode === 'search' && options.searchStartingWith === 'root') {
               const currentRoot = _private.getRoot(self, options.root);
               const dataRoot = _private.getDataRoot(self, options);

               if (dataRoot !== currentRoot) {
                  _private.setRoot(self, dataRoot, dataRoot);
               }
            }
         },
      };

   /**
    * Контрол "Иерархический проводник".
    * Отображает данные иерархического списка, узел которого можно развернуть и перейти в него.
    * Позволяет переключать отображение элементов в режимы "таблица", "список" и "плитка".
    *
    * @remark
    * Сортировка применяется к запросу к источнику данных. Полученные от источника записи дополнительно не сортируются.
    *
    * Полезные ссылки:
    * * <a href="/doc/platform/developmentapl/interface-development/controls/list/explorer/">руководство разработчика</a>
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_explorer.less">переменные тем оформления explorer</a>
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления list</a>
    *
    * @demo Controls-demo/Explorer/Explorer
    * @demo Controls-demo/Explorer/Search
    *
    * @class Controls/_explorer/View
    * @extends Core/Control
    * @implements Controls/_interface/IErrorController
    * @mixes Controls/_interface/ISource
    * @mixes Controls/interface/ITreeGridItemTemplate
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IEditableList
    * @mixes Controls/interface/IGroupedList
    * @mixes Controls/_interface/INavigation
    * @mixes Controls/_interface/IFilterChanged
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/_list/interface/IList
    * @mixes Controls/_itemActions/interface/IItemActionsOptions
    * @mixes Controls/_interface/IHierarchy
    * @mixes Controls/_tree/interface/ITreeControlOptions
    * @mixes Controls/_explorer/interface/IExplorer
    * @mixes Controls/_interface/IDraggable
    * @mixes Controls/_tile/interface/ITile
    * @mixes Controls/_list/interface/IVirtualScrollConfig
    * @mixes Controls/interface/IGroupedGrid
    * @mixes Controls/_grid/interface/IGridControl
    * @mixes Controls/_list/interface/IClickableView
    * @mixes Controls/_list/interface/IMovableList
    * @mixes Controls/_list/interface/IRemovableList
    * @mixes Controls/_marker/interface/IMarkerListOptions
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
    * @extends Core/Control
    * @implements Controls/_interface/IErrorController
    * @mixes Controls/_interface/ISource
    * @mixes Controls/interface/ITreeGridItemTemplate
    * @mixes Controls/interface/IItemTemplate
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IEditableList
    * @mixes Controls/interface/IGroupedList
    * @mixes Controls/_interface/INavigation
    * @mixes Controls/_interface/IFilterChanged
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/_list/interface/IList
    * @mixes Controls/_itemActions/interface/IItemActionsOptions
    * @mixes Controls/_interface/ISorting
    * @mixes Controls/_interface/IHierarchy
    * @mixes Controls/_tree/interface/ITreeControlOptions
    * @mixes Controls/_explorer/interface/IExplorer
    * @mixes Controls/_interface/IDraggable
    * @mixes Controls/_tile/interface/ITile
    * @mixes Controls/_list/interface/IVirtualScrollConfig
    * @mixes Controls/interface/IGroupedGrid
    * @mixes Controls/_grid/interface/IGridControl
    * @mixes Controls/_list/interface/IMovableList
    * @mixes Controls/_list/interface/IRemovableList
    * @mixes Controls/_marker/interface/IMarkerListOptions
    *
    * @public
    * @author Авраменко А.С.
    */
    var Explorer = Control.extend({
      _template: template,
      _breadCrumbsItems: null,
      _root: null,
      _viewName: null,
      _viewMode: null,
      _viewModelConstructor: null,
      _dragOnBreadCrumbs: false,
      _hoveredBreadCrumb: undefined,
      _virtualScrolling: undefined,
      _dragControlId: null,
      _firstLoad: true,
      _itemsPromise: null,
      _itemsResolver: null,
      _markerForRestoredScroll: null,
      _navigation: null,
      _resetScrollAfterViewModeChange: false,
      _itemPadding: {},
      _itemTemplate: undefined,

      _resolveItemsPromise() {
         this._itemsResolver();
      },

      _beforeMount: function(cfg) {
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
            this._header = cfg.viewMode === 'tile' ? undefined : cfg.header;;
         }
         this._dataLoadErrback = _private.dataLoadErrback.bind(null, this, cfg);
         this._serviceDataLoadCallback = _private.serviceDataLoadCallback.bind(null, this);
         this._itemsReadyCallback = _private.itemsReadyCallback.bind(null, this);
         this._itemsSetCallback = _private.itemsSetCallback.bind(null, this);
         this._canStartDragNDrop = _private.canStartDragNDrop.bind(null, this);
         this._updateHeadingPath = this._updateHeadingPath.bind(this);
         this._breadCrumbsDragHighlighter = this._dragHighlighter.bind(this);
         this._needSetMarkerCallback = (item: Model, domEvent: any): boolean => {
            return domEvent.target.closest('.js-controls-ListView__checkbox')
               || item instanceof Array || item.get(this._options.nodeProperty) !== ITEM_TYPES.node;
         };

         this._itemsPromise = new Promise((res) => { this._itemsResolver = res; });
         if (!cfg.source) {
            this._resolveItemsPromise();
         }
         const root = _private.getRoot(this, cfg.root);
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
         return _private.setViewMode(this, cfg.viewMode, cfg);
      },
      _beforeUpdate: function(cfg) {
         const isViewModeChanged = cfg.viewMode !== this._options.viewMode;
         const isSearchViewMode = cfg.viewMode === 'search';
         const isRootChanged = cfg.root !== this._options.root;
         const loadedBySourceController =
             cfg.sourceController &&
             ((isSearchViewMode && cfg.searchValue && cfg.searchValue !== this._options.searchValue) ||
              (cfg.source !== this._options.source));
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

         if (this._isGoingBack && _private.isCursorNavigation(this._options.navigation) && !navigationChanged) {
            const newRootId = _private.getRoot(this, this._options.root);
            _private.restorePositionNavigation(this, newRootId);
         } else if (navigationChanged) {
            this._navigation = cfg.navigation;
         }

         if ((isViewModeChanged && isRootChanged && !loadedBySourceController) || this._pendingViewMode && cfg.viewMode !== this._pendingViewMode) {
            // Если меняется и root и viewMode, не меняем режим отображения сразу,
            // потому что тогда мы перерисуем explorer в новом режиме отображения
            // со старыми записями, а после загрузки новых получим еще одну перерисовку.
            // Вместо этого запомним, какой режим отображения от нас хотят, и проставим
            // его, когда новые записи будут установлены в модель (itemsSetCallback).
            _private.setPendingViewMode(this, cfg.viewMode, cfg);
         } else if (isViewModeChanged && !this._pendingViewMode) {
            // Также отложенно необходимо устанавливать viewMode, если при переходе с viewMode === "search" на "table"
            // или "tile" будет перезагрузка. Этот код нужен до тех пор, пока не будут спускаться данные сверху-вниз.
            // https://online.sbis.ru/opendoc.html?guid=f90c96e6-032c-404c-94df-cc1b515133d6
            const filterChanged = !isEqual(cfg.filter, this._options.filter);
            const recreateSource = cfg.source !== this._options.source || (isSourceControllerLoading);
            const sortingChanged = !isEqual(cfg.sorting, this._options.sorting);
            if ((filterChanged || recreateSource || sortingChanged || navigationChanged) && !loadedBySourceController) {
               _private.setPendingViewMode(this, cfg.viewMode, cfg);
            } else {
               _private.checkedChangeViewMode(this, cfg.viewMode, cfg);
            }
         } else if (!isViewModeChanged &&
             this._pendingViewMode &&
             cfg.viewMode === this._pendingViewMode &&
             loadedBySourceController) {
            _private.setViewModeSync(this, this._pendingViewMode, cfg);
         } else {
            _private.applyNewVisualOptions(this);
         }
      },
      _beforeRender(): void {
          // Сбрасываем скролл при режима отображения
          // https://online.sbis.ru/opendoc.html?guid=d4099117-ef37-4cd6-9742-a7a921c4aca3
         if (this._resetScrollAfterViewModeChange) {
            this._notify('doScroll', ['top'], {bubbling: true});
            this._resetScrollAfterViewModeChange = false;
         }

      },
      _beforePaint: function() {
         if (this._markerForRestoredScroll !== null) {
            this.scrollToItem(this._markerForRestoredScroll);
            this._markerForRestoredScroll = null;
         }
      },
      _getRoot: function() {
         return _private.getRoot(this, this._options.root);
      },
      _dragHighlighter: function(itemKey, hasArrow) {
         return this._dragOnBreadCrumbs && this._hoveredBreadCrumb === itemKey
            ? 'controls-BreadCrumbsView__dropTarget_' + (hasArrow ? 'withArrow' : 'withoutArrow') : '';
      },
      _documentDragEnd: function(event, dragObject) {
         if (this._hoveredBreadCrumb !== undefined) {
            this._notify('dragEnd', [dragObject.entity, this._hoveredBreadCrumb, 'on']);
         }
         this._dragOnBreadCrumbs = false;
      },
      _documentDragStart: function(event, dragObject) {
         //TODO: Sometimes at the end of dnd, the parameter is not reset. Will be fixed by: https://online.sbis.ru/opendoc.html?guid=85cea965-2aa6-4f1b-b2a3-1f0d65477687
         this._hoveredBreadCrumb = undefined;

         if (
            this._options.itemsDragNDrop &&
            this._options.parentProperty &&
            cInstance.instanceOfModule(dragObject.entity, 'Controls/dragnDrop:ItemsEntity') &&
            dragObject.entity.dragControlId === this._dragControlId
         ) {
            //No need to show breadcrumbs when dragging items from the root, being in the root of the registry.
            this._dragOnBreadCrumbs = _private.getRoot(this, this._options.root) !== _private.getDataRoot(this, this._options) || !_private.dragItemsFromRoot(this, dragObject.entity.getItems());
         }
      },
      _hoveredCrumbChanged: function(event, item) {
         this._hoveredBreadCrumb = item ? item.getId() : undefined;

         // If you change hovered bread crumb, must be called installed in the breadcrumbs highlighter,
         // but is not called, because the template has no reactive properties.
         this._forceUpdate();
      },
      _onItemClick(event, item, clickEvent, columnIndex?: number): boolean {
         const res = this._notify('itemClick', [item, clickEvent, columnIndex]);
         event.stopPropagation();

         const changeRoot = () => {
            _private.setRoot(this, item.getId());
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
              _private.setRestoredKeyObject(this, item);

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
      },
      _onBreadCrumbsClick: function(event, item) {
          _private.cleanRestoredKeyObject(this, item.getId());
          _private.setRoot(this, item.getId());
          this._isGoingBack = true;
      },
      _onExternalKeyDown(event): void {
         this._onExplorerKeyDown(event);
         if (!event.stopped && event._bubbling !== false) {
            this._children.treeControl.handleKeyDown(event);
         }
      },
      _onExplorerKeyDown: function(event) {
         EventUtils.keysHandler(event, HOT_KEYS, _private, this);
      },
      _updateHeadingPath() {
          this._breadCrumbsItems = calculatePath(this._items).path;
      },
      scrollToItem(key: string|number, toBottom: boolean): void {
         this._children.treeControl.scrollToItem(key, toBottom);
      },
      reloadItem: function() {
         let treeControl = this._children.treeControl;
         return treeControl.reloadItem.apply(treeControl, arguments);
      },
      beginEdit: function(options) {
         return this._children.treeControl.beginEdit(options);
      },
      beginAdd: function(options) {
         return this._children.treeControl.beginAdd(options);
      },
      cancelEdit: function() {
         return this._children.treeControl.cancelEdit();
      },
      commitEdit: function() {
         return this._children.treeControl.commitEdit();
      },
      reload: function(keepScroll, sourceConfig) {
         return this._children.treeControl.reload(keepScroll, sourceConfig);
      },
      getItems(): RecordSet {
         return this._children.treeControl.getItems();
      },

      // todo removed or documented by task:
      // https://online.sbis.ru/opendoc.html?guid=24d045ac-851f-40ad-b2ba-ef7f6b0566ac
      toggleExpanded: function(id) {
         this._children.treeControl.toggleExpanded(id);
      },

      // region mover

      moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<void> {
         return this._children.treeControl.moveItems(selection, targetKey, position);
      },

      moveItemUp(selectedKey: CrudEntityKey): Promise<void> {
         return this._children.treeControl.moveItemUp(selectedKey);
      },

      moveItemDown(selectedKey: CrudEntityKey): Promise<void> {
         return this._children.treeControl.moveItemDown(selectedKey);
      },

      moveItemsWithDialog(selection: ISelectionObject): Promise<void> {
         return this._children.treeControl.moveItemsWithDialog(selection);
      },

      // endregion mover

      // region remover

      removeItems(selection: ISelectionObject): Promise<void> {
         return this._children.treeControl.removeItems(selection);
      },

      removeItemsWithConfirmation(selection: ISelectionObject): Promise<void> {
         return this._children.treeControl.removeItemsWithConfirmation(selection);
      },

      // endregion remover

      _onArrowClick: function(e) {
         let item = this._children.treeControl._children.baseControl.getViewModel().getMarkedItem().getContents();
         this._notifyHandler(e, 'arrowClick', item);
      },
      _notifyHandler: EventUtils.tmplNotify
   });

   Explorer._private = _private;
   Explorer._constants = {
      DEFAULT_VIEW_MODE: DEFAULT_VIEW_MODE,
      ITEM_TYPES: ITEM_TYPES,
      VIEW_NAMES: VIEW_NAMES,
      VIEW_MODEL_CONSTRUCTORS: VIEW_MODEL_CONSTRUCTORS
   };
   Explorer._theme = ['Controls/explorer', 'Controls/tile'];

   Explorer.getDefaultOptions = function() {
      return {
         multiSelectVisibility: 'hidden',
         viewMode: DEFAULT_VIEW_MODE,
         backButtonIconStyle: 'primary',
         backButtonFontColorStyle: 'secondary',
         stickyHeader: true,
         searchStartingWith: 'root',
         showActionButton: false
      };
   };

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
    * @cfg {String|Function} Шаблон отображения элемента в режиме "Плитка".
    * @default undefined
    * @remark
    * Позволяет установить пользовательский шаблон отображения элемента (**именно шаблон**, а не контрол!). При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/tile:ItemTemplate}.
    *
    * Также шаблон Controls/tile:ItemTemplate поддерживает {@link Controls/tile:ItemTemplate параметры}, с помощью которых можно изменить отображение элемента.
    *
    * В разделе "Примеры" показано как с помощью директивы {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial} задать пользовательский шаблон. Также в опцию tileItemTemplate можно передавать и более сложные шаблоны, которые содержат иные директивы, например {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-if ws:if}. В этом случае каждая ветка вычисления шаблона должна заканчиваться директивой ws:partial, которая встраивает Controls/tile:ItemTemplate.
    *
    * Дополнительно о работе с шаблоном вы можете прочитать в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/explorer/templates/ руководстве разработчика}.
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
   export = Explorer;
