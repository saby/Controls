import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/CheckboxGroup/Direction/Template');
import {Memory} from 'Types/source';

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _selectedKeys: number[] = [2, 4, 6];
    protected _source: Memory = new Memory({
        keyProperty: 'key',
        data: [
            {
                key: 1,
                title: 'First option'
            },
            {
                key: 2,
                title: 'Second option'
            },
            {
                key: 3,
                title: 'Third option'
            },
            {
                key: 4,
                title: 'Fourth option'
            },
            {
                key: 5,
                title: 'Fifth option'
            },
            {
                key: 6,
                title: 'Sixth options'
            },
            {
                key: 7,
                title: 'Sevent option'
            }
        ]
    });

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/toggle/CheckboxGroup/Direction/Style'];
}
export default ViewModes;
