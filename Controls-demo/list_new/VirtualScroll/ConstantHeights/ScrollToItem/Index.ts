import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/ConstantHeights/ScrollToItem/ScrollToItem';
import {Memory} from 'Types/source';
import {generateData} from '../../../DemoHelpers/DataCatalog';
import {SyntheticEvent} from 'Vdom/Vdom';

interface IItem {
    id: number;
    title: string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    private dataArray: IItem[] = generateData<IItem>({
        keyProperty: 'id',
        count: 1000,
        beforeCreateItemCallback: (item) => {
            item.title = `Запись с ключом ${item.id}.`;
        }
    });

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this.dataArray
        });
    }

    protected _scrollToItem(event: SyntheticEvent, id: number): void {
        // @ts-ignore
        this._children.list.scrollToItem(id, false, true);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
