import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Multiselect/Base/Base';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

interface IColumn {
    displayProperty: string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _radioSource: Memory;
    protected _columns: IColumn[] = Countries.getColumns();
    protected _selectedKey: string = 'visible';

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Countries.getData()
        });
        this._radioSource = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: 'visible',
                    title: 'multiSelectVisibility = visible',
                },
                {
                    id: 'hidden',
                    title: 'multiSelectVisibility = hidden',
                },
                {
                    id: 'onhover',
                    title: 'multiSelectVisibility = onhover',
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
