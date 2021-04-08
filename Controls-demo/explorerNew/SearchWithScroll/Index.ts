import {Control, TemplateFunction} from 'UI/Base';
import * as MemorySource from 'Controls-demo/explorerNew/ExplorerMemory';
import * as Template from 'wml!Controls-demo/explorerNew/SearchWithScroll/SearchWithScroll';
import {TRoot} from 'Controls-demo/types';
import {DataWithLongFolderName} from '../DataHelpers/DataCatalog';

interface IViewColumns {
    displayProperty: string;
    width: string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: MemorySource;
    protected _viewColumns: IViewColumns[];
    protected _root: TRoot = null;

    protected _beforeMount(): void {
        this._viewColumns = [
            {
                displayProperty: 'title',
                width: '1fr'
            }
        ];
        this._viewSource = new MemorySource({
            keyProperty: 'id',
            data: DataWithLongFolderName.getManyData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
