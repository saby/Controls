/**
 * Created by kraynovdo on 22.09.2017.
 */
import BaseControl = require('Core/Control');
import {debounce as cDebounce} from 'Types/function';
import {Logger} from 'UI/Utils';
import ListViewTpl = require('wml!Controls/_list/ListView/ListView');
import defaultItemTemplate = require('wml!Controls/_list/ItemTemplate');
import GroupTemplate = require('wml!Controls/_list/GroupTemplate');
import {isEqual} from "Types/object";

const DEBOUNCE_HOVERED_ITEM_CHANGED = 150;

var _private = {
    checkDeprecated: function(cfg, self) {
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
        _pendingRedraw: false,
        _reloadInProgress: false,
        _callbackAfterReload: null,

        constructor: function() {
            ListView.superclass.constructor.apply(this, arguments);
            this._debouncedSetHoveredItem = cDebounce(_private.setHoveredItem, DEBOUNCE_HOVERED_ITEM_CHANGED);
            this._onListChangeFnc = (event, changesType, action, newItems) => {
               // todo refactor by task https://online.sbis.ru/opendoc.html?guid=80fbcf1f-5804-4234-b635-a3c1fc8ccc73
               // Из новой коллекции нотифается collectionChanged, в котором тип изменений указан в newItems.properties
               const itemChangesType = newItems ? newItems.properties : null;
               if (changesType !== 'hoveredItemChanged' &&
                  changesType !== 'activeItemChanged' &&
                  changesType !== 'loadingPercentChanged' &&
                  changesType !== 'markedKeyChanged' &&
                  changesType !== 'itemActionsUpdated' &&
                  itemChangesType !== 'marked' &&
                  itemChangesType !== 'hovered' &&
                  itemChangesType !== 'active' &&
                  !this._pendingRedraw) {
                  this._pendingRedraw = true;
               }
            };
        },

        _doAfterReload(callback): void {
            if (this._reloadInProgress) {
                if (this._callbackAfterReload) {
                    this._callbackAfterReload.push(callback);
                } else {
                    this._callbackAfterReload = [callback];
                }
            } else {
                callback();
            }
        },

        setReloadingState(state): void {
            this._reloadInProgress = state;
            if (state === false && this._callbackAfterReload) {
                if (this._callbackAfterReload) {
                    this._callbackAfterReload.forEach((callback) => {
                        callback();
                    });
                    this._callbackAfterReload = null;
                }
            }
        },

       _beforeMount: function(newOptions) {
            _private.checkDeprecated(newOptions, this);
            if (newOptions.groupTemplate) {
                this._groupTemplate = newOptions.groupTemplate;
            }
            if (newOptions.listModel) {
                this._listModel = newOptions.listModel;
                this._listModel.subscribe('onListChange', this._onListChangeFnc);

                // Если изменить опцию модели пока ListView не построена, то они и не применятся.
                this._listModel.setItemPadding(newOptions.itemPadding, true);
            }
            this._itemTemplate = this._resolveItemTemplate(newOptions);
        },

        _beforeUnmount: function() {
            if (this._listModel) {
                this._listModel.unsubscribe('onListChange', this._onListChangeFnc);
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
            this._notify('itemsContainerReady', [this.getItemsContainer.bind(this)]);
            // корректное значение _listModel.markedKey устанавливается в BaseControl после получения данных
            // методом BaseControl.reload() и событие 'onMarkedKeyChanged' модели ListViewModel
            // вызывается до того, как в ListView._beforeMount() на него делается подписка
            // может, задействовать Env/Event:Bus?
            if ((this._options.markedKey === undefined || _private.checkMarkedKeyHasChangedInModel(this)) &&
                _private.checkMarkerShouldBeVisible(this)) {
                this._notify('markedKeyChanged', [this._listModel.getMarkedKey()]);
            }
            // todo костыль до тех пор, пока не перейдем на отслеживание ресайза через нативное событие в двух основныых
            // местах - в окнах и в scrollContainer'e.
            // https://online.sbis.ru/opendoc.html?guid=4409ca19-6e5d-41af-b080-5431dbd8887c
            if (this._options.notifyResizeAfterMount !== false) {
                this._notify('controlResize', [], {bubbling: true});
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
                this._notify('itemClick', [item, e]);
            }
        },

        _onGroupClick: function(e, dispItem) {
            var item = dispItem.getContents();
            this._notify('groupClick', [item, e], {bubbling: true});
        },

        _onItemContextMenu: function(event, itemData) {
           if (this._options.contextMenuEnabled !== false && this._options.contextMenuVisibility !== false && !this._options.listModel.isEditing()) {
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
            if (itemData && itemData.isSwiped()) {
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
        },

        activateEditingRow(): boolean {
            if (this._children.editingRow) {
                this._children.editingRow.activate();
                return true;
            }
            return false;
        }
    });

ListView.getDefaultOptions = function() {
    return {
        contextMenuVisibility: true,
        markerVisibility: 'onactivated'
    };
};
ListView._theme = ['Controls/list'];

export = ListView;
