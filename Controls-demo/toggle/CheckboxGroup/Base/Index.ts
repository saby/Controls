import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/CheckboxGroup/Base/Template');
import {Memory} from 'Types/source';

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _selectedKeys: number[] = [1];
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
            }
        ]
    });

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
