import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Popup/SearchParam/BreadCrumbsItemTemplate/Index');
import {Memory} from 'Types/source';
import * as ExplorerMemory from 'Controls-demo/Explorer/ExplorerMemory';

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new ExplorerMemory({
            data: [
                { id: '1', title: 'Commission', '@parent': true, parent: null },
                { id: '2', title: 'Sales', '@parent': true, parent: null },
                { id: '3', title: 'Documentation', '@parent': true, parent: null },
                { id: '4', title: 'Development', '@parent': true, parent: null },
                { id: '5', title: 'Exploitation', '@parent': true, parent: null },
                { id: '6', title: 'Coordination', parent: '1' },
                { id: '7', title: 'Approval', parent: '1' },
                { id: '8', title: 'Negotiate the discount', parent: '2' },
                { id: '9', title: 'Coordination of change prices', parent: '2' },
                { id: '10', title: 'Approval of price changes', parent: '2' },
                { id: '11', title: 'Change documentation', parent: '3' },
                { id: '12', title: 'Release news', parent: '3' },
                { id: '13', title: 'Change instructions', parent: '3' },
                { id: '14', title: 'Task to development', parent: '4' },
                { id: '15', title: 'Error', parent: '4' },
                { id: '16', title: 'Merge request', parent: '4' },
                { id: '17', title: 'Other', parent: '4', '@parent': true },
                { id: '18', title: 'Development auto tests', parent: '17' },
                { id: '19', title: 'Translation', parent: '17' },
                { id: '20', title: 'Job journal', parent: '5' },
                { id: '21', title: 'Telephony', parent: '5' }
            ],
            keyProperty: 'id'
        });
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Menu/Menu'];
}