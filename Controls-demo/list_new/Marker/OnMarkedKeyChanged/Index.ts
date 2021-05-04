import {Control, TemplateFunction} from 'UI/Base';
import {Memory, CrudEntityKey} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/list_new/Marker/OnMarkedKeyChanged/OnMarkedKeyChanged';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _markedKey: CrudEntityKey;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    onMarkedKeyChanged(event: SyntheticEvent, key: CrudEntityKey): void {
        this._markedKey = key;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
