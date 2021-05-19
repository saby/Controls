import { Control, TemplateFunction } from 'UI/Base';
import { SyntheticEvent } from  'Vdom/Vdom';
import { Memory } from 'Types/source';
import { IColumn } from 'Controls/grid';

import { getTasks } from '../../DemoHelpers/DataCatalog';
import * as Template from 'wml!Controls-demo/grid/Grouped/RightTemplate/RightTemplate';

interface IItem {
    get: (item: string) => string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getTasks().getDefaultColumns().concat([
        {
            displayProperty: 'message',
            width: '200px',
            textOverflow: 'ellipsis'
        }
    ]);
    protected _separatorVisibility: boolean = true;
    protected _textAlign: string;
    protected _columnAlignGroup: number = 2;
    protected _radioSource: Memory;

    protected _beforeMount(): void {
        this._textAlign = null;
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getTasks().getData()
        });
        // displayProperty: 'caption',
        this._radioSource = new Memory({
            keyProperty: 'id',
            data: [{
                id: null,
                title: 'null'
            }, {
                id: 'left',
                title: 'left'
            }, {
                id: 'right',
                title: 'right'
            }]
        });
    }

    protected _onToggleSeparatorVisibility(): void {
        this._separatorVisibility = !this._separatorVisibility;
    }

    protected _onToggleColumnAlignGroup(): void {
        this._columnAlignGroup = !this._columnAlignGroup ? 2 : undefined;
    }

    protected _onChangeTextAlign(e: SyntheticEvent, val: string): void {
        this._textAlign = val;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
