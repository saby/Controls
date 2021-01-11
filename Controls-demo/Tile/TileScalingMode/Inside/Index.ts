import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Tile/TileScalingMode/Inside/template';
import {Gadgets} from 'Controls-demo/Tile/DataHelpers/DataCatalog';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _currentItems: any[] = null;

    protected _beforeMount(): void {
        this._currentItems = Gadgets.getPreviewItems();
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: this._currentItems
        });
        this._itemActions = Gadgets.getPreviewActions();
    }

    protected _imageUrlResolver(width: number, height: number, url: string): string {
        const [name, extension] = url.split('.');
        return `${name}${width}${height}.${extension}`;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Tile/TileScalingMode/style'];
}
