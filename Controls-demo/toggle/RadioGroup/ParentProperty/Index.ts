import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/toggle/RadioGroup/ParentProperty/Template';
import {Memory} from 'Types/source';

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _selectedKey: number = 4;
    protected _source: Memory = new Memory({
        keyProperty: 'key',
        data: [
            {
                key: 1,
                title: 'First option',
                parent: null,
                node: false
            },
            {
                key: 2,
                title: 'Second option',
                parent: null,
                node: true
            },
            {
                key: 3,
                title: 'Third option',
                parent: 2,
                node: false
            },
            {
                key: 4,
                title: 'Fourth option',
                parent: 2,
                node: false
            },
            {
                key: 5,
                title: 'Fifth option',
                parent: 2,
                node: false
            },
            {
                key: 6,
                title: 'Sixth options',
                parent: null,
                node: false
            },
            {
                key: 7,
                title: 'Sevent option',
                parent: null,
                node: false
            }
        ]
    });
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
