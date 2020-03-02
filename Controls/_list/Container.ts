import Control = require('Core/Control');
import template = require('wml!Controls/_list/Container');
import {ContextOptions as DataOptions} from 'Controls/context';

/**
 * Контрол-контейнер для списка. Передает опции из контекста в список.
 *
 * Подробнее читайте <a href='/doc/platform/developmentapl/interface-development/controls/list-environment/component-kinds/'>здесь</a>.
 *
 * @class Controls/_list/Container
 * @extends Core/Control
 * @author Герасимов А.М.
 * @public
 */

/*
 * Container component for List. Pass options from context to list.
 *
 * More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/component-kinds/'>here</a>.
 *
 * @class Controls/_list/Container
 * @extends Core/Control
 * @author Герасимов А.М.
 * @public
 */

var List = Control.extend({

    _template: template,

    _beforeMount: function (options, context) {
        this._dataOptions = context.dataOptions;
    },
    _expandedItemsChanged(event, expandedItems) {
        this._notify('listExpandedItemsChanged', [expandedItems], { bubbling: true });
    },
    _beforeUpdate: function (options, context) {
        this._dataOptions = context.dataOptions;
    }

});

List.contextTypes = function () {
    return {
        dataOptions: DataOptions
    };
};

export = List;
