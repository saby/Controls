import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/SearchWithColumnScroll/SearchWithColumnScroll';
import * as cellTemplate from 'wml!Controls-demo/explorerNew/SearchWithColumnScroll/cellTemplate';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {HierarchicalMemory, Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource1: HierarchicalMemory;
    protected _viewSource2: HierarchicalMemory;
    protected _columns1: unknown[];
    protected _columns2: unknown[];
    protected _root: null | number = null;
    protected _searchStartingWith: string = 'root';
    protected _searchStartingWithSource: Memory = null;
    protected _filter: Record<string, unknown> = { demo: 123 };
    private _isBigData: boolean = false;
    private _canSetConfig: boolean = false;
    protected _isStickyColumnsCount: boolean = false;

    protected _beforeMount(): void {
        this._columns1 = Gadgets.getSearchColumnsWithColumnScroll().map((c) => ({
            ...c,
            template: cellTemplate
        }));
        this._columns2 = Gadgets.getSearchColumns().map((c) => ({
            ...c,
            template: cellTemplate
        }));
        this._header = [
            {
                title: 'Наименование'
            },
            {
                title: 'Код'
            },
            {
                title: 'Цена'
            }
        ];
        this._columns2[0].width = '400px';

        this._viewSource1 = new HierarchicalMemory({
            keyProperty: 'id',
            data: Gadgets.getSearchDataForColumnScroll()
        });
        this._viewSource2 = new HierarchicalMemory({
            keyProperty: 'id',
            data: Gadgets.getSearchData()
        });
        this._searchStartingWithSource = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: 'root', title: 'root'
                },
                {
                    id: 'current', title: 'current'
                }
            ]
        });
    }

    protected _reload(): void {
        this._children.explorer.reload();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
