import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/breadcrumbsDisplayMode/breadcrumbsDisplayMode';
import {DataWithLongFolderName} from '../DataHelpers/DataCatalog';
import { TRoot } from 'Controls-demo/types';
import { IColumn } from 'Controls/grid';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = DataWithLongFolderName.getColumns();
    protected _root: TRoot = 92;

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: DataWithLongFolderName.getManyData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
