import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_menu/Popup/headerTemplate');
import 'css!Controls/popupTemplate';
import 'css!Controls/menu';
import 'css!Controls/CommonClasses';

/**
 * Контрол шапка меню.
 * @class Controls/menu:HeaderTemplate
 * @extends UI/_base/Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_interface/IIconSize
 * @public
 *
 * @author Герасимов А.М.
 */

class Header extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    static getDefaultOptions(): object {
        return {
            iconSize: 'm'
        };
    }
}

Object.defineProperty(Header, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Header.getDefaultOptions();
   }
});

export default Header;
