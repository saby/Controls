import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Search/SearchParam/FlatList/Index');
import {Memory} from 'Types/source';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Menu/Control/Menu';

class SearchFlat extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _selectedKeys: any[] = [1];

    protected _beforeMount(): void {

        this._source = new SearchMemory({
            keyProperty: 'key',
            data: [
                { key: 1, title: 'admin.sbis.ru' },
                { key: 2, title: 'booking.sbis.ru' },
                { key: 3, title: 'ca.sbis.ru' },
                { key: 4, title: 'ca.tensor.ru' },
                { key: 5, title: 'cloud.sbis.ru' },
                { key: 6, title: 'consultant.sbis.ru' },
                { key: 7, title: 'explain.sbis.ru' },
                { key: 8, title: 'genie.sbis.ru' },
                { key: 9, title: 'my.sbis.ru' },
                { key: 10, title: 'ofd.sbis.ru' },
                { key: 11, title: 'online.sbis.ru' },
                { key: 12, title: 'presto-offline' },
                { key: 13, title: 'retail-offline' },
                { key: 14, title: 'sbis.ru' },
                { key: 15, title: 'tensor.ru' },
                { key: 16, title: 'wi.sbis.ru' },
                { key: 17, title: 'dev-online.sbis.ru' },
                { key: 18, title: 'fix-online.sbis.ru' },
                { key: 19, title: 'fix-cloud.sbis.ru' },
                { key: 20, title: 'rc-online.sbis.ru' },
                { key: 21, title: 'pre-test-online.sbis.ru' },
                { key: 22, title: 'test-online.sbis.ru' }
            ],
            searchParam: 'title',
            filter: MemorySourceFilter()
        });
    }
}
export default SearchFlat;
