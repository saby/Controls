import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/MultiSelect/SelectionType/SelectionType';
import {Memory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _columns = [
        { displayProperty: 'title', width: '200px' },
        { displayProperty: 'country', width: '200px' }
    ];
    protected _selectedKeys: number[] = [null];
    protected _excludedKeys: number[] = [null];
    protected _expandedItems: number[] = [2];
    protected _selectionType: string = 'all';

    protected _beforeMount(): void {
        const data = Gadgets.getFlatData();

        data.find((it) => it.title === 'Asus').checkboxState = false;
        data.find((it) => it.title === 'Acer').checkboxState = false;

        this._viewSource = new Memory({
            keyProperty: 'id',
            data,
            filter: () => true
        });
    }

    protected _onToggle(): void {
        if (this._selectionType === 'all') {
            this._selectionType = 'node';
        } else if (this._selectionType === 'node') {
            this._selectionType = 'leaf';
        } else {
            this._selectionType = 'all';
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
