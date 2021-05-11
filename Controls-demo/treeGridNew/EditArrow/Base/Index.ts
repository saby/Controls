import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import { SyntheticEvent } from 'UICommon/Events';
import { Model } from 'Types/entity';

import { IColumn } from 'Controls/grid';

import * as Template from 'wml!Controls-demo/treeGridNew/EditArrow/Base/Base';
import * as TreeMemory from 'Controls-demo/List/Tree/TreeMemory';
import * as memorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import { IHeader } from 'Controls-demo/types';

import { TreeData, TreeColumns, TreeHeader } from 'Controls-demo/treeGridNew/EditArrow/resources/resources';

export default class Base extends Control<IControlOptions> {
    _template: TemplateFunction = Template;
    _source: typeof TreeMemory;
    _columns: IColumn[];
    _header: IHeader;

    __beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._source = new TreeMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            filter: memorySourceFilter(),
            data: TreeData
        });
        this._columns = TreeColumns;
        this._header = TreeHeader;
    }

    _editArrowClick(e: SyntheticEvent, item: Model): void {
        console.log(item);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/treeGridNew/EditArrow/resources/EditArrow'];

}
