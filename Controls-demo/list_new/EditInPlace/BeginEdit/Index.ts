import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/EditInPlace/BeginEdit/BeginEdit"
import {Memory} from "Types/source"
import {Model} from "Types/entity"
import {getEditableCatalog as getData} from "../../DemoHelpers/DataCatalog"
import {SyntheticEvent} from "Vdom/Vdom";
import {editing as constEditing} from 'Controls/Constants';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        })
    }

    protected _beforeBeginEdit(e: SyntheticEvent<null>, {item}: {item: Model}, isAdd: boolean) {
        if (item.get('id') === 1) {
            return constEditing.CANCEL;
        }

        if (item.get('id') === 2) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({item});
                }, 1000);
            })
        }

        if (item.get('id') === 3) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({item});
                }, 3000);
            })
        }

        if (item.get('id') === 4) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(constEditing.CANCEL);
                }, 1000);
            });
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}