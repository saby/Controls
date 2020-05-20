import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/NodeFooterTemplate/Index');
import {HierarchicalMemory} from 'Types/source';

class Root extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: HierarchicalMemory;

    protected _beforeMount(): void {
       this._source = new HierarchicalMemory({
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

    static _theme: string[] = ['Controls/Classes'];


    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Menu/Menu'];
}
export default Root;
