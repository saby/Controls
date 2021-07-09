import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/tileNew/BackgroundColorStyle/BackgroundColorStyle';
import * as explorerImages from 'Controls-demo/Explorer/ExplorerImages';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;

    protected _beforeMount(): void {
        const preparedData = Gadgets.getData();
        preparedData[0].image = null;
        preparedData[0].isDocument = undefined;
        preparedData[1].image = null;
        preparedData[2].image = explorerImages[3]

        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: preparedData
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
