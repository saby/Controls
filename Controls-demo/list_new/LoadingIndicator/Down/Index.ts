import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/LoadingIndicator/Down/Down';
import {Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';

const TIMEOUT3500 = 3500;
interface IItem {
    title: string;
    id: string | number;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _dataArray: Array<{id: number, title: string}> = generateData<{id: number, title: string}>({
        count: 100,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись списка с id = ${item.id}.`;
        }
    });

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
        this._slowDownSource(this._viewSource, TIMEOUT3500);
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
