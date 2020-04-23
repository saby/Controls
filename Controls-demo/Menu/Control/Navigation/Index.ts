import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/Navigation/Index');
import {Memory} from 'Types/source';

class Navigation extends Control {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _source: Memory;
    protected _navigation: object;

    protected _beforeMount(): void {
        this._navigation = {
            view: 'page',
            source: 'page',
            sourceConfig: {
                pageSize: 4,
                page: 0,
                hasMore: false
            }
        };
        this._source = new Memory({
            data: [
                {key: '1', title: 'Task'},
                {key: '2', title: 'Error in the development'},
                {key: '3', title: 'Commission'},
                {key: '4', title: 'Coordination'},
                {key: '5', title: 'Application'},
                {key: '6', title: 'Development'},
                {key: '7', title: 'Exploitation'},
                {key: '8', title: 'Coordination'},
                {key: '9', title: 'Negotiate the discount'},
                {key: '10', title: 'Coordination of change prices'},
                {key: '11', title: 'Matching new dish'},
                {key: '12', title: 'New level'},
                {key: '13', title: 'New level record 2'},
                {key: '14', title: 'New level record 3'},
                {key: '15', title: 'Very long hierarchy'},
                {key: '16', title: 'Very long hierarchy 2'},
                {key: '17', title: 'Very long hierarchy 3'},
                {key: '18', title: 'It is last level'},
                {key: '19', title: 'It is last level 2'},
                {key: '20', title: 'It is last level 3'}
            ]
        });
    }

    static _theme: string[] = ['Controls/Classes'];

}
export default Navigation;
