import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/BeginEdit/BeginEdit';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {getEditableCatalog as getData} from '../../DemoHelpers/DataCatalog';
import {SyntheticEvent} from 'Vdom/Vdom';
import {editing as constEditing} from 'Controls/list';

const TIMEOUT1000 = 1000;
const TIMEOUT3000 = 3000;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }
    // tslint:disable-next-line
    protected _beforeBeginEdit(e: SyntheticEvent<null>, {item}: {item: Model}, isAdd: boolean): Promise<any> | string {
        if (item.get('id') === 1) {
            return constEditing.CANCEL;
        }
        // tslint:disable-next-line
        if (item.get('id') === 2) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({item});
                }, TIMEOUT1000);
            });
        }
        // tslint:disable-next-line
        if (item.get('id') === 3) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({item});
                }, TIMEOUT3000);
            });
        }
        // tslint:disable-next-line
        if (item.get('id') === 4) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(constEditing.CANCEL);
                }, TIMEOUT1000);
            });
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
