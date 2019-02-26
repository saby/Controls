import Control = require('Core/Control');
import template = require('wml!Controls/List/AddButton/AddButton');
import entity = require('Types/entity');
require('css!theme?Controls/List/AddButton/AddButton');

/**
 *
 * @mixes Controls/List/AddButton/Styles
 *
 */

var AddButton = Control.extend({
    _template: template,

    clickHandler: function (e) {
        if (this._options.readOnly) {
            e.stopPropagation();
        }
    }
});

AddButton.getOptionTypes = function getOptionTypes() {
    return {
        caption: entity.descriptor(String)
    };
};

export = AddButton;
