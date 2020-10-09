import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/dropdown_new/Input/MultiSelect/PinnedItems/Simple/Index';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _dataLoadCallback: Function;
    protected _source: Memory;
    protected _selectedKeys: string[] = ['1'];
    private _pinnedItems: RecordSet = new RecordSet({
        rawData: [{
            id: '-2',
            title: 'All items',
            pinned: true
        }, {
            id: '-1',
            title: 'Without internal',
            pinned: true
        }],
        keyProperty: 'id'
    });

    protected _beforeMount(): void {
        this._dataLoadCallback = (items: RecordSet) => {
            if (items.getFormat().getFieldIndex('pinned') === -1) {
                items.addField({
                    name: 'pinned',
                    type: 'boolean',
                    defaultValue: false
                });
            }
            items.prepend(this._pinnedItems);
        };
        this._source = new Memory({
            keyProperty: 'id',
            data: [
                { id: '1', title: 'Banking and financial services, credit' },
                { id: '2', title: 'Gasoline, diesel fuel, light oil products' },
                { id: '3', title: 'Transportation, logistics, customs' },
                { id: '4', title: 'Oil and oil products' },
                { id: '5', title: 'Pipeline transportation services' },
                { id: '6', title: 'Services in tailoring and repair of clothes, textiles' },
                { id: '7', title: 'Computers and components, computing, office equipment' }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
