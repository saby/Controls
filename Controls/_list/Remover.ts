import BaseAction from 'Controls/_list/BaseAction';
import Deferred = require('Core/Deferred');
import {ContextOptions as dataOptions} from 'Controls/context';
import {RemoveController} from './Controllers/RemoveController';

let _private = {
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

    updateDataOptions: function (self, dataOptions) {
        if (dataOptions) {
            if (!self._controller) {
                self._controller = new RemoveController(dataOptions.source, dataOptions.items, dataOptions.filter);
            } else {
                self._controller.update(dataOptions.source, dataOptions.items, dataOptions.filter);
            }
        }
    }
};

/**
 * Контрол для удаления элементов списка в recordSet и dataSource.
 * Контрол должен располагаться в том же контейнере (см. {@link Controls/list:DataContainer}), что и список.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FRemove">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/actions/remover/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления</a>
 *
 * @class Controls/_list/Remover
 * @extends Controls/_list/BaseAction
 * @mixes Controls/interface/IRemovable
 * @control
 * @public
 * @author Авраменко А.С.
 * @category List
 */

/*
 * Сontrol to remove the list items in recordSet and dataSource.
 * Сontrol must be in one Controls.Container.Data with a list.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo">Demo examples</a>.
 * @class Controls/_list/Remover
 * @extends Controls/_list/BaseAction
 * @mixes Controls/interface/IRemovable
 * @control
 * @public
 * @author Авраменко А.С.
 * @category List
 */

const Remover = BaseAction.extend({
    _controller: null,

    _beforeMount: function (options, context) {
        _private.updateDataOptions(this, context.dataOptions);
    },

    _beforeUpdate: function (options, context) {
        _private.updateDataOptions(this, context.dataOptions);
    },

    removeItems(items: string[]): Promise<void> {
        return this._controller.getSelectedItems(items).then((selectedItems) => (
            _private.beforeItemsRemove(this, selectedItems)
                .addCallback((result) => {
                    if (result !== false) {
                        const both = (removeResult) => {
                            return _private.afterItemsRemove(this, selectedItems, removeResult).then((eventResult) => {
                                if (eventResult === false || !(removeResult instanceof Error)) {
                                    return;
                                }
                                this._notify('dataError', [{ error: removeResult }]);
                            });
                        }
                        return (this._controller as RemoveController).removeItems(selectedItems)
                            .then((removeResult) => both(removeResult))
                            .catch((removeResult) => both(removeResult))
                    }
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
