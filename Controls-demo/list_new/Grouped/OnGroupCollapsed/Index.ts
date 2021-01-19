import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';

import {getGroupedCollapsedCatalog as getData} from '../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/list_new/Grouped/OnGroupCollapsed/OnGroupCollapsed';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _groupClickMessage: String;
    protected _isShowFooterBtn: boolean = true;

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
        this._groupClickMessage = '';
    }

    protected _onBtnClick(): void {
        this._isShowFooterBtn = false;
    }

    protected _clearMessage(): void {
        this._groupClickMessage = '';
    }

    protected _onGroupCollapsed(event: Event, changes: String): void {
        this._groupClickMessage = `Свернули группу с id="${changes}".`;
        this._isShowFooterBtn = false;
    }

    protected _onGroupExpanded(event: Event, changes: String): void {
        this._groupClickMessage = `Развернули группу с id="${changes}".`;
        this._isShowFooterBtn = true;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
