import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Header/StickyWithPaging/StickyWithPaging';
import {Memory} from 'Types/source';
import {countries} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { IHeader } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeader[] = [{title: 'id'}, {title: 'Country'}];
    protected _columns: IColumn[] = [{displayProperty: 'id', width: '100px'}, {displayProperty: 'name', width: '300px'}];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: countries.map((country, index) => {
                return {id: index, name: country};
            })
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
