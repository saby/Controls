import Control = require('Core/Control');
import template = require('wml!Controls/_grid/SortButton');

/**
 * Graphical control element that used for changing sorting in Grid control
 *
 * @class Controls/_grid/SortButton
 * @extends Core/Control
 * @mixes Controls/_grid/SortButton/Styles
 * @private
 */

/**
 * @name Controls/_grid/SortButton#type
 * @cfg {String} Type of sorting.
 * @variant single Sorting by single field.
 * @variant multi Allows you to sort by multiple fields.
 */

/**
 * @name Controls/_grid/SortButton#property
 * @cfg {String} Sorting property.
 */
const SortButton = Control.extend({
    _template: template,

    _clickHandler: function () {
        this._notify('sortingChanged', [this._options.property, this._options.type], {bubbling: true});
    }

});

SortButton._theme = ['Controls/grid'];
export =SortButton;