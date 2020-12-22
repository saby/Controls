import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/Grouped/Grouped';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {getGroupedCatalog as getData} from '../../DemoHelpers/DataCatalog';
import {groupConstants as constView} from 'Controls/list';
import {SyntheticEvent} from 'Vdom/Vdom';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _fakeItemId: number;
    private _activeGroup: string;
    private _editingConfig = {
        editOnClick: true,
        sequentialEditing: true,
        addPosition: 'top'
    };
    private _addPosition = 'top';

    protected _beforeMount(): void {
        const data = getData();
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

    private _groupingKeyCallback(item: Model): string {
        const groupId = item.get('brand');
        return groupId === 'apple' ? constView.hiddenGroup : groupId;
    }

    protected _onBeforeBeginEdit(
        e: SyntheticEvent<null>,
        options: { item?: Model },
        isAdd: boolean): Promise<{item: Model}> | void {
        if (!isAdd) {
            this._activeGroup = this._groupingKeyCallback(options.item);
            return;
        }
        return this._viewSource.create().addCallback((model) => {
            model.set('id', ++this._fakeItemId);
            model.set('title', '');
            model.set('brand', this._activeGroup || 'asd');
            return model;
        }) as unknown as Promise<Model>;
    }

    protected _beginAdd(): void {
        this._children.list.beginAdd();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
