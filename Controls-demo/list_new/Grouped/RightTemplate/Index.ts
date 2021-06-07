import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';

import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/list_new/Grouped/RightTemplate/RightTemplate';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    protected _dataLoadCallback(items: RecordSet): void {
        items.setMetaData({
            groupResults: {
                Popular: 3.6,
                Unpopular: 3.2,
                Hit: 4.1
            }
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
