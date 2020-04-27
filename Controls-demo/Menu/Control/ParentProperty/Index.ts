import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/ParentProperty/Index');
import {HierarchicalMemory} from 'Types/source';

class ParentProperty extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _hierarchySource: HierarchicalMemory;
    protected _hierarchySource2: HierarchicalMemory;

    protected _beforeMount(): void {
        this._hierarchySource = new HierarchicalMemory({
            data: [
                {key: 1, title: 'Task', '@parent': true, parent: null},
                {key: 2, title: 'Error in the development', '@parent': false, parent: null},
                {key: 3, title: 'Commission', parent: 1},
                {key: 4, title: 'Coordination', parent: 1, '@parent': true},
                {key: 5, title: 'Application', parent: 1},
                {key: 6, title: 'Development', parent: 1},
                {key: 7, title: 'Exploitation', parent: 1},
                {key: 8, title: 'Coordination', parent: 4},
                {key: 9, title: 'Negotiate the discount', parent: 4},
                {key: 10, title: 'Coordination of change prices', parent: 4, '@parent': true},
                {key: 11, title: 'Matching new dish', parent: 4},
                {key: 12, title: 'New level', parent: 10},
                {key: 13, title: 'New level record 2', parent: 10},
                {key: 14, title: 'New level record 3', parent: 10, '@parent': true},
                {key: 15, title: 'Very long hierarchy', parent: 14},
                {key: 16, title: 'Very long hierarchy 2', parent: 14, '@parent': true},
                {key: 17, title: 'Very long hierarchy 3', parent: 14},
                {key: 18, title: 'It is last level', parent: 16},
                {key: 19, title: 'It is last level 2', parent: 16},
                {key: 20, title: 'It is last level 3', parent: 16}
            ],
            keyProperty: 'key',
            parentProperty: 'parent'
        });

        this._hierarchySource2 = new HierarchicalMemory({
            data: [
                {key: '1', title: 'Task', '@parent': true, parent: null},
                {key: '2', title: 'Error in the development', '@parent': false, parent: null},
                {key: '3', title: 'Commission', parent: '1', '@parent': true},
                {key: '4', title: 'Sales', parent: '1', '@parent': true},
                {key: '5', title: 'Documentation', parent: '1', '@parent': true},
                {key: '6', title: 'Development', parent: '1', '@parent': true},
                {key: '7', title: 'Exploitation', parent: '1', '@parent': true},
                {key: '8', title: 'Coordination', parent: '3'},
                {key: '8', title: 'Approval', parent: '3'},
                {key: '9', title: 'Negotiate the discount', parent: '4'},
                {key: '10', title: 'Coordination of change prices', parent: '4'},
                {key: '11', title: 'Approval of price changes', parent: '4'},
                {key: '12', title: 'Change documentation', parent: '5'},
                {key: '13', title: 'Release news', parent: '5'},
                {key: '14', title: 'Change instructions', parent: '5'},
                {key: '15', title: 'Task to development', parent: '6'},
                {key: '16', title: 'Error', parent: '6'},
                {key: '17', title: 'Merge request', parent: '6'},
                {key: '18', title: 'Other', parent: '6', '@parent': true},
                {key: '19', title: 'Development auto tests', parent: '18'},
                {key: '20', title: 'Translation', parent: '18'},
                {key: '21', title: 'Job journal', parent: '7'},
                {key: '22', title: 'Telephony', parent: '7'}
            ],
            keyProperty: 'key',
            parentProperty: 'parent'
        });
    }

    protected _itemClickHandler(event, item): boolean {
        if (item.get('@parent')) {
            return false;
        }
    }

    static _theme: string[] = ['Controls/Classes'];


    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ParentProperty;
