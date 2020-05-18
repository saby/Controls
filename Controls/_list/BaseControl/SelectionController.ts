import Control = require('Core/Control');
import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');
import collection = require('Types/collection');
import Deferred = require('Core/Deferred');
import template = require('wml!Controls/_list/BaseControl/SelectionController');
import {isEqual} from 'Types/object';

/**
 * @class Controls/_list/BaseControl/SelectionController
 * @extends Core/Control
 * @control
 * @author Авраменко А.С.
 * @private
 */

type TChangeSelectionType = 'selectAll'|'unselectAll'|'toggleAll';

var _private = {
    notifyAndUpdateSelection: function(self, options) {
        const
            selectionCount = self._multiselection.getCount(),
            oldSelectedKeys = options.selectedKeys,
            oldExcludedKeys = options.excludedKeys,
            // selectionCount будет равен нулю, если в списке не отмечено ни одного элемента
            // или после выделения всех записей через "отметить всё", пользователь руками снял чекбоксы со всех записей
            newSelectedKeys = selectionCount === 0 ? [] : self._multiselection.selectedKeys,
            newExcludedKeys = selectionCount === 0 ? [] : self._multiselection.excludedKeys,
            selectedKeysDiff = ArraySimpleValuesUtil.getArrayDifference(oldSelectedKeys, newSelectedKeys),
            excludedKeysDiff = ArraySimpleValuesUtil.getArrayDifference(oldExcludedKeys, newExcludedKeys);

        if (selectedKeysDiff.added.length || selectedKeysDiff.removed.length) {
            self._notify('selectedKeysChanged', [newSelectedKeys, selectedKeysDiff.added, selectedKeysDiff.removed]);
        }

        if (excludedKeysDiff.added.length || excludedKeysDiff.removed.length) {
            self._notify('excludedKeysChanged', [newExcludedKeys, excludedKeysDiff.added, excludedKeysDiff.removed]);
        }

        /*
         TODO: удалить это после того, как количество отмеченных записей будет рассчитываться на БЛ: https://online.sbis.ru/opendoc.html?guid=d9b840ba-8c99-49a5-98d3-78715d10d540
         Такие костыли из-за ситуации, когда прикладники в браузер кладут список, обёрнутый в Container/Scroll, и события перестают всплывать по всем нашим обёрткам, лежащим внутри браузера.
         С большинством событий нет проблем, т.к. наши обёртки ничего с ними не делают, и всё работает по опциям, которые приходят сверху.

         Но в данном случае, событие существует только для связи ПМО и списка, оно должно полностью обрабатываться в браузере.

         Были такие альтернативы:
         1) Заставить прикладников убрать Container/Scroll, чтобы исключить вообще все подобные проблемы.
         Это решение не сработает, т.к. тогда начнут скроллиться поиск, пмо и т.д.

         2) Сделать какую-нибудь обёртку для прикладников, в которую они должны будут заворачивать список, а она будет прокидывать все такие события.
         По идее браузер и есть такая обёртка, так что это решение не очень.

         3) Заставить прикладников прокидывать это событие.
         Они не смогут это правильно сделать, т.к. сейчас на браузере даже нет опции selectedKeysCount.

         4) Прокидывать событие в Container/Scroll.
         Сработает, но Container/Scroll ничего не должен знать про выделение. И не поможет в ситуациях, когда вместо Container/Scroll любая другая обёртка.
         */
        _private.notifySelectedCountChangedEvent(self, newSelectedKeys, newExcludedKeys);
       self._multiselection.updateSelectionForRender();
    },

    getItemsKeys: function (items) {
        return items.map((item => item.getId()));
    },

    isAllSelected(self, selectedKeys, excludedKeys): boolean {
        const model = self._options.listModel;
        const selectedCount = self._multiselection.getCount();
        const selectionCountEqualsItemsCount = !model.getHasMoreData() && selectedCount && selectedCount === model.getCount();
        const root = _private.getRoot(self);

        return !model.getHasMoreData() && selectionCountEqualsItemsCount ||
            selectedKeys.includes(root) && (excludedKeys.length === 0 || excludedKeys.length === 1 && excludedKeys[0] === root);
    },

    isAllSelectedInRoot(self, root): boolean {
        const selectedKeys = self._multiselection.selectedKeys;
        const excludedKeys = self._multiselection.excludedKeys;
        return selectedKeys.includes(root) && (!self._options.parentProperty || excludedKeys.includes(root));
    },

    getRoot(self): number|string|null {
        const model = self._options.listModel;
        return model.getRoot && model.getRoot() ? model.getRoot().getContents() : null;
    },

    notifySelectedCountChangedEvent(self, selectedKeys, excludedKeys): void {
        const count = self._multiselection.getCount();
        const isAllSelected = _private.isAllSelected(self, selectedKeys, excludedKeys);
        self._notify('listSelectedKeysCountChanged', [count, isAllSelected], {bubbling: true});
    },

    onCollectionChange: function (event, action, newItems, newItemsIndex, removedItems) {
        // Можем попасть сюда в холостую, когда старая модель очистилась, а новая еще не пришла
        // выписана задача https://online.sbis.ru/opendoc.html?guid=2ccba240-9d41-4a11-8e05-e45bd922c3ac
        const items = this._options.listModel.getItems();
        if (items) {
            // старая модель возвращает RecordSet, а новая массив
            const countItems = items instanceof Array ? items.length : items.getCount();
            const isAllSelected = _private.isAllSelectedInRoot(this, _private.getRoot(this));
            if (action === collection.IObservable.ACTION_REMOVE) {
                this._multiselection.remove(_private.getItemsKeys(removedItems));
            }
            // Выделение надо сбросить только после вставки новых данных в модель
            // Это необходимо, чтобы чекбоксы сбросились только после отрисовки новых данных,
            // Иначе при проваливании в узел или при смене фильтрации сначала сбросятся чекбоксы,
            // а данные отрисуются только после загрузки
            if (this._resetSelection &&
                action === collection.IObservable.ACTION_RESET ||
                !countItems && isAllSelected
            ) {
                this._resetSelection = false;
                this._multiselection.selectedKeys = [];
                this._multiselection.excludedKeys = [];
            }
            _private.notifyAndUpdateSelection(this, this._options);
        }
    },

    selectedTypeChangedHandler(typeName: TChangeSelectionType, limit?: number|void): void {
        const selectedKeys = this._options.selectedKeys;
        const excludedKeys = this._options.excludedKeys;
        const items = this._options.items;
        const isEmptySelection = !selectedKeys.length && !excludedKeys.length;
        let needChangeSelection = true;

        if ((typeName === 'selectAll' || typeName === 'toggleAll') && isEmptySelection && !items.getCount()) {
            needChangeSelection = false;
        }

        if (needChangeSelection) {
            this._multiselection.setLimit(limit);
            this._multiselection[typeName]();
            _private.notifyAndUpdateSelection(this, this._options);
        }
    },

    getMultiselection: function(options): Promise {
        return new Promise((resolve) => {
           require(['Controls/operations'], (operations) => {
              if (options.parentProperty) {
                 resolve(new operations.HierarchySelection({
                    selectedKeys: options.selectedKeys,
                    excludedKeys: options.excludedKeys,
                    keyProperty: options.keyProperty,
                    parentProperty: options.parentProperty,
                    nodeProperty: options.nodeProperty,
                    hasChildrenProperty: options.hasChildrenProperty,
                    listModel: options.listModel,
                    selectionStrategy: new operations.TreeSelectionStrategy({
                       nodesSourceControllers: options.nodesSourceControllers,
                       selectDescendants: options.selectDescendants,
                       selectAncestors: options.selectAncestors
                    })
                 }));
              } else {
                 resolve(new operations.Selection({
                    selectedKeys: options.selectedKeys,
                    excludedKeys: options.excludedKeys,
                    keyProperty: options.keyProperty,
                    listModel: options.listModel,
                    selectionStrategy: new operations.FlatSelectionStrategy()
                 }));
              }
           });
        });
    },

    isSelectionChanged(self, newOptions): boolean {
        return !isEqual(newOptions.selectedKeys, self._multiselection.selectedKeys) ||
               !isEqual(newOptions.excludedKeys, self._multiselection.excludedKeys);
    },

    shouldResetSelection(self, newOptions): boolean {
        const listFilterChanged = !isEqual(self._options.filter, newOptions.filter);
        const rootChanged = self._options.root !== newOptions.root;
        const isAllSelected = _private.isAllSelectedInRoot(self, _private.getRoot(self));

        return isAllSelected && (rootChanged || listFilterChanged);
    },

    clearSelection(self): void {
        self._multiselection.selectedKeys = [];
        self._multiselection.excludedKeys = [];

        if (self._options.listModel.getCount()) {
            self._multiselection.updateSelectionForRender();
        }
    }
};

var SelectionController = Control.extend(/** @lends Controls/_list/BaseControl/SelectionController.prototype */{
    _template: template,
    _resetSelection: false,
    _beforeMount: function (options) {
        // todo Костыль, т.к. построение ListView зависит от SelectionController.
        // Будет удалено при выполнении одного из пунктов:
        // 1. Все перешли на платформенный хелпер при формировании рекордсета на этапе первой загрузки и удален асинхронный код из SelectionController.beforeMount.
        // 2. Полностью переведен BaseControl на новую модель и SelectionController превращен в умный, упорядоченный менеджер, умеющий работать асинхронно.
        const multiSelectReady = new Deferred();
        if (options.multiSelectReadyCallback) {
            options.multiSelectReadyCallback(multiSelectReady);
        }

        return _private.getMultiselection(options).then((multiselectionInstance) => {
            this._multiselection = multiselectionInstance;
            this._multiselection.updateSelectionForRender();
            multiSelectReady.callback();
        });
    },

    _afterMount(): void {
        const options = this._options;

        this._notify('register', ['selectedTypeChanged', this, _private.selectedTypeChangedHandler], {bubbling: true});
        _private.notifySelectedCountChangedEvent(this, options.selectedKeys, options.excludedKeys);

        this._onCollectionChangeHandler = _private.onCollectionChange.bind(this);
        options.items.subscribe('onCollectionChange', this._onCollectionChangeHandler);
    },

    _beforeUpdate: function (newOptions) {
        const itemsChanged = newOptions.items !== this._options.items;
        const modelChanged = this._options.listModel !== newOptions.listModel;
        const selectionChanged = _private.isSelectionChanged(this, newOptions);

        if (this._options.keyProperty !== newOptions.keyProperty) {
           this._multiselection.setKeyProperty(newOptions.keyProperty);
        }

        if (modelChanged) {
            this._multiselection.setListModel(newOptions.listModel);
        }

        if (itemsChanged) {
            this._options.items.unsubscribe('onCollectionChange', this._onCollectionChangeHandler);
            newOptions.items.subscribe('onCollectionChange', this._onCollectionChangeHandler);
        }

        if (_private.shouldResetSelection(this, newOptions)) {
            this._resetSelection = true;
        } else if (selectionChanged) {
            this._multiselection.selectedKeys = newOptions.selectedKeys;
            this._multiselection.excludedKeys = newOptions.excludedKeys;
            _private.notifyAndUpdateSelection(this, newOptions);
        } else if (itemsChanged || modelChanged) {
           this._multiselection.updateSelectionForRender();
        }
    },

    onCheckBoxClick: function (key, status) {
        if (status === true || status === null) {
            this._multiselection.unselect([key]);
        } else {
            this._multiselection.select([key]);
        }
        _private.notifyAndUpdateSelection(this, this._options);
    },

    _beforeUnmount: function () {
        _private.clearSelection(this);
        this._notify('listSelectedKeysCountChanged', [0], {bubbling: true});
        this._multiselection = null;
        this._options.items.unsubscribe('onCollectionChange', this._onCollectionChangeHandler);
        this._onCollectionChangeHandler = null;
        this._notify('unregister', ['selectedTypeChanged', this], {bubbling: true});
    }
});

SelectionController._private = _private;

export = SelectionController;
