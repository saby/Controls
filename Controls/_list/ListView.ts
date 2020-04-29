/**
 * Created by kraynovdo on 22.09.2017.
 */
import BaseControl = require('Core/Control');
import {debounce as cDebounce} from 'Types/function';
import {Logger} from 'UI/Utils';
import ListViewTpl = require('wml!Controls/_list/ListView/ListView');
import defaultItemTemplate = require('wml!Controls/_list/ItemTemplate');
import GroupTemplate = require('wml!Controls/_list/GroupTemplate');
import ItemOutputWrapper = require('wml!Controls/_list/resources/ItemOutputWrapper');
import {isEqual} from "Types/object";
import 'wml!Controls/_list/resources/ItemOutput';

var
    DEBOUNCE_HOVERED_ITEM_CHANGED = 150;

var _private = {
    checkDeprecated: function(cfg, self) {
        // TODO: https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
        if (cfg.leftSpacing !== undefined) {
            Logger.warn('IList: Option "leftSpacing" is deprecated and will be removed in 19.200. Use option "itemPadding.left".', self);
        }
        if (cfg.leftPadding !== undefined) {
            Logger.warn('IList: Option "leftPadding" is deprecated and will be removed in 19.200. Use option "itemPadding.left".', self);
        }
        if (cfg.rightSpacing !== undefined) {
            Logger.warn('IList: Option "rightSpacing" is deprecated and will be removed in 19.200. Use option "itemPadding.right".', self);
        }
        if (cfg.rightPadding !== undefined) {
            Logger.warn('IList: Option "rightPadding" is deprecated and will be removed in 19.200. Use option "itemPadding.right".', self);
        }
        if (cfg.rowSpacing !== undefined) {
            Logger.warn('IList: Option "rowSpacing" is deprecated and will be removed in 19.200. Use option "itemPadding.top and itemPadding.bottom".', self);
        }
        if (cfg.contextMenuEnabled !== undefined) {
            Logger.warn('IList: Option "contextMenuEnabled" is deprecated and removed in 19.200. Use option "contextMenuVisibility".', self);
        }
        if (cfg.markerVisibility === 'always') {
            Logger.warn('IList: Value "always" for property Controls/_list/interface/IList#markerVisibility is deprecated, use value "visible" instead.', self);
        }
        if (cfg.markerVisibility === 'demand') {
            Logger.warn('IList: Value "demand" for property Controls/_list/interface/IList#markerVisibility is deprecated, use value "onactivated" instead.', self);
        }
        if (cfg.results) {
            Logger.warn('IList: Option "results" is deprecated and removed in 19.200. Use options "resultsPosition" and "resultsTemplate".', self);
        }
    },

    resizeNotifyOnListChanged: function(self) {
       //command to scroll watcher
       self._notify('controlResize', [], {bubbling: true});
    },

    setHoveredItem: function(self, item, nativeEvent) {
        if (item !== self._hoveredItem) {
            self._hoveredItem = item;
            var container = nativeEvent ? nativeEvent.target.closest('.controls-ListView__itemV') : null;
            self._notify('hoveredItemChanged', [item, container]);
        }
    },

    /**
     * Проверяет, что markedKey был изменён в модели ListViewModel, например,
     * в случае, когда заданный в опциях ключ не был найден в пришедших с сервера данных
     * @param self
     */
    checkMarkedKeyHasChangedInModel: function(self) {
        return self._options.markedKey !== undefined && self._options.markedKey !== null &&
            self._options.markedKey !== self._listModel.getMarkedKey();
    },

    /**
     * Проверяет, нужно ли показывать markedKey
     * @param self
     */
    checkMarkerShouldBeVisible: function(self) {
        return self._options.markerVisibility === 'always' || self._options.markerVisibility === 'visible';
    }
};

var ListView = BaseControl.extend(
    {
        _listModel: null,
        _hoveredItem: null,
        _template: ListViewTpl,
        _groupTemplate: GroupTemplate,
        _defaultItemTemplate: defaultItemTemplate,
        _itemOutputWrapper: ItemOutputWrapper,
        _pendingRedraw: false,

        constructor: function() {
            ListView.superclass.constructor.apply(this, arguments);
            this._debouncedSetHoveredItem = cDebounce(_private.setHoveredItem, DEBOUNCE_HOVERED_ITEM_CHANGED);
            this._onListChangeFnc = (event, changesType) => {
               // todo refactor by task https://online.sbis.ru/opendoc.html?guid=80fbcf1f-5804-4234-b635-a3c1fc8ccc73
               if (changesType !== 'hoveredItemChanged' &&
                  changesType !== 'activeItemChanged' &&
                  changesType !== 'markedKeyChanged' &&
                  changesType !== 'itemActionsUpdated' &&
                  !this._pendingRedraw) {
                  this._pendingRedraw = true;
               }
            };
            this._onMarkedKeyChangedHandlerFnc = this._onMarkedKeyChangedHandler.bind(this);
        },
       _beforeMount: function(newOptions) {
            _private.checkDeprecated(newOptions, this);
            if (newOptions.groupTemplate) {
                this._groupTemplate = newOptions.groupTemplate;
            }
            if (newOptions.listModel) {
                this._listModel = newOptions.listModel;
                this._listModel.subscribe('onListChange', this._onListChangeFnc);
                this._listModel.subscribe('onMarkedKeyChanged', this._onMarkedKeyChangedHandlerFnc);
            }
            this._itemTemplate = this._resolveItemTemplate(newOptions);
        },

        _beforeUnmount: function() {
            if (this._listModel) {
                this._listModel.unsubscribe('onListChange', this._onListChangeFnc);
                this._listModel.unsubscribe('onMarkedKeyChanged', this._onMarkedKeyChangedHandlerFnc);
            }
        },

        _beforeUpdate: function(newOptions) {
            if (newOptions.listModel && (this._listModel != newOptions.listModel)) {
                this._listModel = newOptions.listModel;
                this._listModel.subscribe('onListChange', this._onListChangeFnc);
            }
            if (this._options.itemTemplateProperty !== newOptions.itemTemplateProperty) {
                this._listModel.setItemTemplateProperty(newOptions.itemTemplateProperty);
            }
            if (this._options.groupTemplate !== newOptions.groupTemplate) {
                this._groupTemplate = newOptions.groupTemplate;
            }
            if (!isEqual(this._options.itemPadding, newOptions.itemPadding)) {
                this._listModel.setItemPadding(newOptions.itemPadding);
            }
            if (newOptions.markedKey) {
                this._listModel.setMarkedKey(newOptions.markedKey);
            }

            // TODO https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            if (this._options.leftSpacing !== newOptions.leftSpacing) {
                this._listModel.setLeftSpacing(newOptions.leftSpacing);
            }
            if (this._options.leftPadding !== newOptions.leftPadding) {
                this._listModel.setLeftPadding(newOptions.leftPadding);
            }
            if (this._options.rightSpacing !== newOptions.rightSpacing) {
                this._listModel.setRightSpacing(newOptions.rightSpacing);
            }
            if (this._options.rightPadding !== newOptions.rightPadding) {
                this._listModel.setRightPadding(newOptions.rightPadding);
            }
            if (this._options.rowSpacing !== newOptions.rowSpacing) {
                this._listModel.setRowSpacing(newOptions.rowSpacing);
            }
            this._itemTemplate = this._resolveItemTemplate(newOptions);
        },

        _resolveItemTemplate(options) {
           return options.itemTemplate || this._defaultItemTemplate;
        },

        // protected
        resizeNotifyOnListChanged: function() {
            _private.resizeNotifyOnListChanged(this);
        },

        _afterMount: function() {
            this._notify('itemsContainerReady', [this.getItemsContainer()]);
            /* TODO это временное решение для ускорения списка с вложенными плитками
              суть - в том что когда у плитки случается afterMount - у внешнего списка уже все пересчитал с актуальными
              размерами вложенных плиток. Поэтому нет вариантов, что afterMount плитки может поресайзить внешний список
              Ресайзы вызывают кучу пересчетов и лишнего кода, и тормозят список.

              Правильное решение - отделять контрол TileView от TileControl, в качестве вложенных плиток использовать
              TileView которое не стреляет событиями
            */
            if (!this._options._innerList) {
                this.resizeNotifyOnListChanged();
            }
            // корректное значение _listModel.markedKey устанавливается в BaseControl после получения данных
            // методом BaseControl.reload() и событие 'onMarkedKeyChanged' модели ListViewModel
            // вызывается до того, как в ListView._beforeMount() на него делается подписка
            // может, задействовать Env/Event:Bus?
            if ((this._options.markedKey === undefined || _private.checkMarkedKeyHasChangedInModel(this)) &&
                _private.checkMarkerShouldBeVisible(this)) {
                this._notify('markedKeyChanged', [this._listModel.getMarkedKey()]);
            }
        },

        _afterRender: function() {
            if (this._pendingRedraw) {
                this.resizeNotifyOnListChanged();
            }
            this._pendingRedraw = false;
        },

        getItemsContainer: function() {
            return this._children.itemsContainer;
        },

        _onItemClick: function(e, dispItem) {
            // Флаг preventItemEvent выставлен, если нужно предотвратить возникновение
            // событий itemClick, itemMouseDown по нативному клику, но по какой-то причине
            // невозможно остановить всплытие события через stopPropagation
            // TODO: Убрать, preventItemEvent когда это больше не понадобится
            // https://online.sbis.ru/doc/cefa8cd9-6a81-47cf-b642-068f9b3898b7
            if (!e.preventItemEvent) {
                var item = dispItem.getContents();
                this._notify('itemClick', [item, e], {bubbling: true});
            }
        },

        _onGroupClick: function(e, dispItem) {
            var
                item = dispItem.getContents();
            this._notify('groupClick', [item, e], {bubbling: true});
        },

        _onItemContextMenu: function(event, itemData) {
           if (this._options.contextMenuEnabled !== false && this._options.contextMenuVisibility !== false && !this._options.listModel.getEditingItemData()) {
                this._notify('itemContextMenu', [itemData, event, false]);
            }
        },

        _onItemSwipe: function(event, itemData) {
            this._notify('itemSwipe', [itemData, event]);
            event.stopPropagation();
        },

        _onRowDeactivated: function(event, eventOptions) {
            this._notify('rowDeactivated', [eventOptions]);
        },

        _onItemMouseDown: function(event, itemData) {
            if (itemData && itemData.isSwiped) {
               // TODO: Сейчас на itemMouseDown список переводит фокус на fakeFocusElement и срабатывает событие listDeactivated.
               // Из-за этого события закрывается свайп, это неправильно, т.к. из-за этого становится невозможным открытие меню.
               // Выпилить после решения задачи https://online.sbis.ru/opendoc.html?guid=38315a8d-2006-4eb8-aeb3-05b9447cd629
               return;
            }

            // TODO: Убрать, preventItemEvent когда это больше не понадобится
            // https://online.sbis.ru/doc/cefa8cd9-6a81-47cf-b642-068f9b3898b7
            if (!event.preventItemEvent) {
                this._notify('itemMouseDown', [itemData, event]);
            }
        },

        _onItemMouseUp(e, itemData) {
            this._notify('itemMouseUp', [itemData, e]);
        },

        _onItemMouseEnter: function(event, itemData) {
            this._notify('itemMouseEnter', [itemData, event]);
            this._debouncedSetHoveredItem(this, itemData.item, event);
        },

        //TODO: из-за того что ItemOutput.wml один для всех таблиц, приходится подписываться в нем на события,
        //которые не нужны для ListView. Выписана задача https://online.sbis.ru/opendoc.html?guid=9fd4922f-eb37-46d5-8c39-dfe094605164
        _onItemMouseLeave: function(event, itemData) {
            this._notify('itemMouseLeave', [itemData, event]);
            this._debouncedSetHoveredItem(this, null);
        },

        _onItemMouseMove: function(event, itemData) {
            this._notify('itemMouseMove', [itemData, event]);
        },

        _onItemWheel: function(event) {
        },

        _onMarkedKeyChangedHandler: function(event, key) {
            this._notify('markedKeyChanged', [key]);
        },

        setHoveredItem: function (item) {
            this._listModel.setHoveredItem(item);
        },

        getHoveredItem: function () {
            return this._listModel.getHoveredItem();
        },

        // protected
        _getFooterClasses(): string {
            let leftPadding: string;
            if (this._options.multiSelectVisibility !== 'hidden') {
                leftPadding = 'withCheckboxes';
            } else {
                leftPadding = (this._options.itemPadding && this._options.itemPadding.left || 'default').toLowerCase();
            }
            return `controls-ListView__footer__paddingLeft_${leftPadding}_theme-${this._options.theme}`;
        }
    });

ListView.getDefaultOptions = function() {
    return {
        contextMenuVisibility: true,
        markerVisibility: 'onactivated',
        headerInEmptyListVisible: true
    };
};
ListView._theme = ['Controls/list'];

export = ListView;
