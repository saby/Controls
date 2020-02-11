import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/Grouped/RightTemplate/RightTemplate"
import {Memory} from "Types/source"
import {RecordSet} from "Types/collection"
import {Model} from "Types/entity"
import {getFewCategories as getData} from "../../DemoHelpers/DataCatalog"
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    protected _groupingKeyCallback(item: Model): string {
        return item.get('byDemand');
    }

    protected _dataLoadCallback(items: RecordSet) {
        items.setMetaData({
            groupResults: {
                'Popular': 3.6,
                'Unpopular': 3.2,
                'Hit': 4.1
            }
        });
    }
}