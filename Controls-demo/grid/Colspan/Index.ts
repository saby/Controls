import { Control, TemplateFunction } from 'UI/Base';
import { Memory } from 'Types/source';
import { TColumns } from 'Controls/grid';
import RawData from 'Controls-demo/grid/data/Colspan';
import * as Template from 'wml!Controls-demo/grid/Colspan/Colspan';
import * as FirstColumnTemplate from 'wml!Controls-demo/grid/Colspan/FirstColumn';
import { TColspanCallbackResult } from 'Controls/display';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: TColumns = [
        {
            template: FirstColumnTemplate,
            width: '200px'
        },
        {
            displayProperty: 'total',
            width: '50px'
        },
        {
            displayProperty: 'new',
            width: '50px'
        },
        {
            displayProperty: 'communicated',
            width: '50px'
        },
        {
            displayProperty: 'likes',
            width: '50px'
        },
        {
            displayProperty: 'dislikes',
            width: '50px'
        },
        {
            displayProperty: 'sales',
            width: '50px'
        }
    ];

    protected _colspanCallback(item, column, columnIndex, isEditing): TColspanCallbackResult {
        if (item.get('type') === true) {
            return;
        }
        return 'end';
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: RawData
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
