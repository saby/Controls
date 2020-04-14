import Control = require('Core/Control');
import template = require('wml!Controls/_list/AddButton/AddButton');
import entity = require('Types/entity');

/**
 * Специализированный тип кнопки.
 *
 * @class Controls/_list/AddButton
 * @mixes Controls/_buttons/interface/IClick
 * @extends Core/Control
 * @control
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_list/AddButton#caption
 * @cfg {String} Текст заголовка контрола.
 * @example
 * <pre>
 *    <Controls.list:AddButton caption="add record"/>
 * </pre>
 */

/*
 * Specialized type of button.
 *
 * @class Controls/_list/AddButton
 * @extends Core/Control
 * @control
 * @public
 * @author Красильников А.С.
 *
 *
 * @name Controls/_list/AddButton#caption
 * @cfg {String} Control caption text.
 * @example
 * <pre>
 *    <Controls.list:AddButton caption="add record"/>
 * </pre>
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

AddButton._theme = ['Controls/list'];

export = AddButton;
