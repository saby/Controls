import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_menu/Popup/headerTemplate');

/**
 * Контрол шапка меню.
 * @class Controls/menu:HeaderTemplate
 * @extends UI/_base/Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_interface/IIconSize
 * @public
 * @control
 * @author Герасимов А.М.
 */

class Header extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    static _theme: string[] = ['Controls/Classes', 'Controls/menu', 'Controls/popupTemplate'];

    static getDefaultOptions(): object {
        return {
            iconSize: 'm'
        };
    }
}
export default Header;
