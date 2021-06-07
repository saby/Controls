import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import template = require('wml!Controls/_menu/Popup/searchHeaderTemplate');
import 'css!Controls/menu';

/**
 * Шапка меню со строкой поиска.
 * @class Controls/menu:SearchHeaderTemplate
 * @extends UICore/Base:Control
 * @private
 * @demo Controls-demo/dropdown_new/Search/SearchWidth/Index
 *
 * @author Герасимов А.М.
 */

/**
 * @name Controls/menu:SearchHeaderTemplate#icon
 * @cfg {String} Иконка, которая будет отображаться слева от строки поиска.
 */

/**
 * @name Controls/menu:SearchHeaderTemplate#searchWidth
 * @cfg {String} Ширина строки поиска. Варианты значений:
 * s - маленькая строка поиска;
 * l - большая строка поиска.
 * @default s
 */

class SearchHeaderTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _afterMount(): void {
        this._children.menuSearch.activate();
    }
}

export default SearchHeaderTemplate;
