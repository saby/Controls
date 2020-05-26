import Control = require('Core/Control');
import template = require('wml!Controls/_lookup/MultipleInput/MultipleInput');
import itemTemplate = require('wml!Controls/_lookup/Lookup/itemTemplate');

/**
 * Поле ввода с автодополнением и возможностью выбора значений из справочника.
 * 
 * @remark
 * Отличается от {@link Controls/_lookup/Lookup поля связи} выводом выбранных значений.
 * Ширина выбранных занчений будет пропорционально распределена по ширине контрола, чтобы все значения поместились.
 * 
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FLookup%2FIndex">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/directory/lookup/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_lookup.less">переменные тем оформления</a>
 *
 * @class Controls/_lookup/MultipleInput
 * @extends Core/Control
 * @mixes Controls/_interface/ILookup
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/interface/ISuggest
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/ITextValue
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_input/interface/IText
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/interface/IInputTag
 * @mixes Controls/interface/IInputField
 * @mixes Controls/interface/IInputStyle
 * @control
 * @public
 * @author Герасимов А.М.
 */
/*
 * “Lookup:MultipleInput” is an input field with auto-completion and the ability to select a value from the directory. It differs from the usual lookup: input in that only one value can be selected from each directory.
 * Here you can see <a href="/materials/Controls-demo/app/Controls-demo%2FLookup%2FIndex">demo-example</a>.
 * If you use the link to open the directory inside the tooltip of the input field, you will need {@link Controls/lookup:Link}.
 * If you want to make a dynamic placeholder of the input field, which will vary depending on the selected collection, use {@link Controls/lookup:PlaceholderChooser}.
 *
 * @class Controls/_lookup/MultipleInput
 * @extends Core/Control
 * @mixes Controls/_interface/ILookup
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/interface/ISuggest
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/ITextValue
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_input/interface/IText
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/interface/IInputTag
 * @mixes Controls/interface/IInputField
 * @mixes Controls/interface/IInputStyle
 * @control
 * @public
 * @author Герасимов А.М.
 */

var MultipleInput = Control.extend({
    _template: template,

    showSelector: function (popupOptions) {
        return this._children.controller.showSelector(popupOptions);
    }
});

MultipleInput.getDefaultOptions = function() {
    return {
        itemTemplate: itemTemplate
    };
};

export = MultipleInput

