import {CrudEntityKey} from 'Types/source';
import BaseAction from 'Controls/_list/BaseAction';
import Deferred = require('Core/Deferred');
import {getItemsBySelection} from 'Controls/_list/resources/utils/getItemsBySelection';
import {ContextOptions as dataOptions} from 'Controls/context';

var _private = {
    removeFromSource(self, items): Promise<void> {
        return self._source.destroy(items);
    },

    removeFromItems: function (self, items) {
        var item;
        self._items.setEventRaising(false, true);
        for (var i = 0; i < items.length; i++) {
            item = self._items.getRecordById(items[i]);
            if (item) {
                self._items.remove(item);
            }
        }
        self._items.setEventRaising(true, true);
    },

    beforeItemsRemove: function (self, items) {
        const beforeItemsRemoveResult = self._notify('beforeItemsRemove', [items]);
        return beforeItemsRemoveResult instanceof Deferred || beforeItemsRemoveResult instanceof Promise ?
            beforeItemsRemoveResult : Deferred.success(beforeItemsRemoveResult);
    },

    afterItemsRemove: function (self, items, result) {
        var afterItemsRemoveResult = self._notify('afterItemsRemove', [items, result]);

        //According to the standard, after moving the items, you need to unselect all in the table view.
        //The table view and Mover are in a common container (Control.Container.MultiSelector) and do not know about each other.
        //The only way to affect the selection in the table view is to send the selectedTypeChanged event.
        //You need a schema in which Mover will not work directly with the selection.
        //Will be fixed by: https://online.sbis.ru/opendoc.html?guid=dd5558b9-b72a-4726-be1e-823e943ca173
        self._notify('selectedTypeChanged', ['unselectAll'], {
            bubbling: true
        });

        return Promise.resolve(afterItemsRemoveResult);
    },

    updateDataOptions: function (self, newOptions, contextDataOptions) {
        self._keyProperty = newOptions.keyProperty ? newOptions.keyProperty : contextDataOptions.keyProperty;
        self._items = newOptions.items ? newOptions.items : contextDataOptions.items;
        self._source = newOptions.source ? newOptions.source : contextDataOptions.source;
        self._filter = newOptions.filter ? newOptions.filter : contextDataOptions.filter;
    },

    getItemsBySelection(self, items): Promise<CrudEntityKey[]> {
        //Support removing with mass selection.
        //Full transition to selection will be made by:
        // https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
        return items instanceof Array
            ? Promise.resolve(items)
            : getItemsBySelection(items, self._source, self._items, self._filter, null, self._options.selectionTypeForAllSelected);
    }
};

/**
 * Контрол для удаления элементов списка в recordSet и dataSource.
 * Контрол должен располагаться в том же контейнере (см. {@link Controls/list:DataContainer}), что и список.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FList%2FRemove демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/actions/remover/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_list.less переменные тем оформления}
 *
 * @class Controls/_list/Remover
 * @extends Controls/_list/BaseAction
 * @mixes Controls/interface/IRemovable
 * 
 * @public
 * @author Авраменко А.С.
 */

/*
 * Сontrol to remove the list items in recordSet and dataSource.
 * Сontrol must be in one Controls.Container.Data with a list.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo">Demo examples</a>.
 * @class Controls/_list/Remover
 * @extends Controls/_list/BaseAction
 * @mixes Controls/interface/IRemovable
 * 
 * @public
 * @author Авраменко А.С.
 */

var Remover = BaseAction.extend({
    _beforeMount: function (options, context) {
        _private.updateDataOptions(this, options, context.dataOptions);
    },

    _beforeUpdate: function (options, context) {
        _private.updateDataOptions(this, options, context.dataOptions);
    },

    removeItems(items: string[]): Promise<void> {
        const both = (result) => {
            return _private.afterItemsRemove(this, items, result).then((eventResult) => {
                if (eventResult === false || !(result instanceof Error)) {
                    return;
                }

                this._notify('dataError', [{ error: result }]);
            });
        }
        return _private.getItemsBySelection(this, items).then((items) => (
            _private.beforeItemsRemove(this, items).then((result) => {
                // если отменили удаление, то надо вернуть false
                if (result === false) {
                    return Promise.resolve(result);
                }
                return _private.removeFromSource(this, items).then((result) => {
                    _private.removeFromItems(this, items);
                    return result;
                })
                    .then((result) => both(result))
                    .catch((result) => both(result));
            })
        ));
    }
});

Remover.contextTypes = function () {
    return {
        dataOptions: dataOptions
    };
};

export = Remover;
