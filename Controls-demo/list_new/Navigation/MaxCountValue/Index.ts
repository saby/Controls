import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/MaxCountValue/MaxCountValue';
import {Memory} from 'Types/source';
import {changeSourceData} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { INavigation } from 'Controls-demo/types';

const { data, data2 } = changeSourceData();

class DemoSource extends Memory {
    queryNumber: number = 0;
    pending: Promise<any>;
    query(): Promise<any> {
        const args = arguments;
        return this.pending.then(() => {
            return super.query.apply(this, args).addCallback((items) => {
                const rawData = items.getRawData();
                rawData.items = data2.filter((cur) => cur.load === this.queryNumber);
                rawData.meta.more = this.queryNumber < 2;
                rawData.meta.total = rawData.items.length;
                items.setRawData(rawData);
                this.queryNumber++;
                return items;
            });
        });

    }
}

class InitialMemory extends Memory {
    query(): Promise<any> {
        return super.query.apply(this, arguments).addCallback((items) => {
            const rawData = items.getRawData();
            rawData.meta.more = false;
            items.setRawData(rawData);
            return items;
        });
    }
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _viewSource2: Memory;
    private _resolve: unknown = null;
    protected _navigation: INavigation;

    protected _beforeMount(): void {
        this._viewSource = new InitialMemory({
            keyProperty: 'id',
            data
        });
        this._navigation = {
            source: 'page',
            view: 'maxCount',
            sourceConfig: {
                pageSize: 10,
                page: 0
            },
            viewConfig: {
                maxCountValue: 8
            }
        };
        this._viewSource2 = new DemoSource({
            keyProperty: 'id',
            data: data2
        });
    }

    protected _onPen(): void {
        const self = this;
        this._resolve();
        this._viewSource2.pending = new Promise((res) => { self._resolve = res; });
    }

    protected _onChangeSource() {
        const self = this;
        this._viewSource2.pending = new Promise((res) => { self._resolve = res; });
        this._viewSource2.queryNumber = 0;
        this._viewSource = this._viewSource2;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
