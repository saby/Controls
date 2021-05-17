import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls/_search/Input/WrappedSearch';
import Search from 'Controls/_search/Input/Search';

export default class WrappedSearch extends Control {
    _template: TemplateFunction = template;
    protected _children: {
        search: Search;
    };

    paste(
        ...args: Parameters<Search['paste']>
    ): ReturnType<Search['paste']> {
        return this._children.search.paste(...args);
    }

    _getTooltip(
        ...args: Parameters<Search['_getTooltip']>
    ): ReturnType<Search['_getTooltip']> {
        return this._children.search._getTooltip(...args);
    }
}
