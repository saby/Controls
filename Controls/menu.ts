/**
 * Библиотека контролов, которые реализуют элемент интерфейса, позволяющий выбрать одну или несколько перечисленных опций.
 * Может отображаться на странице или в выпадающем блоке.
 * @library Controls/menu
 * @includes Control Controls/menu:Control
 * @includes Popup Controls/menu:Popup
 * @includes IMenuBaseOptions Controls/_menu/interface/IMenuBase
 * @includes IMenuControlOptions Controls/_menu/interface/IMenuControl
 * @includes IMenuPopupOptions Controls/_menu/interface/IMenuPopup
 * @includes ItemTemplate Controls/menu:ItemTemplate
 * @public
 * @author Крайнов Д.О.
 */

import ItemTemplate = require('wml!Controls/_menu/Render/itemTemplate');
import GroupTemplate = require('wml!Controls/_menu/Render/groupTemplate');
import EmptyTemplate = require('wml!Controls/_menu/Render/empty');

export {default as Control} from 'Controls/_menu/Control';
export {default as Render} from 'Controls/_menu/Render';
export {default as Popup} from 'Controls/_menu/Popup';
export {default as HeaderTemplate} from 'Controls/_menu/Popup/headerTemplate';

export {default as IMenuControl, IMenuControlOptions} from 'Controls/_menu/interface/IMenuControl';
export {default as IMenuPopup, IMenuPopupOptions} from 'Controls/_menu/interface/IMenuPopup';

export {
    ItemTemplate,
    GroupTemplate,
    EmptyTemplate
};
