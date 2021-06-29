import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/SeparatorAndActions/SeparatorAndActions';
import * as CellTemplate from 'wml!Controls-demo/explorerNew/SeparatorAndActions/CellTemplate';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/explorerNew/ExplorerMemory';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: MemorySource;
    protected _header = Gadgets.getSearchHeader();
    protected _columns =  Gadgets.getSearchColumns().map((c, i) => i === 2 ? {...c, template: CellTemplate} : c);
    private _searchValue: string = 'sata';

    protected _beforeMount(): void {
        this._columns[0].width = '400px';

        this._viewSource = new MemorySource({
            keyProperty: 'id',
            data: Gadgets.getSmallSearchData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
