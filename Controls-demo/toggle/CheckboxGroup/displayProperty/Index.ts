import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/CheckboxGroup/displayProperty/Template');
import {Memory} from 'Types/source';

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _selectedKeys1: number[] = [1];
    protected _selectedKeys2: number[] = [1];
    protected _source: Memory = new Memory({
        keyProperty: 'key',
        data: [
            {
                key: 1,
                title: 'title 1',
                caption: 'caption 1'
            },
            {
                key: 2,
                title: 'title 2',
                caption: 'caption 2'
            },
            {
                key: 3,
                title: 'title 3',
                caption: 'caption 3'
            }
        ]
    });
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
