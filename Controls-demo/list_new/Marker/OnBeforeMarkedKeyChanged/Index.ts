import {Control, TemplateFunction} from 'UI/Base';
import {Memory, CrudEntityKey} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';

import * as Template from 'wml!Controls-demo/list_new/Marker/OnBeforeMarkedKeyChanged/OnBeforeMarkedKeyChanged';

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
                    title: 'На записи разрешена установка маркера'
                },
                {
                    id: 2,
                    title: 'На записи запрещена установка маркера'
                },
                {
                    id: 3,
                    title: 'На записи разрешена установка маркера'
                },
                {
                    id: 4,
                    title: 'На записи запрещена установка маркера'
                },
                {
                    id: 5,
                    title: 'На записи разрешена установка маркера'
                }
            ]
        });
    }

    onBeforeMarkedKeyChanged(event: SyntheticEvent, key: CrudEntityKey): CrudEntityKey | Promise<CrudEntityKey> {
        return key === 2 || key === 4 ? null : key;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
