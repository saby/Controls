import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/EditInPlace/EndEdit/EndEdit"
import {Memory} from "Types/source"
import {Model} from "Types/entity"
import {getEditableCatalog as getData} from "../../DemoHelpers/DataCatalog"
import {SyntheticEvent} from "Vdom/Vdom";
import CONSTANTS = require('Controls/Constants');
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        })
    }

    protected _beforeEndEdit(e: SyntheticEvent<null>, item: Model) {
        if (item.get('id') === 1 && item.get('beforeEndEditTitle') === '') {
            return CONSTANTS.editing.CANCEL;
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
                        resolve(CONSTANTS.editing.CANCEL);
                    } else {
                        resolve();
                    }
                }, 1000);
            })
        }


    }
}