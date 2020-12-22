/**
 * Created by kraynovdo on 22.09.2017.
 */
import BaseControl = require('Core/Control');
import {debounce as cDebounce} from 'Types/function';
import {Logger} from 'UI/Utils';
import ListViewTpl = require('wml!Controls/_list/ListView/ListView');
import GroupTemplate = require('wml!Controls/_list/GroupTemplate');
import defaultItemTemplate = require('wml!Controls/_list/ItemTemplate');
import * as forTemplate from 'wml!Controls/_list/Render/For';
import * as oldForTemplate from 'wml!Controls/_list/resources/For';

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
        _forTemplate: null,

        constructor: function() {
            ListView.superclass.constructor.apply(this, arguments);
            this._debouncedSetHoveredItem = cDebounce(_private.setHoveredItem, DEBOUNCE_HOVERED_ITEM_CHANGED);
           // TODO при полном переходе на новую модель нужно переписать, уберется параметр changesType
           this._onListChangeFnc = (event, changesType, action, newItems) => {
               // todo refactor by task https://online.sbis.ru/opendoc.html?guid=80fbcf1f-5804-4234-b635-a3c1fc8ccc73
               // Из новой коллекции нотифается collectionChanged, в котором тип изменений указан в newItems.properties
               let itemChangesType;
               if (this._options.useNewModel) {
                  // В событии новой модели нет такого параметра как changesType, из-за этого в action лежит newItems
                  itemChangesType = action ? action.properties : null;
               } else {
                  itemChangesType = newItems ? newItems.properties : null;
               }

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

                if (newOptions.useNewModel) {
                    this._listModel.subscribe('onCollectionChange', this._onListChangeFnc);
                } else {
                    this._listModel.subscribe('onListChange', this._onListChangeFnc);
                    // Если изменить опцию модели пока ListView не построена, то они и не применятся.
                    this._listModel.setItemPadding(newOptions.itemPadding, true);
                }
            }
            if (newOptions.useNewModel) {
                this._forTemplate = forTemplate;
            } else {
                this._forTemplate = oldForTemplate;
            }
            this._itemTemplate = this._resolveItemTemplate(newOptions);
        },

        _beforeUnmount: function() {
            if (this._listModel && !this._listModel.destroyed) {
                this._listModel.unsubscribe('onListChange', this._onListChangeFnc);
            }
        },

        _beforeUpdate: function(newOptions) {
            if (newOptions.listModel && (this._listModel != newOptions.listModel)) {
                this._listModel = newOptions.listModel;
                this._listModel.subscribe('onListChange', this._onListChangeFnc);
            }
            if (this._options.groupTemplate !== newOptions.groupTemplate) {
                this._groupTemplate = newOptions.groupTemplate;
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
                if (this._options.useNewModel) {
                    if (dispItem['[Controls/_display/GroupItem]']) {
                        const groupItem = dispItem.getContents();
                        this._notify('groupClick', [groupItem, e, dispItem], {bubbling: true});
                        return;
                    }
                }
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

        /**
         * Обработчик долгого тапа
         * @param event
         * @param itemData
         * @private
         */
        _onItemLongTap(event, itemData): void {
            if (this._options.contextMenuEnabled !== false && this._options.contextMenuVisibility !== false && !this._options.listModel.isEditing()) {
                this._notify('itemLongTap', [itemData, event]);
            }
        },

        _onItemSwipe: function(event, itemData) {
            if (event.nativeEvent.direction === 'left') {
                this.activate();
            }
            this._notify('itemSwipe', [itemData, event]);
            event.stopPropagation();
        },

        _onRowDeactivated: function(event, eventOptions) {
            this._notify('rowDeactivated', [eventOptions]);
        },

        _onItemMouseDown: function(event, itemData) {
            if (this._options.useNewModel) {
                if (itemData['[Controls/_display/GroupItem]']) {
                    event.stopPropagation();
                    return;
                }
            }
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
            if (this._options.useNewModel) {
                if (itemData['[Controls/_display/GroupItem]']) {
                    e.stopPropagation();
                    return;
                }
            }
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

        activateEditingRow(enableScrollToElement?: boolean): boolean {
            if (this._children.editingRow) {
                this._children.editingRow.activate({ enableScrollToElement });
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
