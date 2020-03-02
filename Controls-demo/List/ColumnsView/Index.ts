import {Control, TemplateFunction} from 'UI/Base';
import {ICrud} from 'Types/source';
import {SourceControl} from 'Controls/list';

import * as Template from 'wml!Controls-demo/List/ColumnsView/ColumnsView';
import {SourceFaker} from '../Utils/listDataGenerator';

const NUMBER_OF_ITEMS = 50;

/**
 * http://localhost:3000/Controls-demo/app/Controls-demo%2FList%2FRenderContainer%2FIndex
 * http://localhost:3000/Controls-demo/app/Controls-demo%2Flist%2FColumnsView%2FIndex
 */
export default class RenderColumnsViewContainerDemo extends Control {
    protected _template: TemplateFunction = Template;

    protected _children = {
        sourceControl: SourceControl
    };

    protected _itemsSource: SourceFaker;

    protected _itemActions: any[];

    protected _pageSize: number;

    protected _page: number;

    protected _needToFail: boolean;

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._needToFail = false;
        this._pageSize = NUMBER_OF_ITEMS;
        this._page = 0;
        this._itemsSource = new SourceFaker({
            startIndex: 0,
            perPage: NUMBER_OF_ITEMS,
            failed: this._needToFail,
            keyProperty: 'id',
            itemModel: {
                title: {
                    type: 'string',
                    value: 'title',
                    addId: true
                }
            }});
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

    /**
     * Кликаем по кнопке "Загрузить ещё"
     * @private
     */
    protected _onLoadMoreClick() {
        this._children.sourceControl.loadMore();
    }

    /**
     * Кликаем по кнопке "Показывать ошибку"
     * @private
     */
    protected _onNeedToFailToggleClick() {
        this._needToFail = !this._needToFail;
        this._itemsSource.setFailed(this._needToFail);
    }
}
