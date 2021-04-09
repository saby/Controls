import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/SearchWithColumnScroll/SearchWithColumnScroll';
import * as cellTemplate from 'wml!Controls-demo/explorerNew/SearchWithColumnScroll/cellTemplate';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {Memory} from 'Types/source';
import * as MemorySource from 'Controls-demo/explorerNew/ExplorerMemory';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource1: MemorySource;
    protected _viewSource2: MemorySource;
    protected _columns1: unknown[];
    protected _columns2: unknown[];
    protected _root: null | number = null;
    protected _searchStartingWith: string = 'root';
    protected _searchStartingWithSource: Memory = null;
    protected _filter: Record<string, unknown> = { demo: 123 };
    private _isBigData: boolean = false;
    private _canSetConfig: boolean = false;
    private _colspanBreadcrumbs: boolean = false;
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

        this._viewSource1 = new MemorySource({
            keyProperty: 'id',
            data: Gadgets.getSearchDataForColumnScroll()
        });
        this._viewSource2 = new MemorySource({
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
