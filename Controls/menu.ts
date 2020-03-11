/**
 * Библиотека контролов, которые реализуют элемент интерфейса, позволяющий выбрать одну или несколько перечисленных опций.
 * Может отображаться на странице или в выпадающем блоке.
 * @library Controls/menu
 * @includes Control Controls/menu:Control
 * @includes Popup Controls/menu:Popup
 * @includes IMenuControl Controls/_menu/interface/IMenuControl
 * @includes ItemTemplate Controls/menu:ItemTemplate
 * @public
 * @author Крайнов Д.О.
 */

import ItemTemplate = require('wml!Controls/_menu/Render/itemTemplate');
import GroupTemplate = require('wml!Controls/_menu/Render/groupTemplate');

export {default as Control} from 'Controls/_menu/Control';
export {default as Render} from 'Controls/_menu/Render';
export {default as Popup} from 'Controls/_menu/Popup';
export {
    ItemTemplate,
    GroupTemplate
};
