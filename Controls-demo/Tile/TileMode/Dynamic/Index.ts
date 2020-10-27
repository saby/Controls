import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Tile/TileMode/Dynamic/Dynamic';
import {Gadgets} from 'Controls-demo/Tile/DataHelpers/DataCatalog';
import {Getter} from 'File/ResourceGetter/fileSystem';
import {object} from 'Types/util';
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

    _addItemFromFile(file): void {
        const reader = new FileReader();
        const newItems = object.clone(this._currentItems);
        const newItem = object.clone(newItems[newItems.length - 1]);
        newItem.id = newItems.length + 1;
        reader.onload = (event): void => {
            newItem.image = event.target.result;
            const image = new Image();
            image.onload = (event) => {
                newItem.imageHeight = event.currentTarget.height;
                newItem.imageWidth = event.currentTarget.width;
                newItems.push(newItem);
                this._currentItems = newItems;
                this._viewSource = new HierarchicalMemory({
                    keyProperty: 'id',
                    parentProperty: 'parent',
                    data: this._currentItems = newItems
                });
            };
            image.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    protected _getImage(): void {
        const fileSystem = new Getter({
            extensions: ['jpg', 'png', 'gif', 'bmp', 'jpeg', 'ico', 'svg']
        });
        fileSystem.getFiles().then((files) => {
            this._addItemFromFile(files[0].getData());
        });

    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
