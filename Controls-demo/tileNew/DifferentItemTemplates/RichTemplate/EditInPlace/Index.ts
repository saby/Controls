import {Control, TemplateFunction} from 'UI/Base';
import { SyntheticEvent } from 'Vdom/Vdom';
import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/RichTemplate/EditInPlace/EditInPlace';
import {Gadgets} from 'Controls-demo/tileNew/DataHelpers/DataCatalog';
import {HierarchicalMemory} from 'Types/source';
import Images from 'Controls-demo/Tile/DataHelpers/Images';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _selectedKeys: string[] = [];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: Gadgets.getRichItemsForEditing()
        });
        this._itemActions = Gadgets.getActions();
    }
    protected _removeImage(e: SyntheticEvent, item) {
        item.set('image', undefined);
    }
    protected _changeImage(e: SyntheticEvent, item) {
        if (item.get('image') === Images.BRIDGE) {
            item.set('image', Images.MEDVED);
        } else {
            item.set('image', Images.BRIDGE);
        }
    }
}
