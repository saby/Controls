import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/SourceChanger/FromEmpty/FromEmpty';
import {Memory} from 'Types/source';
import {getCountriesStats, changeSourceData} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { INavigation } from 'Controls-demo/types';

const { data2: data } = changeSourceData();

class demoSource extends Memory {
    queryNumber: number = 0;
    pending: Promise<any>;
    public query() {
        const args = arguments;
        return this.pending.then(() => {
            return super.query.apply(this, args).addCallback((items) => {
                const rawData = items.getRawData();
                rawData.items = data.filter((cur) => cur.load === this.queryNumber);
                rawData.meta.more = this.queryNumber < 2;
                rawData.meta.total = rawData.items.length;
                items.setRawData(rawData);
                this.queryNumber++;
                return items;
            });
        });
    }
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _viewSource2: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsForLoad();
    private _resolve: any = null;
    protected _navigation: INavigation;

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: []
        });
        this._navigation = {
            source: 'page',
            view: 'maxCount',
            sourceConfig: {
                pageSize: 10,
                page: 0,
            },
            viewConfig: {
                maxCountValue: 3
            }
        };
        this._viewSource2 = new demoSource({
            keyProperty: 'id',
            data: data,
        });
    }
    protected _onPen(): void {
        const self = this;
        this._resolve();
        // @ts-ignore
        this._viewSource2.pending = new Promise((res) => { self._resolve = res; });
    }
    protected _onChangeSource() {
        const self = this;
        // @ts-ignore
        this._viewSource2.pending = new Promise((res) => { self._resolve = res; });
        // @ts-ignore
        this._viewSource2.queryNumber = 0;
        this._viewSource = this._viewSource2;
    }


    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
