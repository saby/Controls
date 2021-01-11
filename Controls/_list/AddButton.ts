import {Control} from 'UI/Base';
import template = require('wml!Controls/_list/AddButton/AddButton');
import entity = require('Types/entity');

/**
 * Специализированный тип кнопки.
 * 
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less переменные тем оформления}
 *
 * @class Controls/_list/AddButton
 * @mixes Controls/_buttons/interface/IClick
 * @extends UI/Base:Control
 * 
 * @public
 * @author Красильников А.С.
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

/**
 * @name Controls/_list/AddButton#caption
 * @cfg {String} Текст заголовка контрола.
 * @example
 * <pre class="brush: html">
 * <Controls.list:AddButton caption="add record"/>
 * </pre>
 */

/*
 * Specialized type of button.
 *
 * @class Controls/_list/AddButton
 * @extends UI/Base:Control
 * 
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
export = AddButton;
