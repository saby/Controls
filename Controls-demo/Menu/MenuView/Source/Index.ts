import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/MenuView/Source/Index');
import {Memory, HierarchicalMemory} from 'Types/source';
import 'css!Controls-demo/Controls-demo';

class CloseButtonVisibility extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _hierarchySource: HierarchicalMemory;
    protected _source: Memory;
    protected _itemsMore: object[];
    protected _sourceMore: Memory;

    protected _beforeMount(): void {
        this._hierarchySource = new HierarchicalMemory({
            data: [
                {key: '1', title: 'Task', '@parent': true, parent: null},
                {key: '2', title: 'Error in the development', '@parent': false, parent: null},
                {key: '3', title: 'Commission', parent: 1},
                {key: '4', title: 'Coordination', parent: 1, '@parent': true},
                {key: '5', title: 'Application', parent: 1},
                {key: '6', title: 'Development', parent: 1},
                {key: '7', title: 'Exploitation', parent: 1},
                {key: '8', title: 'Coordination', parent: 4},
                {key: '9', title: 'Negotiate the discount', parent: 4},
                {key: '10', title: 'Coordination of change prices', parent: 4, '@parent': true},
                {key: '11', title: 'Matching new dish', parent: 4},
                {key: '12', title: 'New level', parent: 10},
                {key: '13', title: 'New level record 2', parent: 10},
                {key: '14', title: 'New level record 3', parent: 10, '@parent': true},
                {key: '15', title: 'Very long hierarchy', parent: 14},
                {key: '16', title: 'Very long hierarchy 2', parent: 14, '@parent': true},
                {key: '17', title: 'Very long hierarchy 3', parent: 14},
                {key: '18', title: 'It is last level', parent: 16},
                {key: '19', title: 'It is last level 2', parent: 16},
                {key: '20', title: 'It is last level 3', parent: 16}
            ],
            keyProperty: 'key',
            parentProperty: 'parent'
        });

        this._source = new Memory({
            data: [
                {key: 1, title: 'Administrator', icon: 'icon-small icon-AdminInfo'},
                {key: 2, title: 'Moderator'},
                {key: 3, title: 'Participant'},
                {key: 4, title: 'Subscriber', icon: 'icon-small icon-Subscribe'}
            ],
            keyProperty: 'key'
        });

        this._itemsMore = [
            {id: 1, title: 'Banking and financial services, credit'},
            {id: 2, title: 'Gasoline, diesel fuel, light oil products', comment: 'comment'},
            {id: 3, title: 'Transportation, logistics, customs'},
            {id: 4, title: 'Oil and oil products', comment: 'comment'},
            {id: 5, title: 'Pipeline transportation services', comment: 'comment'},
            {id: 6, title: 'Services in tailoring and repair of clothes, textiles'},
            {id: 7, title: 'Computers and components, computing, office equipment'}
        ];

        this._sourceMore = new Memory({
            data: this._itemsMore,
            keyProperty: 'id'
        });
    }

    static _theme: string[] = ['Controls/Classes'];

}
export default CloseButtonVisibility;
