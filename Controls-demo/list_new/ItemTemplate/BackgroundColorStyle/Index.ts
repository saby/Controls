import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/ItemTemplate/BackgroundColorStyle/BackgroundColorStyle';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';
import 'wml!Controls-demo/list_new/ItemTemplate/FromFile/TempItem';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    protected getBackgroundColorStyle(itemIndex: number): string {
        // tslint:disable-next-line
        if (itemIndex % 2 === 0) {
            return 'danger';
        }

        return 'success';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
