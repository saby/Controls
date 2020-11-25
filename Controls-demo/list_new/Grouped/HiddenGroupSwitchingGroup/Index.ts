import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';
import { view } from 'Controls/Constants';
import {getGroupedCatalogForSwitchingGroup as getData} from '../../DemoHelpers/DataCatalog';

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
    
    protected _switchGroup(item) {
        item.set('group', item.get('group') === 'Архив' ? view.hiddenGroup : 'Архив');
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
