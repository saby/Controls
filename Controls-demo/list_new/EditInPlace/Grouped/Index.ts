import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/Grouped/Grouped';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {getEditableGroupedCatalog as getData} from '../../DemoHelpers/Data/Groups';
import {groupConstants as constView} from 'Controls/list';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IEditingConfig} from 'Controls/display';

const data = getData().slice(2).map((item) => {
    if (item.brand === 'apple') {
        item.brand = constView.hiddenGroup;
    }
    return item;
});

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _fakeItemId: number;
    private _activeGroup: string = 'Xiaomi';
    protected _editingConfig: IEditingConfig = {
        editOnClick: true,
        sequentialEditing: true,
        addPosition: 'top'
    };
    protected _collapsedGroups: string[] = ['asus', 'hp'];
    protected _addPosition: string = 'top';

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
        this._fakeItemId = data.length;
    }

    protected _setPosition(e, position: 'top' | 'bottom'): void {
        this._addPosition = position;
        this._editingConfig.addPosition = position;
    }

    protected _resetGroup(): void {
        this._activeGroup = 'Xiaomi';
    }

    protected _onBeforeBeginEdit(
        e: SyntheticEvent<null>,
        options: { item?: Model },
        isAdd: boolean): Promise<{item: Model}> | void {
        if (!isAdd) {
            this._activeGroup = options.item.get('brand');
            return;
        }
    }

    protected _beginAdd(): void {
        const item = new Model({
            keyProperty: 'id',
            rawData: {
                id: ++this._fakeItemId,
                title: '',
                brand:  this._activeGroup
            }
        });
        this._children.list.beginAdd({item});
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
