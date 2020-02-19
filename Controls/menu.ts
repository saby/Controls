/**
 * Библиотека контролов, которые реализуют элемент интерфейса, позволяющий выбрать одну или несколько перечисленных опций.
 * Может отображаться на странице или в выпадающем блоке.
 * @library Controls/menu
 * @public
 * @author Крайнов Д.О.
 */

import ItemTemplate = require('wml!Controls/_menu/Render/itemTemplate');

export {default as Control} from 'Controls/_menu/Control';
export {default as Render} from 'Controls/_menu/Render';
export {default as Popup} from 'Controls/_menu/Popup';
export {ItemTemplate};
