import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Search/SearchParam/HierarchyList/Index');
import {Memory} from 'Types/source';
import * as ExplorerMemory from 'Controls-demo/Explorer/ExplorerMemory';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Menu/Control/Menu';

class SearchHierarchy extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _selectedKeys: any[] = ['1'];

    protected _beforeMount(): void {
        this._source = new ExplorerMemory({
            data: [
                { id: '1', title: 'Task', '@parent': true, parent: null },
                { id: '2', title: 'Error in the development', '@parent': false, parent: null },
                { id: '3', title: 'Commission', parent: '1', '@parent': true },
                { id: '4', title: 'Sales', parent: '1', '@parent': true },
                { id: '5', title: 'Documentation', parent: '1', '@parent': true },
                { id: '6', title: 'Development', parent: '1', '@parent': true },
                { id: '7', title: 'Exploitation', parent: '1', '@parent': true },
                { id: '8', title: 'Coordination', parent: '3' },
                { id: '9', title: 'Approval', parent: '3' },
                { id: '10', title: 'Negotiate the discount', parent: '4' },
                { id: '11', title: 'Coordination of change prices', parent: '4' },
                { id: '12', title: 'Approval of price changes', parent: '4' },
                { id: '13', title: 'Change documentation', parent: '5' },
                { id: '14', title: 'Release news', parent: '5' },
                { id: '15', title: 'Change instructions', parent: '5' },
                { id: '16', title: 'Task to development', parent: '6' },
                { id: '17', title: 'Error', parent: '6' },
                { id: '18', title: 'Merge request', parent: '6' },
                { id: '19', title: 'Other', parent: '6', '@parent': true },
                { id: '20', title: 'Development auto tests', parent: '19' },
                { id: '21', title: 'Translation', parent: '19' },
                { id: '22', title: 'Job journal', parent: '7' },
                { id: '23', title: 'Telephony', parent: '7' }
            ],
            keyProperty: 'id'
        });
    }
}
export default SearchHierarchy;
