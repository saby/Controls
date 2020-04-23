import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/Grouped/Grouped';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {getGroupedCatalog as getData} from '../../DemoHelpers/DataCatalog';
import {view as constView} from 'Controls/Constants';
import {SyntheticEvent} from 'Vdom/Vdom';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    private _viewSource: Memory;
    private _fakeItemId: number;
    private _activeGroup: string;

    protected _beforeMount(): void {
        const data = getData();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
        this._fakeItemId = data.length;
    }

    private _groupingKeyCallback(item: Model): string {
        const groupId = item.get('brand');
        return groupId === 'apple' ? constView.hiddenGroup : groupId;
    }

    protected _onBeforeBeginEdit(e: SyntheticEvent<null>, options: { item?: Model }, isAdd: boolean): Promise<{item: Model}> | void {
        if (!isAdd) {
            this._activeGroup = this._groupingKeyCallback(options.item);
            return;
        }
        return this._viewSource.create().addCallback((model) => {
            model.set('id', ++this._fakeItemId);
            model.set('title', '');
            model.set('brand', this._activeGroup || 'asd');
            return {item: model};
        }) as unknown as Promise<{item: Model}>;
    }

    protected _beginAdd(): void {
        this._children.list.beginAdd();
    }
}
