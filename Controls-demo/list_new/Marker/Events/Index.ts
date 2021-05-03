import {Control, TemplateFunction} from 'UI/Base';
import {Memory, CrudEntityKey} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';

import * as Template from 'wml!Controls-demo/list_new/Marker/Events/Events';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _markedKey: CrudEntityKey;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: 1,
                    title: 'Notebooks'
                },
                {
                    id: 2,
                    title: 'Tablets'
                },
                {
                    id: 3,
                    title: 'Маркер будет на следующей записи'
                },
                {
                    id: 4,
                    title: 'Apple gadgets'
                },
                {
                    id: 5,
                    title: 'Android gadgets'
                }
            ]
        });
    }

    onMarkerKeyChanged(event: SyntheticEvent, key: CrudEntityKey): void {
        this._markedKey = key;
    }

    onBeforeMarkerKeyChanged(event: SyntheticEvent, key: CrudEntityKey): CrudEntityKey | Promise<CrudEntityKey> {
        // Запретили установку маркера на запись с id=3
        return key === 3 ? 4 : key;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
