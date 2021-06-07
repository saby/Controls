import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/LoadingIndicator/Center/Center';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';

const TIMEOUT3500 = 3500;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    protected _reloadList(): void {
        this._slowDownSource(this._viewSource, TIMEOUT3500);
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
