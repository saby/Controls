import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/DigitPaging/MinElements/MinElements';
import {Memory} from 'Types/source';
import {generateData} from '../../../DemoHelpers/DataCatalog';

interface IItem {
    title: string;
    id: number | string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _elementsCount: number = 5;
    private _dataArray: unknown = this._getData();

    private _getData(): Record<string, any> {
        return generateData({
            count: this._elementsCount,
            beforeCreateItemCallback: (item: IItem) => {
                item.title = `Запись с идентификатором ${item.id} и каким то не очень длинным текстом`;
            }
        });
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }

    protected _onUpdateElementsCount() {
        this._elementsCount = this._elementsCount === 5 ? 6 : 5;
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
