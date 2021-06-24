import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';
import {groupConstants} from 'Controls/list';
import {getGroupedCatalogForSwitchingGroup as getData} from '../../data/HiddenGroup';
import * as Template from 'wml!Controls-demo/list_new/Grouped/HiddenGroupSwitchingGroup/HiddenGroupSwitchingGroup';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions = [
        {
            id: 'archive',
            icon: 'icon-Archive',
            showType: 2,
            handler: this._switchGroup
        }];

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    protected _switchGroup(item): void {
        item.set('group', item.get('group') === 'Архив' ? groupConstants.hiddenGroup : 'Архив');
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
