import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Grouped/groupHistoryId/groupHistoryId';
import {Memory} from 'Types/source';
import {getTasks} from '../../DemoHelpers/DataCatalog';
import {IColumn} from 'Controls/grid';
import * as Config from 'Env/Config';

interface IItem {
    get: (item: string) => string;
}

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
        Config.UserConfig.setParam('LIST_COLLAPSED_GROUP_' + this.GROUP_HISTORY_ID_NAME, JSON.stringify(['Крайнов Дмитрий']));
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getTasks().getData()
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
