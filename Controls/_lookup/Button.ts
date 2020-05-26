import Control = require('Core/Control');
import template = require('wml!Controls/_lookup/Button/SelectorButton');


/**
 * Кнопка-ссылка с возможностью выбора значений из справочника.
 * 
 * @remark
 * Выбранные значения отображаются в виде текста с кнопкой удаления.
 * Поддерживает одиночный и множественный выбор.
 * 
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Engine-demo%2FSelectorButto">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/directory/lookup/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_lookup.less">переменные тем оформления</a>
 * 
 *
 * @class Controls/_lookup/Button
 * @extends Core/Control
 * @mixes Controls/_interface/ILookup
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/_interface/ISelectorDialog
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IFontColorStyle
 * @mixes Controls/interface/IFontSize
 * @mixes Controls/_interface/ITextValue
 * @control
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/Buttons/SelectorButtonPG
 */
/*
 * Button link with the specified text, on clicking on which a selection window opens.
 * Here you can see <a href="/materials/Controls-demo/app/Engine-demo%2FSelectorButton">demo-example</a>.
 *
 * @class Controls/_lookup/Button
 * @extends Core/Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/_interface/ITextValue
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/ISource
 * @control
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/Buttons/SelectorButtonPG
 */

var Button = Control.extend({
   _template: template,

   showSelector: function (popupOptions) {
      return this._children.controller.showSelector(popupOptions);
   }
});

export = Button;
