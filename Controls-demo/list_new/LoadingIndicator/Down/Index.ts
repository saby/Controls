import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/LoadingIndicator/Down/Down';
import {Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _dataArray: Array<{id: number, title: string}> = generateData<{id: number, title: string}>({
        count: 100,
        beforeCreateItemCallback: (item: any) => {
            item.title = `Запись списка с id = ${item.id}.`
        }
    });

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
        this._slowDownSource(this._viewSource, 3000);
    }

    private _slowDownSource(source: Memory, timeMs: number): void {
        const originalQuery = source.query;

        source.query = function() {
            const args = arguments;
            return new Promise(function(success) {
                setTimeout(function() {
                    success(originalQuery.apply(source, args));
                }, timeMs);
            });
        };
    }


    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
