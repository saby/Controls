import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Tile/DifferentItemTemplates/RichTemplate/ImageProportion/ImageProportion';
import {Gadgets} from 'Controls-demo/Tile/DataHelpers/DataCatalog';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _selectedKeys: string[] = [];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: Gadgets.getRichItems()
        });
        this._itemActions = Gadgets.getActions();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
