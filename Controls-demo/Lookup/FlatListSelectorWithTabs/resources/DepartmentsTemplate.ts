import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import {_departmentsDataLong} from 'Controls-demo/Lookup/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Lookup/FlatListSelectorWithTabs/resources/DepartmentsTemplate');
import 'css!Controls-demo/Controls-demo';

export default class extends Control{
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _keyProperty: string = 'id';
    protected _beforeMount(options) {
        var keyProperty = this._keyProperty;
        this._filter = Object.assign({}, options.filter);
        this._source = new Memory({
            data: _departmentsDataLong,
            filter: function(item, queryFilter) {
                var selectionFilterFn = function(item, filter) {
                    var isSelected = false;
                    var itemId = item.get('Departments');

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
