/**
 * Библиотека, которая реализует <a href='/doc/platform/developmentapl/interface-development/controls/toolbar/'>набор команд</a> в виде кнопок и выпадающего меню с дополнительными командами.
 * @library Controls/toolbars
 * @includes View Controls/_toolbars/View
 * @includes ItemTemplate Controls/toolbars:ItemTemplate
 * @includes IToolbarSource Controls/_toolbars/IToolbarSource
 * @includes IToolbarOptions Controls/_toolbars/IToolbarOptions
 * @public
 * @author Красильников А.С.
 */

/**
 * Шаблон, который по умолчанию используется для отображения элементов в контроле {@link Controls/toolbars:View}.
 * @class Controls/toolbars:ItemTemplate
 * @author Красильников А.С.
 */
/**
 * @name Controls/toolbars:ItemTemplate#item
 * @cfg {Controls/_toolbars/IToolbarSource/Item.typedef} элемент тулбара.
 */
/**
 * @name Controls/toolbars:ItemTemplate#buttonTemplate
 * @cfg {UI/Base:TemplateFunction} шаблон кнопки тулбара.
 * @default Controls/buttons#ButtonTemplate
 */
/**
 * @name Controls/toolbars:ItemTemplate#buttonTemplateOptions
 * @cfg {Object} Опции шаблона кнопки.
 * @see Controls/toolbars:ItemTemplate#buttonTemplate
 */
/**
 * @name Controls/toolbars:ItemTemplate#itemsSpacing
 * @cfg {String} Значение опции тулбара {@link Controls/toolbar:View#itemsSpacing}.
 */
/**
 * @name Controls/toolbars:ItemTemplate#theme
 * @cfg {String} Значение опции тулбара {@link Controls/toolbar:View#theme}.
 */

import ItemTemplate = require('wml!Controls/_toolbars/ItemTemplate');
export {ItemTemplate};

export {items as actualItems} from 'Controls/_toolbars/ActualAPI';
export {default as View, IToolbarOptions, TItemsSpacing, getButtonTemplateOptionsByItem, getButtonTemplate} from './_toolbars/View';
export {default as BoxView} from './_toolbars/BoxView';
