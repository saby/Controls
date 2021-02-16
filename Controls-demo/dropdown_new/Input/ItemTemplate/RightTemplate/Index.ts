import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Input/ItemTemplate/RightTemplate/Index');
import {Memory} from 'Types/source';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _selectedKeys: string[] = ['1'];

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: [
                {key: '1', title: 'Save'},
                {key: '2', title: 'Execute'},
                {key: '3', title: 'Discuss', addIcon: 'icon-VideoCallNull'}
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
