import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ValidateOptions/Columns/Columns';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumnsWithWidths();
    private _console: [{type: string, msg: string}] = [];

    protected _beforeMount(): void {
        this._columns[0].width = '0fr';
        this._columns[1].width = '-1px';
        this._columns[2].width = 'minmax(minmax(auto, 1fr), 1fr)';
        this._columns[3].width = '10pn';
        this._mockConsole();
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData().slice(0, 1)
        });
    }

    private _mockConsole(): void {
        if (typeof window !== 'undefined') {
            const mock = (type: 'log' | 'warn' | 'error') => {
                const native = console[type];
                console[type] = (...args: unknown[]) => {
                    if (type === 'error') {
                        this._console.push({
                            type: type,
                            errorName: args[0].trim(),
                            errorMsg: args[1].trim(),
                            stack: args[2].trim()
                        });
                    } else {
                        native.apply(window, args);
                    }
                };
            };

            mock('log');
            mock('warn');
            mock('error');
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
