import { Control, TemplateFunction } from 'UI/Base';

import template = require('wml!Controls-demo/List/RenderListView/RenderListView');
import { RecordSet } from 'Types/collection';
import { EditInPlaceController, Collection, DragCommands } from 'Controls/display';
import { Model } from 'Types/entity';

interface IRenderListViewChildren {
    editInPlaceItemKeyInput: HTMLInputElement;
    addInPlacePositionSelect: HTMLSelectElement;
    dragItemKeysInput: HTMLInputElement;
    dragAvatarKeyInput: HTMLInputElement;
    dragAvatarPositionInput: HTMLInputElement;
}

export default class RenderListViewDemo extends Control {
    protected _template: TemplateFunction = template;
    protected _children: IRenderListViewChildren;

    protected _items: RecordSet;

    private _nextKey: number = 1;

    protected _itemActions: any[] = [
        {
            id: 1,
            icon: 'icon-PhoneNull',
            title: 'phone',
            style: 'success',
            iconStyle: 'success',
            showType: 0,
            handler: (item) => alert(`phone clicked at ${item.getKey()}`)
        },
        {
            id: 2,
            icon: 'icon-Edit',
            title: 'edit',
            showType: 0
        }
    ];

    protected _isEditInPlace: boolean = false;
    protected _isAddInPlace: boolean = false;
    protected _isDrag: boolean = false;

    protected _collection: Collection<Model> = null;

    protected _groupingKeyCallback: Function = (item) => item.get('group');

    protected _beforeMount(): void {
        this._items = new RecordSet({
            rawData: this._generateListItems(100),
            keyProperty: 'key'
        });
    }

    protected _afterMount(): void {
        window.view = document.querySelector('.listViewContainer').controlNodes[0].control;
        this._collection = window.collection = window.view._collection;
    }

    // Edit in place

    protected _startEditInPlace(): void {
        const itemKey = parseInt(this._children.editInPlaceItemKeyInput.value, 10);

        if (!Number.isNaN(itemKey)) {
            const item = this._collection.getItemBySourceKey(itemKey);
            const editingContents = item.getContents().clone();

            EditInPlaceController.beginEdit(this._collection, itemKey, editingContents);

            this._isEditInPlace = true;
        }
    }

    protected _startAddInPlace(): void {
        const addPosition = this._children.addInPlacePositionSelect.value;

        this._collection.setEditingConfig({
            ...this._collection.getEditingConfig(),
            addPosition
        });

        const record = new Model({
            rawData: {
                title: 'default',
                key: 1000000000,
                group: '-1'
            },
            keyProperty: 'key'
        });

        EditInPlaceController.beginAdd(this._collection, record);

        this._isAddInPlace = true;
    }

    protected _stopInPlace(): void {
        if (this._isEditInPlace) {
            EditInPlaceController.endEdit(this._collection);
            this._isEditInPlace = false;
        } else if (this._isAddInPlace) {
            EditInPlaceController.endAdd(this._collection);
            this._isAddInPlace = false;
        }
    }

    protected _startDrag(): void {
        const dragItemKeys = this._children.dragItemKeysInput.value
            .split(',')
            .map((n) => parseInt(n.trim(), 10))
            .filter((n) => !Number.isNaN(n));

        const avatarItemKey = parseInt(this._children.dragAvatarKeyInput.value, 10);

        if (!Number.isNaN(avatarItemKey)) {
            const startCommand = new DragCommands.Start(dragItemKeys, avatarItemKey);
            startCommand.execute(this._collection);
            this._isDrag = true;
        }
    }

    protected _moveDrag(): void {
        const newIndex = parseInt(this._children.dragAvatarPositionInput.value, 10);
        if (!Number.isNaN(newIndex)) {
            const moveCommand = new DragCommands.Move(newIndex);
            moveCommand.execute(this._collection);
        }
    }

    protected _stopDrag(): void {
        const stopCommand = new DragCommands.Stop();
        stopCommand.execute(this._collection);
        this._isDrag = false;
    }

    private _generateListItems(count: number) {
        const result = [];
        while (count--) {
            result.push(this._generateListItem());
        }
        return result;
    }

    private _generateListItem() {
        const key = this._nextKey++;
        return {
            key,
            title: `${key} list element`,
            group: `Group ${Math.floor(key / 10)}`
        };
    }
}
