import Control = require('Core/Control');
import template = require('wml!Controls/_explorer/View/View');
import tmplNotify = require('Controls/Utils/tmplNotify');
import applyHighlighter = require('Controls/Utils/applyHighlighter');
import cInstance = require('Core/core-instance');
import keysHandler = require('Controls/Utils/keysHandler');
import randomId = require('Core/helpers/Number/randomId');
import {SearchGridViewModel, SearchView, TreeGridView, ViewModel as TreeGridViewModel} from 'Controls/treeGrid';
import {factory} from 'Types/chain';
import {constants} from 'Env/Env';
import {Logger} from 'UI/Utils';
import 'Types/entity';

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
         table: TreeGridView
      },
      VIEW_MODEL_CONSTRUCTORS = {
         search: SearchGridViewModel,
         tile: null,
         table: TreeGridViewModel
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
            self._restoredMarkedKeys[root] = {
               parent: curRoot,
               markedKey: null
            };
            if (self._restoredMarkedKeys[curRoot]) {
               self._restoredMarkedKeys[curRoot].markedKey = root;
            }
         },
          cleanRestoredKeyObject: function(self, root) {
              _private.pathCleaner(self, root);
          },
         pathCleaner: function(self, root) {
            if (self._restoredMarkedKeys[root]) {
               if (self._restoredMarkedKeys[root].parent === undefined) {
                  const markedKey = self._restoredMarkedKeys[root].markedKey;
                  self._restoredMarkedKeys = {
                     [root]: {
                        markedKey: markedKey
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
                  if (self._restoredMarkedKeys[cur] && self._restoredMarkedKeys[cur].parent === String(key)) {
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
         getPath(data) {
             const path = data && data.getMetaData().path;
             let breadCrumbs;

             if (path && path.getCount() > 0) {
                 breadCrumbs = factory(path).toArray();
             } else {
                 breadCrumbs = null;
             }
             return breadCrumbs;
         },
         resolveItemsOnFirstLoad(self, resolver, result) {
            if (self._firstLoad) {
               resolver(result);
               self._firstLoad = false;
               _private.fillRestoredMarkedKeysByBreadCrumbs(_private.getDataRoot(self),
                   self._breadCrumbsItems,
                   self._restoredMarkedKeys,
                   self._options.parentProperty);
            }
         },
         dataLoadErrback: function(self, cfg, error) {
            _private.resolveItemsOnFirstLoad(self, self._itemsResolver, null);
            if (cfg.dataLoadErrback) {
               cfg.dataLoadErrback(error);
            }
         },
         serviceDataLoadCallback: function(self, oldData, newData) {
            self._breadCrumbsItems = _private.getPath(newData);
            _private.resolveItemsOnFirstLoad(self, self._itemsResolver, self._breadCrumbsItems);
            _private.updateSubscriptionOnBreadcrumbs(oldData, newData, self._updateHeadingPath);
         },
         fillRestoredMarkedKeysByBreadCrumbs: function(root, breadCrumbs, restoredMarkedKeys, parentProperty) {
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
         setVirtualScrolling(self, viewMode, cfg): void {
            // todo https://online.sbis.ru/opendoc.html?guid=7274717e-838d-46c4-b991-0bec75bd0162
            // For viewMode === 'tile' disable virtualScrolling.
            self._virtualScrollConfig = viewMode === 'tile' ? false : cfg.virtualScrollConfig;
         },

         setViewConfig: function (self, viewMode) {
            self._viewName = VIEW_NAMES[viewMode];
            self._viewModelConstructor = VIEW_MODEL_CONSTRUCTORS[viewMode];
         },
         setViewModeSync: function(self, viewMode, cfg): void {
            self._viewMode = viewMode;
            _private.setVirtualScrolling(self, self._viewMode, cfg);
            _private.setViewConfig(self, self._viewMode);
         },
         setViewMode: function(self, viewMode, cfg): Promise<void> {
            var currentRoot = _private.getRoot(self, cfg.root);
            var dataRoot = _private.getDataRoot(self);
            var result;

            if (viewMode === 'search' && cfg.searchStartingWith === 'root') {
               self._breadCrumbsItems = null;
               if (dataRoot !== currentRoot) {
                  _private.setRoot(self, dataRoot, dataRoot);
               }
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
         backByPath: function(self) {
            if (self._breadCrumbsItems && self._breadCrumbsItems.length > 0) {
               self._isGoingBack = true;
               _private.setRoot(self, self._breadCrumbsItems[self._breadCrumbsItems.length - 1].get(self._options.parentProperty));
            }
         },
         getDataRoot: function(self) {
            var result;

            if (self._breadCrumbsItems && self._breadCrumbsItems.length > 0) {
               result = self._breadCrumbsItems[0].get(self._options.parentProperty);
            } else {
               result = _private.getRoot(self, self._options.root);
            }

            return result;
         },
         dragItemsFromRoot: function(self, dragItems) {
            var
               item,
               itemFromRoot = true,
               root = _private.getDataRoot(self);

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
         }
      };

   /**
    * Контрол "Иерархический проводник".
    * Отображает данные иерархического списка, узел которого можно развернуть и перейти в него.
    * Позволяет переключать отображение элементов в режимы "таблица", "список" и "плитка".
    * Инструкции по настройке контрола доступны в <a href='/doc/platform/developmentapl/interface-development/controls/list/explorer/'>руководстве разработчика</a>.
    *
    * Примечание:
    * Сортировка применяется к запросу к источнику данных. Полученные от источника записи дополнительно не сортируются.
    *
    * Демо-примеры:
    * <ul>
    *    <li><a href="/materials/Controls-demo/app/Controls-demo%2FExplorer%2FExplorer">Иерархический проводник в режимах "список" и "плитка"</a></li>
    *    <li><a href="/materials/Controls-demo/app/Controls-demo%2FExplorer%2FSearch">Иерархический проводник в режиме "список" и строкой поиска</a></li>
    * </ul>
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
    * @mixes Controls/_interface/IFilter
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/_list/interface/IList
    * @mixes Controls/_interface/IHierarchy
    * @mixes Controls/_treeGrid/interface/ITreeControl
    * @mixes Controls/_explorer/interface/IExplorer
    * @mixes Controls/interface/IDraggable
    * @mixes Controls/_tile/interface/ITile
    * @mixes Controls/_list/interface/IVirtualScroll
    * @mixes Controls/interface/IGroupedGrid
    * @mixes Controls/_grid/interface/IGridControl
    * @control
    * @public
    * @category List
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
    * @mixes Controls/_interface/IFilter
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/_list/interface/IList
    * @mixes Controls/_interface/ISorting
    * @mixes Controls/_interface/IHierarchy
    * @mixes Controls/_treeGrid/interface/ITreeControl
    * @mixes Controls/_explorer/interface/IExplorer
    * @mixes Controls/interface/IDraggable
    * @mixes Controls/_tile/interface/ITile
    * @mixes Controls/_list/interface/IVirtualScroll
    * @mixes Controls/interface/IGroupedGrid
    * @mixes Controls/_grid/interface/IGridControl
    * @control
    * @public
    * @category List
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

      _resolveItemsPromise() {
         this._itemsResolver();
      },

      _beforeMount: function(cfg) {
         this._dataLoadErrback = _private.dataLoadErrback.bind(null, this, cfg);
         this._serviceDataLoadCallback = _private.serviceDataLoadCallback.bind(null, this);
         this._itemsReadyCallback = _private.itemsReadyCallback.bind(null, this);
         this._itemsSetCallback = _private.itemsSetCallback.bind(null, this);
         this._canStartDragNDrop = _private.canStartDragNDrop.bind(null, this);
         this._updateHeadingPath = this._updateHeadingPath.bind(this);
         this._breadCrumbsDragHighlighter = this._dragHighlighter.bind(this);

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

         this._dragControlId = randomId();
         return _private.setViewMode(this, cfg.viewMode, cfg);
      },
      _beforeUpdate: function(cfg) {
         //todo: после доработки стандарта, убрать флаг _isGoingFront по задаче: https://online.sbis.ru/opendoc.html?guid=ffa683fa-0b8e-4faa-b3e2-a4bb39671029
         if (this._isGoingFront && this._options.hasOwnProperty('root') && cfg.root === this._options.root) {
            this._isGoingFront = false;
         }

         if (
             cfg.viewMode !== 'search' &&
             (cfg.viewMode !== this._viewMode && cfg.root !== this._options.root ||
             this._pendingViewMode && cfg.viewMode !== this._pendingViewMode)
         ) {
            // Если меняется и root и viewMode, не меняем режим отображения сразу,
            // потому что тогда мы перерисуем explorer в новом режиме отображения
            // со старыми записями, а после загрузки новых получим еще одну перерисовку.
            // Вместо этого запомним, какой режим отображения от нас хотят, и проставим
            // его, когда новые записи будут установлены в модель (itemsSetCallback).
            this._pendingViewMode = cfg.viewMode;
         } else if (cfg.viewMode !== this._viewMode && !this._pendingViewMode) {
            _private.checkedChangeViewMode(this, cfg.viewMode, cfg);
         }

         if (cfg.virtualScrollConfig !== this._options.virtualScrollConfig) {
            _private.setVirtualScrolling(this, this._viewMode, cfg);
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
            this._dragOnBreadCrumbs = _private.getRoot(this, this._options.root) !== _private.getDataRoot(this) || !_private.dragItemsFromRoot(this, dragObject.entity.getItems());
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
             // При проваливании ОБЯЗАТЕЛЬНО дополняем restoredKeyObject узлом, в который проваливаемся
            _private.setRestoredKeyObject(this, item.getId());
            _private.setRoot(this, item.getId());
            this._isGoingFront = true;
         };

         if (res !== false && item.get(this._options.nodeProperty) === ITEM_TYPES.node) {
            if (!this._options.editingConfig) {
               changeRoot();
            } else {
               this.commitEdit().addCallback((res = {}) => {
                  if (!res.validationFailed) {
                     changeRoot();
                  }
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
         keysHandler(event, HOT_KEYS, _private, this);
      },
      _updateHeadingPath() {
          this._breadCrumbsItems = _private.getPath(this._items);
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
      reload: function() {
         return this._children.treeControl.reload();
      },
      // todo removed or documented by task:
      // https://online.sbis.ru/opendoc.html?guid=24d045ac-851f-40ad-b2ba-ef7f6b0566ac
      toggleExpanded: function(id) {
         this._children.treeControl.toggleExpanded(id);
      },
      _onArrowClick: function(e) {
         let item = this._children.treeControl._children.baseControl.getViewModel().getMarkedItem().getContents();
         this._notifyHandler(e, 'arrowClick', item);
      },
      _notifyHandler: tmplNotify,
      _applyHighlighter: applyHighlighter
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
         backButtonStyle: 'secondary',
         stickyHeader: true,
         searchStartingWith: 'root',
         showActionButton: false
      };
   };

   export = Explorer;

   /**
    * @event Controls/_explorer/View#arrowClick  Происходит при клике на кнопку "Просмотр записи".
    * @remark Кнопка отображается при наведении курсора на текущую папку хлебных крошек. Отображение кнопки "Просмотр записи" задаётся с помощью опции {@link Controls/_explorer/interface/IExplorer#showActionButton}. По умолчанию кнопка скрыта.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    */
