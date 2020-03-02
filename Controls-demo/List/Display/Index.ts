import { Control, TemplateFunction } from 'UI/Base';
import { SyntheticEvent } from 'Vdom/Vdom';
import * as template from 'wml!Controls-demo/List/Display/Display';

import { Memory as MemorySource } from 'Types/source';
import { Model } from 'Types/entity';
import { MaskResolver } from 'Router/router';

// @ts-ignore
import { View as ListViewOld } from 'Controls/list';
import DisplayList from 'Controls-demo/List/Display/DisplayList';

interface IDemoChildren {
    listViewOld?: ListViewOld;
    listView?: DisplayList<unknown>;
}

let lastKey;
function generateListElement() {
    const key = ++lastKey;
    return {
        key,
        title: `${key} list element`
    };
}

function generateListElements(count) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(generateListElement());
    }
    return result;
}

const STARTING_LIST_SIZE = 1000;

export default class DisplayListDemo extends Control {
    protected _template: TemplateFunction = template;
    protected _children: IDemoChildren;

    private _viewSource: MemorySource;

    protected _counterData: any[] = null;
    private _useNewList: boolean;
    private _addRowsCount: number = 1;
    private _removeRowId: number = 1;

    protected _templateKeyPrefix: string;

    protected _beforeMount(options): void {
        // for demo
        lastKey = 0;

        this._viewSource = new MemorySource({
            keyProperty: 'key',
            data: generateListElements(STARTING_LIST_SIZE)
        });

        this._templateKeyPrefix = `display-list-${this.getInstanceId()}`;

        this._counterData = [];

        // Если в url'e демки написано noDisplay=чтото, используем обычный Controls.list:View
        // вместо нового списка. Нужно для проведения сравнений
        const noDisplay = MaskResolver.calculateUrlParams('noDisplay=:noDisplay').noDisplay;
        this._useNewList = !noDisplay;
    }

    protected _onItemClick(e: SyntheticEvent<MouseEvent>, item: Model): void {
        const title = item.get('title');
        item.set('title', `${title} clicked`);
        this._viewSource.update(item);
    }

    protected _updateCounters(e: SyntheticEvent<null>, counters: any): void {
        this._counterData = counters;
    }

    protected _addRows(): void {
        const newRows = generateListElements(this._addRowsCount);
        const createPromises = newRows.map(this._viewSource.create.bind(this._viewSource));

        Promise.all(createPromises).then((records) => {
            if (this._useNewList) {
                // Добавление строк в новый список
                this._children.listView.appendItems(records);
            } else {
                // Добавление строк в старый список (страшно, но для демки)
                this._children.listViewOld
                    ._children.listControl
                    ._children.baseControl
                    .getViewModel().appendItems(records);
            }
        });
    }

    protected _removeRow(): void {
        if (this._useNewList) {
            // Удаление из нового списка
            this._children.listView.removeItem(this._removeRowId);
        } else {
            // Удаление из старого списка (страшно, но для демки)
            const items = this._children.listViewOld
                ._children.listControl
                ._children.baseControl
                .getViewModel().getItems();
            const row = items.getRecordById(this._removeRowId);
            if (row) {
                items.remove(row);
            }
        }
    }
}
