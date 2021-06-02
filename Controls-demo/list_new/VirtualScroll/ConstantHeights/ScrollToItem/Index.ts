import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/ConstantHeights/ScrollToItem/ScrollToItem';
import {Memory} from 'Types/source';
import {generateData} from '../../../DemoHelpers/DataCatalog';
import {SyntheticEvent} from 'Vdom/Vdom';

interface IItem {
    key: number;
    title: string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    private dataArray: IItem[] = generateData<IItem>({
        keyProperty: 'key',
        count: 1000,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.key}.`;
        }
    });

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this.dataArray
        });
    }

    protected _scrollToItem(event: SyntheticEvent, key: number): void {
        this._children.list.scrollToItem(key, false, true);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
