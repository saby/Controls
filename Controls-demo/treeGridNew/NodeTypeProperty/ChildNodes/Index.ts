import {Control, TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {TColspanCallbackResult} from 'Controls/grid';
import {IGroupNodeColumn} from 'Controls/treeGrid';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';

import {extendedData as data} from '../data/NodeTypePropertyData';

import * as Template from 'wml!Controls-demo/treeGridNew/NodeTypeProperty/ChildNodes/ChildNodes';
import * as PriceColumnTemplate from 'wml!Controls-demo/treeGridNew/NodeTypeProperty/resources/PriceColumnTemplate';

const columns: IGroupNodeColumn[] = [
    {
        width: '300px',
        displayProperty: 'title',
        groupNodeConfig: {
            textAlign: 'center'
        }
    },
    {
        width: '100px',
        displayProperty: 'count',
        align: 'right'
    },
    {
        width: '100px',
        displayProperty: 'price',
        align: 'right',
        template: PriceColumnTemplate
    },
    {
        width: '100px',
        displayProperty: 'price1',
        align: 'right',
        template: PriceColumnTemplate
    },
    {
        width: '100px',
        displayProperty: 'price2',
        align: 'right',
        template: PriceColumnTemplate
    },
    {
        width: '50px',
        displayProperty: 'tax',
        align: 'right'
    },
    {
        width: '100px',
        displayProperty: 'price3',
        align: 'right',
        template: PriceColumnTemplate,
        fontSize: 's'
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IGroupNodeColumn[] = columns;
    protected _expandedItems: CrudEntityKey[] = [];
    protected _collapsedItems: CrudEntityKey[] = [];

    protected _navigation: INavigationOptionValue<INavigationSourceConfig> = {
        source: 'page',
        view: 'demand',
        sourceConfig: {
            pageSize: 3,
            page: 0,
            hasMore: false
        },
        viewConfig: {
            pagingMode: 'basic'
        }
    };

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            parentProperty: 'parent',
            keyProperty: 'id',
            data
        });
    }

    protected _colspanCallback(item: Model, column: IGroupNodeColumn, columnIndex: number, isEditing: boolean): TColspanCallbackResult {
        if (typeof item === 'string') {
            return 'end';
        }
        if (item.get('nodeType') === 'group' && columnIndex === 0) {
            return 3;
        }
        return 1;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
