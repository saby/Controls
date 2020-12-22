import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/MaxCountValue/MaxCountValue';
import {Memory} from 'Types/source';
import {changeSourceData} from '../../DemoHelpers/DataCatalog';
import {INavigation} from 'Controls-demo/types';

const {data2} = changeSourceData();
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

class DemoSource extends Memory {
    queryNumber: number = 0;

    query(): Promise<any> {
        const args = arguments;
        return delay(1000).then(() => {
            return super.query.apply(this, args).addCallback((items) => {
                const rawData = items.getRawData();
                rawData.items = data2.filter((cur) => cur.id === this.queryNumber);
                rawData.meta.more = this.queryNumber < 10;
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
    protected _navigation: INavigation;

    protected _beforeMount(): void {
        this._viewSource = new InitialMemory({
            keyProperty: 'id',
            data: []
        });
        this._navigation = {
            source: 'page',
            view: 'maxCount',
            sourceConfig: {
                pageSize: 10,
                page: 0
            },
            viewConfig: {
                maxCountValue: 6
            }
        };
        this._viewSource2 = new DemoSource({
            keyProperty: 'id',
            data: data2
        });
    }

    protected _onChangeSource() {
        this._viewSource2.queryNumber = 0;
        this._viewSource = this._viewSource2;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
