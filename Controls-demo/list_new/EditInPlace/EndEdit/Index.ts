import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/EndEdit/EndEdit';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {getEditableCatalog as getData} from '../../DemoHelpers/DataCatalog';
import {SyntheticEvent} from 'Vdom/Vdom';
import {editing as constEditing} from 'Controls/Constants';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        })
    }

    protected _beforeEndEdit(e: SyntheticEvent<null>, item: Model): Promise<any> | string {
        if (item.get('id') === 1 && item.get('beforeEndEditTitle') === '') {
            return constEditing.CANCEL;
        }

        if (item.get('id') === 2) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000);
            })
        }

        if (item.get('id') === 3) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, 3000);
            })
        }

        if (item.get('id') === 4) {
            return new Promise(resolve => {
                setTimeout(() => {
                    if (item.get('beforeEndEditTitle') === '') {
                        resolve(constEditing.CANCEL);
                    } else {
                        resolve();
                    }
                }, 1000);
            })
        }


    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
