import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/StickyHeader/InitialShadowVisibility/InitialShadowVisibility';
import {Memory} from 'Types/source';
import { generateData } from 'Controls-demo/list_new/DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: [] = [
        {
            displayProperty: 'title',
            width: 'max-content'
        }
    ];
    protected _header: [] = [{title: 'Lorem'}];
    private _dataArray: unknown = generateData({count: 200, entityTemplate: {title: 'lorem'}});

    protected _beforeMount(): void {
        this._dataArray = this._dataArray.map((it, index) => {
            return {...it, group: Math.round(index / 10)};
        });
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
        this._slowDownSource(this._viewSource, 2000);
    }

    protected _onReload(): void {
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