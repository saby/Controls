import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Grouped/groupHistoryId/groupHistoryId';
import {Memory} from 'Types/source';
import {IColumn} from 'Controls/grid';
import { UserConfig } from 'EnvConfig/Config';
import {Tasks} from "Controls-demo/gridNew/DemoHelpers/Data/Tasks";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = [
        {
            displayProperty: 'id',
            width: '30px'
        },
        {
            displayProperty: 'state',
            width: '200px'
        },
        {
            displayProperty: 'date',
            width: '100px'
        }
    ];
    protected _groupHistoryId: string = '';
    protected readonly GROUP_HISTORY_ID_NAME: string = 'MY_NEWS';

    protected _beforeMount(): void {
        UserConfig.setParam('LIST_COLLAPSED_GROUP_' + this.GROUP_HISTORY_ID_NAME, JSON.stringify(['Крайнов Дмитрий']));
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Tasks.getData()
        });
    }

    clickHandler(event: object, idButton: string): void {
        if (idButton === '1') {
            this._groupHistoryId = this.GROUP_HISTORY_ID_NAME;
        } else {
            this._groupHistoryId = '';
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
