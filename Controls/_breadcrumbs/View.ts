import Control = require('Core/Control');
import {RecordSet} from 'Types/collection';
import applyHighlighter = require('Controls/Utils/applyHighlighter');
import template = require('wml!Controls/_breadcrumbs/View/View');
import itemTemplate = require('wml!Controls/_breadcrumbs/View/resources/itemTemplate');
import itemsTemplate = require('wml!Controls/_breadcrumbs/View/resources/itemsTemplate');


import menuItemTemplate = require('wml!Controls/_breadcrumbs/resources/menuItemTemplate');
import 'wml!Controls/_breadcrumbs/resources/menuContentTemplate';

/**
 * BreadCrumbs/View.
 *
 * @class Controls/_breadcrumbs/View
 * @extends Core/Control
 * @mixes Controls/interface/IBreadCrumbs
 * @control
 * @private
 * @author Авраменко А.С.
 */

var BreadCrumbsView = Control.extend({
    _template: template,
    _itemsTemplate: itemsTemplate,

    _beforeMount: function () {
        // Эта функция передаётся по ссылке в Opener, так что нужно биндить this, чтобы не потерять его
        this._onResult = this._onResult.bind(this);
    },

    _onItemClick: function (e, itemData) {
            if (!this._options.readOnly) {
                this._notify('itemClick', [itemData.item]);
            }
    },
    _dotsClick: function (e) {
            var rs = new RecordSet({
                rawData: this._options.items.map(function (item) {
                    var newItem = {};
                    item.each(function (field) {
                        newItem[field] = item.get(field);
                    });
                    return newItem;
                }),
                keyProperty: this._options.items[0].getKeyProperty()
            });
            rs.each(function (item, index) {
                item.set('indentation', index);
            });
            this._children.menuOpener.open({
                target: e.currentTarget,
                templateOptions: {
                    items: rs,
                    itemTemplate: menuItemTemplate,
                    displayProperty: this._options.displayProperty
                },
                targetPoint: {
                    vertical: 'bottom',
                    horizontal: 'left'
                },
                direction: {
                    horizontal: 'right'
                },
                fittingMode: 'overflow'
            });
            e.stopPropagation();
    },

    _applyHighlighter: applyHighlighter,

    _onHoveredItemChanged: function (event, item) {
        this._notify('hoveredItemChanged', [item]);
    },

    _onResult: function (event, args) {
        var actionName = args && args.action;

        if (actionName === 'itemClick' && !this._options.readOnly) {
            this._notify('itemClick', [args.data[0]]);
        }
        this._children.menuOpener.close();
    }
});

BreadCrumbsView.getDefaultOptions = function getDefaultOptions() {
    return {
        itemTemplate: itemTemplate
    };
};

BreadCrumbsView._theme = ['Controls/crumbs'];
BreadCrumbsView._styles = ['Controls/Utils/FontLoadUtil'];

export default BreadCrumbsView;
