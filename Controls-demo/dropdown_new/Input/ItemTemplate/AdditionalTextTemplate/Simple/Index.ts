import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Input/ItemTemplate/AdditionalTextTemplate/Simple/Index');
import {Memory} from 'Types/source';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _selectedKeys: number[] = [1];

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                {
                    key: 1, title: 'Subdivision'
                },
                {
                    key: 2, title: 'Separate unit', iconStyle: 'secondary', icon: 'icon-size icon-16 icon-Company',
                    comment: 'A territorially separated subdivision with its own address. For him, you can specify a legal entity'
                },
                {
                    key: 3, title: 'Working group', icon: 'icon-size icon-16 icon-Groups icon-primary',
                    comment: 'It is not a full-fledged podcasting, it serves for grouping. As a unit, the employees will have a higher department or office'
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
