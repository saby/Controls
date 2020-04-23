import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import {_companies} from 'Controls-demo/Lookup/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Lookup/FlatListSelectorWithTabs/resources/CompaniesTemplate');

export default class extends Control{
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _source: Memory;
    protected _keyProperty: string = 'id';
    protected _beforeMount(options) {
        var keyProperty = this._keyProperty;
        this._filter = Object.assign({}, options.filter);
        this._source = new Memory({
            data: _companies,
            filter: function(item, queryFilter) {
                var selectionFilterFn = function(item, filter) {
                    var isSelected = false;
                    var itemId = item.get('Companies');

                    filter.selection.get('marked').forEach(function(selectedId) {
                        if (selectedId === itemId || (selectedId === null && filter.selection.get('excluded').indexOf(itemId) === -1)) {
                            isSelected = true;
                        }
                    });

                    return isSelected;
                };
                var normalFilterFn = MemorySourceFilter();

                return queryFilter.selection ? selectionFilterFn(item, queryFilter) : normalFilterFn(item, queryFilter);
            },
            keyProperty: keyProperty
        });
    }

    protected _beforeUpdate(options) {
        if (options.selectComplete) {
            this._children.SelectorController._selectComplete();
        }
    }
}
