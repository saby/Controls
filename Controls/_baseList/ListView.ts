import {Logger} from 'UI/Utils';
import {_Options, SyntheticEvent} from 'UI/Vdom';
import {isEqual} from 'Types/object';
import {Control} from 'UI/Base';
import {debounce as cDebounce} from 'Types/function';
import * as forTemplate from 'wml!Controls/_baseList/Render/For';
import * as GroupTemplate from 'wml!Controls/_baseList/GroupTemplate';
import * as ListViewTpl from 'wml!Controls/_baseList/ListView/ListView';
import * as defaultItemTemplate from 'wml!Controls/_baseList/ItemTemplate';
import 'css!Controls/baseList';

const DEBOUNCE_HOVERED_ITEM_CHANGED = 150;

const _private = {
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
        if (cfg.groupingKeyCallback) {
            Logger.warn('IList: Option "groupingKeyCallback" is deprecated and removed soon. Use options "groupProperty".', self);
        }
    },

    resizeNotifyOnListChanged: function(self) {
       // command to scroll watcher
       self._notify('controlResize', [], {bubbling: true});
    },

    setHoveredItem: function(self, itemData, nativeEvent) {
        // setHoveredItem вызывается с задержкой, поэтому список уже может задестроиться
        // Не надо посылать ховер по элементам, которые нельзя выбирать
        if (self._destroyed || (itemData && itemData.SelectableItem === false)) {
            return;
        }

        const item = itemData?.item;
        if (item !== self._hoveredItem) {
            self._hoveredItem = item;
            var container = nativeEvent ? nativeEvent.target.closest('.controls-ListView__itemV') : null;
            self._notify('hoveredItemChanged', [item, container]);
        }
    }
};

const ListView = Control.extend(
    {
        _listModel: null,
        _hoveredItem: null,
        _template: ListViewTpl,
        _groupTemplate: GroupTemplate,
        _defaultItemTemplate: defaultItemTemplate,
        _pendingRedraw: false,
        _reloadInProgress: false,
        _callbackAfterReload: null,
        _callbackAfterUpdate: null,
        _forTemplate: null,

        constructor: function() {
            ListView.superclass.constructor.apply(this, arguments);
            this._debouncedSetHoveredItem = cDebounce(_private.setHoveredItem, DEBOUNCE_HOVERED_ITEM_CHANGED);
           // TODO при полном переходе на новую модель нужно переписать, уберется параметр changesType
           this._onListChangeFnc = (event, changesType, action, newItems) => {
               if (this._destroyed) {
                   return;
               }
               if (this._isPendingRedraw(event, changesType, action, newItems)) {
                  this._pendingRedraw = true;
               }
            };
        },

        _isPendingRedraw(event, changesType, action, newItems) {
            // todo refactor by task https://online.sbis.ru/opendoc.html?guid=80fbcf1f-5804-4234-b635-a3c1fc8ccc73
            // Из новой коллекции нотифается collectionChanged, в котором тип изменений указан в newItems.properties
            let itemChangesType;
            // В событии новой модели нет такого параметра как changesType, из-за этого в action лежит newItems
            itemChangesType = action ? action.properties : null;

            if (changesType !== 'hoveredItemChanged' &&
                changesType !== 'activeItemChanged' &&
                changesType !== 'loadingPercentChanged' &&
                changesType !== 'markedKeyChanged' &&
                changesType !== 'itemActionsUpdated' &&
                itemChangesType !== 'marked' &&
                itemChangesType !== 'hovered' &&
                itemChangesType !== 'active' &&
                itemChangesType !== 'canShowActions' &&
                itemChangesType !== 'animated' &&
                itemChangesType !== 'fixedPosition') {
                return true;
            }
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

        _doAfterUpdate(callback): void {
            if (this._updateInProgress) {
                if (this._callbackAfterUpdate) {
                    this._callbackAfterUpdate.push(callback);
                } else {
                    this._callbackAfterUpdate = [callback];
                }
            } else {
                callback();
            }
        },

        _doOnComponentDidUpdate(callback): void {
            if (this._waitingComponentDidUpdate) {
                if (this._callbackOnComponentDidUpdate) {
                    this._callbackOnComponentDidUpdate.push(callback);
                } else {
                    this._callbackOnComponentDidUpdate = [callback];
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

                this._listModel.subscribe('onCollectionChange', this._onListChangeFnc);
            }
            this._forTemplate = forTemplate;
            this._itemTemplate = this._resolveItemTemplate(newOptions);
        },

        _beforeUnmount: function() {
            if (this._listModel && !this._listModel.destroyed) {
                this._listModel.unsubscribe('onListChange', this._onListChangeFnc);
            }
        },

        _beforeUpdate: function(newOptions) {
            this._updateInProgress = true;
            this._waitingComponentDidUpdate = true;
            if (newOptions.listModel && (this._listModel != newOptions.listModel)) {
                this._listModel = newOptions.listModel;
                this._listModel.subscribe('onListChange', this._onListChangeFnc);
            }
            if (this._options.groupTemplate !== newOptions.groupTemplate) {
                this._groupTemplate = newOptions.groupTemplate;
            }
            if (!isEqual(this._options.roundBorder, newOptions.roundBorder)) {
                this._listModel.setRoundBorder(newOptions.roundBorder);
            }
            this._itemTemplate = this._resolveItemTemplate(newOptions);

            this._applyNewOptionsAfterReload(this._options, newOptions);
        },

        _componentDidUpdate() {
            this._waitingComponentDidUpdate = false;
            if (this._callbackOnComponentDidUpdate) {
                this._callbackOnComponentDidUpdate.forEach((callback) => {
                    callback();
                });
                this._callbackOnComponentDidUpdate = null;
            }
        },

        _afterUpdate() {
            this._updateInProgress = false;
            if (this._callbackAfterUpdate) {
                this._callbackAfterUpdate.forEach((callback) => {
                    callback();
                });
                this._callbackAfterUpdate = null;
            }
        },

        // Сброс к изначальному состоянию без ремаунта, например при reload'е.
        reset(params: {keepScroll?: boolean} = {}): void {
        },

        _resolveItemTemplate(options) {
           return options.itemTemplate || this._defaultItemTemplate;
        },

        // protected
        /**
         * Метод предназначен для перекрытия в потомках что бы можно было реализовать
         * кастомную проверку и обновление модели
         */
        _applyNewOptionsAfterReload(oldOptions: unknown, newOptions: unknown): void {
            const changes = [];
            const changedOptions = _Options.getChangedOptions(newOptions, oldOptions);

            if (changedOptions) {
                if (changedOptions.hasOwnProperty('stickyFooter') || changedOptions.hasOwnProperty('footerTemplate')) {
                    changes.push('footer');
                }
            }

            if (changes.length) {
                this._doAfterReload(() => {
                    if (changes.includes('footer')) {
                        this._listModel.setFooter(newOptions);
                    }
                });
            }
        },

        onViewResized: function() {
            _private.resizeNotifyOnListChanged(this);
        },

        _componentDidMount: function() {
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
                this.onViewResized();
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
                if (dispItem['[Controls/_display/GroupItem]']) {
                    const groupItem = dispItem.getContents();
                    this._notify('groupClick', [groupItem, e, dispItem], {bubbling: true});
                    return;
                }
                if (e.target.closest('.js-controls-ListView__checkbox')) {
                    this._notify('checkBoxClick', [dispItem, e]);
                    return;
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
            if (itemData['[Controls/_display/GroupItem]']) {
                event.stopPropagation();
                return;
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
            if (itemData['[Controls/_display/GroupItem]']) {
                e.stopPropagation();
                return;
            }
            this._notify('itemMouseUp', [itemData, e]);
        },

        _onItemMouseEnter: function(event, itemData) {
            this._notify('itemMouseEnter', [itemData, event]);
            this._debouncedSetHoveredItem(this, itemData, event);
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

        // region Indicators

        getTopLoadingTrigger(): HTMLElement {
            return this._children.topLoadingTrigger;
        },

        getBottomLoadingTrigger(): HTMLElement {
            return this._children.bottomLoadingTrigger;
        },

        _onIndicatorClick(event: SyntheticEvent): void {
            if (event.target.closest('.js-controls-BaseControl__continueSearch')) {
                this._notify('continueSearchClick');
            }
            if (event.target.closest('.js-controls-BaseControl__abortSearch')) {
                this._notify('abortSearchClick');
            }
        },

        // endregion Indicators

        setHoveredItem: function (item) {
            this._listModel.setHoveredItem(item);
        },

        getHoveredItem: function () {
            return this._listModel.getHoveredItem();
        },

        // protected
        _getFooterClasses(): string {
            let result = 'controls-ListView__footer';

            if (this._options.itemActionsPosition === 'outside') {
                result += ' controls-ListView__footer__itemActionsV_outside';
            }

            let leftPadding: string;
            if (this._options.multiSelectVisibility !== 'hidden') {
                leftPadding = 'withCheckboxes';
            } else {
                leftPadding = (this._options.itemPadding && this._options.itemPadding.left || 'default').toLowerCase();
            }
            result += ` controls-ListView__footer__paddingLeft_${leftPadding}`;

            return result;
        },

        activateEditingRow(enableScrollToElement?: boolean): boolean {
            if (this._children.editingRow) {
                this._children.editingRow.activate({ enableScrollToElement });
                return true;
            }
            return false;
        },

        _onEditingItemClick(e): void {
            e.stopPropagation();
        }
    });

ListView.getDefaultOptions = function() {
    return {
        contextMenuVisibility: true,
        markerVisibility: 'onactivated'
    };
};

Object.defineProperty(ListView, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ListView.getDefaultOptions();
   }
});

export = ListView;
