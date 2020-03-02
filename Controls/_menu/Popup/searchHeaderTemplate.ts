import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import template = require('wml!Controls/_menu/Popup/searchHeaderTemplate');

class SearchHeaderTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _afterMount() {
        this._children.menuSearch.activate();
    }

    static _theme: string[] = ['Controls/menu'];
}

export default SearchHeaderTemplate;
