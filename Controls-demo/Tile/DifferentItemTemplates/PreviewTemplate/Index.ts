import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Tile/DifferentItemTemplates/PreviewTemplate/PreviewTemplate';
import {Gadgets} from '../../DataHelpers/DataCatalog';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _selectedKeys: string[] = [];
    protected _itemActions: any[] = Gadgets.getPreviewActions();

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: Gadgets.getPreviewItems()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
