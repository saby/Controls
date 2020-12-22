/**
 * Библиотека, которая реализует <a href='/doc/platform/developmentapl/interface-development/controls/buttons-switches/toolbar/'>набор команд</a> в виде кнопок и выпадающего меню с дополнительными командами.
 * @library Controls/toolbars
 * @includes ItemTemplate Controls/toolbars:ItemTemplate
 * @public
 * @author Красильников А.С.
 */

import ItemTemplate = require('wml!Controls/_toolbars/ItemTemplate');
export {ItemTemplate};

export {items as actualItems} from 'Controls/_toolbars/ActualAPI';
export {default as View, IToolbarOptions, TItemsSpacing} from './_toolbars/View';
export {getButtonTemplateOptionsByItem, getButtonTemplate} from './_toolbars/Util';
export {default as BoxView} from './_toolbars/BoxView';
export {default as IToolbarSource} from './_toolbars/IToolbarSource';