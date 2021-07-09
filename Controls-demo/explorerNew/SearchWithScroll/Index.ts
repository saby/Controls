import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/SearchWithScroll/SearchWithScroll';
import {TRoot} from 'Controls-demo/types';
import {DataWithLongFolderName} from '../DataHelpers/DataCatalog';
import {HierarchicalMemory} from 'Types/source';

interface IViewColumns {
    displayProperty: string;
    width: string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _viewColumns: IViewColumns[];
    protected _root: TRoot = null;

    protected _beforeMount(): void {
        this._viewColumns = [
            {
                displayProperty: 'title',
                width: '1fr'
            }
        ];
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: DataWithLongFolderName.getManyData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
