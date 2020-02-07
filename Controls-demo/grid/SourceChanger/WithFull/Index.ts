import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/SourceChanger/WithFull/WithFull"
import {Memory} from "Types/source"
import {getCountriesStats, changeSourceData} from "../../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

const { data, data2 } = changeSourceData();

class demoSource extends Memory {
    queryNumber: number = 0;
    pending: Promise<any>;
    protected query(query) {
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

class initialMemory extends Memory {
    protected query(query) {
        return super.query.apply(this, arguments).addCallback((items) => {
            const rawData = items.getRawData();
            rawData.meta.more = false;
            items.setRawData(rawData); //dsadsa
            return items;
        });
    }
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _viewSource2: Memory;
    protected _columns = getCountriesStats().getColumnsForLoad();
    private _resolve = null;

    protected _beforeMount() {
        this._viewSource = new initialMemory({
            keyProperty: 'id',
            data: data
        });
        this._navigation = {
            source: 'page',
            view: 'maxCount',
            sourceConfig: {
                pageSize: 10,
                page: 0,
            },
            viewConfig: {
                maxCountValue: 8
            }
        };
        this._viewSource2 = new demoSource({
            keyProperty: 'id',
            data: data2,
        });
    }

    protected _onPen() {
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

}
