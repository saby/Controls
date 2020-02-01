import {Control, TemplateFunction} from 'UI/Base';
import {Memory, ICrud} from 'Types/source';
import {SourceControl} from 'Controls/list';

import * as Template from 'wml!Controls-demo/List/ColumnsView/ColumnsView';

const NUMBER_OF_ITEMS = 100;

/**
 * Генератор данных
 * @param n
 */
const generateRawData = (n: number): any[] => {
    const rawData = [];
    for (let i = 0; i < n; i++) {
        rawData.push({
            id: i,
            title: `${i} item`
        });
    }
    return rawData;
};

/**
 * http://localhost:3000/Controls-demo/app/Controls-demo%2FList%2FRenderContainer%2FIndex
 * http://localhost:3000/Controls-demo/app/Controls-demo%2Flist%2FColumnsView%2FIndex
 */
export default class RenderColumnsViewContainerDemo extends Control {
    protected _template: TemplateFunction = Template;

    protected _children = {
        sourceControl: SourceControl
    };

    protected _itemsSource: ICrud;

    protected _itemActions: any[];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._itemsSource = new Memory({
            data: generateRawData(NUMBER_OF_ITEMS),
            keyProperty: 'id'
        });
        this._itemActions = [
            {
                id: 1,
                icon: 'icon-PhoneNull',
                title: 'phone',
                style: 'success',
                iconStyle: 'success',
                showType: 0,
                handler: (item) => alert(`phone clicked at ${item.getId()}`)
            },
            {
                id: 2,
                icon: 'icon-Edit',
                title: 'fake',
                style: 'danger',
                iconStyle: 'danger',
                showType: 0
            }
        ];
    }
}
