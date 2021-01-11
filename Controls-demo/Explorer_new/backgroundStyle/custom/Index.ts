import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/backgroundStyle/custom/backgroundStyleCustom';
import {Gadgets} from '../../DataHelpers/DataCatalog';
import {Memory} from 'Types/source';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import {IColumn} from 'Controls/grid';
import {TRoot, IHeader} from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: MemorySource;
    protected _viewSearchSource: MemorySource;
    protected _headerSource: MemorySource;
    protected _columns: IColumn[] = Gadgets.getSearchColumns();
    protected _headerRoot: TRoot = null;
    protected _searchRoot: TRoot = null;
    protected _root: TRoot = 1;
    protected _searchStartingWith: string = 'root';
    protected _searchStartingWithSource: Memory = null;
    protected _emptyFilter: object = {demo: 123};
    protected _filter: object = {
        demo: 123,
        title: 'Жесткий диск Seagate Original SATA-III 1Tb ST1000NC001 Constellation СS (7200rpm) 64Mb 3.5'
    };
    protected _header: IHeader[] = [
        {
            title: ''
        },
        {
            title: 'Код'
        },
        {
            title: 'Цена'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new MemorySource({
            keyProperty: 'id',
            data: Gadgets.getSearchData()
        });
        this._viewSearchSource = new MemorySource({
            keyProperty: 'id',
            data: Gadgets.getSearchDataLongFolderName()
        });
        this._headerSource = new MemorySource({
            keyProperty: 'id',
            data: [{id: 1, parent: null, 'parent@': true, code: null, price: null, title: 'Комплектующие'}]
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

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/Explorer_new/backgroundStyle/custom/backgroundStyleCustom'
    ];
}
