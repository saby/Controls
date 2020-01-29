import Control = require('Core/Control');
import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');
import collection = require('Types/collection');
import Deferred = require('Core/Deferred');
import template = require('wml!Controls/_list/BaseControl/SelectionController');
import {isEqual} from 'Types/object';
import merge = require('Core/core-merge');

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
            itemsCount = self._options.items.getCount(),
            model = self._options.listModel,
            root = model.getRoot ? model.getRoot().getContents() : null,
            oldSelectedKeys = options.selectedKeys,
            oldExcludedKeys = options.excludedKeys,
            // selectionCount будет равен нулю, если в списке не отмечено ни одного элемента
            // или после выделения всех записей через "отметить всё", пользователь руками снял чекбоксы со всех записей
            newSelectedKeys = selectionCount === 0 ? [] : self._multiselection.selectedKeys,
            newExcludedKeys = selectionCount === 0 ? [] : self._multiselection.excludedKeys,
            selectedKeysDiff = ArraySimpleValuesUtil.getArrayDifference(oldSelectedKeys, newSelectedKeys),
            excludedKeysDiff = ArraySimpleValuesUtil.getArrayDifference(oldExcludedKeys, newExcludedKeys),
            isAllSelected = !model.getHasMoreData() && selectionCount === itemsCount ||
               newSelectedKeys.includes(root) && (newExcludedKeys.length === 0 || newExcludedKeys.length === 1 && newExcludedKeys[0] === root);

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
       self._notify('listSelectedKeysCountChanged', [selectionCount, isAllSelected], {bubbling: true});
       self._multiselection.updateSelectionForRender();
    },

    getItemsKeys: function (items) {
        var keys = [];
        items.forEach(function (item) {
            keys.push(item.getId());
        });
        return keys;
    },

    onCollectionChange: function (event, action, newItems, newItemsIndex, removedItems) {
        // Можем попасть сюда в холостую, когда старая модель очистилась, а новая еще не пришла
        // выписана задача https://online.sbis.ru/opendoc.html?guid=2ccba240-9d41-4a11-8e05-e45bd922c3ac
        if (this._options.listModel.getItems()) {
            if (action === collection.IObservable.ACTION_REMOVE) {
                this._multiselection.remove(_private.getItemsKeys(removedItems));
            }
            _private.notifyAndUpdateSelection(this, this._options);
        }
    },

    selectedTypeChangedHandler(typeName: TChangeSelectionType, limit?: number|void): void {
        const selectedKeys = this._options.selectedKeys;
        const excludedKeys = this._options.excludedKeys;
        const items = this._options.items;
        let needChangeSelection = true;

        if (typeName === 'selectAll' && !selectedKeys.length && !excludedKeys.length && !items.getCount()) {
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
    }
};

var SelectionController = Control.extend(/** @lends Controls/_list/BaseControl/SelectionController.prototype */{
    _template: template,
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

    _afterMount: function () {
        this._notify('register', ['selectedTypeChanged', this, _private.selectedTypeChangedHandler], {bubbling: true});
        this._notify('listSelectedKeysCountChanged', [this._multiselection.getCount()], {bubbling: true});

        this._onCollectionChangeHandler = _private.onCollectionChange.bind(this);
        this._options.items.subscribe('onCollectionChange', this._onCollectionChangeHandler);
    },

    _beforeUpdate: function (newOptions) {
        let
           itemsIsChanged = newOptions.items !== this._options.items,
           modelIsChanged = this._options.listModel !== newOptions.listModel,
           selectionChanged = !isEqual(newOptions.selectedKeys, this._multiselection.selectedKeys) ||
              !isEqual(newOptions.excludedKeys, this._multiselection.excludedKeys);

        if (this._options.keyProperty !== newOptions.keyProperty) {
           this._multiselection.setKeyProperty(newOptions.keyProperty);
        }

        if (modelIsChanged) {
            this._multiselection.setListModel(newOptions.listModel);
        }

        if (itemsIsChanged) {
            this._options.items.unsubscribe('onCollectionChange', this._onCollectionChangeHandler);
            newOptions.items.subscribe('onCollectionChange', this._onCollectionChangeHandler);
        }

        if (selectionChanged) {
            this._multiselection.selectedKeys = newOptions.selectedKeys;
            this._multiselection.excludedKeys = newOptions.excludedKeys;
            _private.notifyAndUpdateSelection(this, newOptions);
        } else if (itemsIsChanged || modelIsChanged) {
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
        this._options.listModel.updateSelection({});
        this._multiselection = null;
        this._options.items.unsubscribe('onCollectionChange', this._onCollectionChangeHandler);
        this._onCollectionChangeHandler = null;
        this._notify('unregister', ['selectedTypeChanged', this], {bubbling: true});
    }
});

SelectionController._private = _private;

export = SelectionController;
