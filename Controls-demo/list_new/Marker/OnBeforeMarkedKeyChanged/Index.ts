import {Control, TemplateFunction} from 'UI/Base';
import {Memory, CrudEntityKey} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';

import * as Template from 'wml!Controls-demo/list_new/Marker/OnBeforeMarkedKeyChanged/OnBeforeMarkedKeyChanged';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: 1,
                    title: 'Асинхронная обработка перед установкой маркера'
                },
                {
                    id: 2,
                    title: 'Асинхронная обработка перед установкой маркера'
                },
                {
                    id: 3,
                    title: 'Асинхронная обработка перед установкой маркера'
                }
            ]
        });
    }

    _onBeforeMarkedKeyChanged(event: SyntheticEvent, key: CrudEntityKey): CrudEntityKey | Promise<CrudEntityKey> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(key);
            }, 1000);
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
