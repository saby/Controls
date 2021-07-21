import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/LoadingIndicator/Middle/ColumnScroll/ColumnScroll';
import {Memory} from 'Types/source';
import { IColumn, IHeaderCell } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = [
        {
            caption: '#',
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 2
        },
        {
            caption: 'Географические данные',
            startRow: 1,
            endRow: 2,
            startColumn: 2,
            endColumn: 4,
            align: 'center'
        },
        {
            caption: 'Страна',
            startRow: 2,
            endRow: 3,
            startColumn: 2,
            endColumn: 3
        },
        {
            caption: 'Столица',
            startRow: 2,
            endRow: 3,
            startColumn: 3,
            endColumn: 4
        },
        {
            caption: 'Колонка с выключенным перемещением мышью',
            startRow: 1,
            endRow: 3,
            startColumn: 4,
            endColumn: 5
        },
        {
            caption: 'Цифры',
            startRow: 1,
            endRow: 2,
            startColumn: 5,
            endColumn: 8,
            align: 'center'
        },
        {
            caption: 'Население',
            startRow: 2,
            endRow: 3,
            startColumn: 5,
            endColumn: 6
        },
        {
            caption: 'Площадь км2',
            startRow: 2,
            endRow: 3,
            startColumn: 6,
            endColumn: 7
        },
        {
            caption: 'Плотность населения чел/км2',
            startRow: 2,
            endRow: 3,
            startColumn: 7,
            endColumn: 8
        }
    ];
    protected _columns: IColumn[] = [
        {
            displayProperty: 'number',
            width: '40px'
        },
        {
            displayProperty: 'country',
            width: '300px'
        },
        {
            displayProperty: 'capital',
            width: '700px',
            compatibleWidth: '98px'
        },
        {
            width: '200px'
        },
        {
            displayProperty: 'population',
            width: '700px',
            compatibleWidth: '100px'
        },
        {
            displayProperty: 'square',
            width: '700px',
            compatibleWidth: '83px'
        },
        {
            displayProperty: 'populationDensity',
            width: '700px',
            compatibleWidth: '175px'
        }
    ];
    protected _selectedKeys: number[] = [];
    protected _itemsDragNDrop: boolean = true;
    protected _dragScrolling: boolean = true;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData()
        });
    }

    protected _reloadList(): void {
        this._slowDownSource(this._viewSource, 4000);
        this._children.list.reload();
    }

    private _slowDownSource(source: Memory, timeMs: number): void {
        const originalQuery = source.query;

        source.query = (...args) => {
            return new Promise((success) => {
                setTimeout(() => {
                    success(originalQuery.apply(source, args));
                }, timeMs);
            });
        };
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
