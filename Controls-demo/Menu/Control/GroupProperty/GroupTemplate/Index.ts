import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/GroupProperty/GroupTemplate/Index');
import {Memory} from 'Types/source';
import 'css!Controls-demo/Controls-demo';

class GroupTemplate extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
       this._source = new Memory({
            data: [
                { key: 1, title: 'Project', group: 'Select' },
                { key: 2, title: 'Work plan', group: 'Select' },
                { key: 3, title: 'Task', group: 'Select' },
                { key: 4, title: 'Merge request', group: 'Create' },
                { key: 5, title: 'Meeting', group: 'Create' },
                { key: 6, title: 'Video meeting', group: 'Create' }
            ],
            keyProperty: 'key'
        });
    }

    static _theme: string[] = ['Controls/Classes'];

}
export default GroupTemplate;
