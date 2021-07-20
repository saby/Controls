import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {INavigationOptionValue, INavigationPageSourceConfig} from 'Controls/interface';
import {getSourceData} from 'Controls-demo/list_new/Navigation/Cut/DataCatalog';
import * as template from 'wml!Controls-demo/list_new/Navigation/Cut/CutSize/CutSize';

export default class Index extends Control {
   protected _template: TemplateFunction = template;
   protected _source: Memory;
   protected _navigation: INavigationOptionValue<INavigationPageSourceConfig>;

   protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: getSourceData()
        });
        this._navigation = {
            source: 'page',
            view: 'cut',
            sourceConfig: {
                pageSize: 3,
                hasMore: false,
                page: 0
            }
        };
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
