import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Tile/ImageFit/Cover/Cover';
import {items} from 'Controls-demo/Tile/ImageFit/resources/DataCatalog';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: items
        });
    }

    protected _imageUrlResolver(width: number, height: number, url: string = ''): string {
        const [name, extension] = url.split('.');
        return `${name}${width}${height}.${extension}`;
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
