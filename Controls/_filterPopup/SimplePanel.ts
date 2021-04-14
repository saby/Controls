import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_filterPopup/SimplePanel/SimplePanel';
import CoreClone = require('Core/core-clone');
import * as defaultItemTemplate from 'wml!Controls/_filterPopup/SimplePanel/itemTemplate';

import {factory} from 'Types/chain';
import {RecordSet} from 'Types/collection';
import {isEqual} from 'Types/object';
import {HistoryUtils, IFilterItem} from 'Controls/filter';
import 'css!Controls/filterPopup';
import 'css!Controls/menu';

interface ISimplePanelOptions extends IControlOptions {
    itemTemplate: TemplateFunction;
    items: RecordSet;
}

const DEFAULT_MIN_VISIBLE_ITEMS = 2;

/**
 * Панель "быстрых фильтров" для {@link Controls/filter:View}.
 * Шаблон окна, в котором для каждого фильтра с viewMode = 'frequent' отображает список элементов в отдельном блоке.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_filterPopup.less переменные тем оформления}
 *
 * @class Controls/_filterPopup/SimplePanel
 * @extends UI/Base:Control
 * @public
 * @author Михайлов С.Е.
 *
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.filterPopup:SimplePanel
 *     attr:class="custom-SimplePanel"
 *     items="{{_options.items}}" />
 * </pre>
 *
 */

/*
 * Control dropdown list for {@link Controls/filter:View}.
 *
 * @class Controls/_filterPopup/SimplePanel
 * @extends UI/Base:Control
 * @mixes Controls/_filterPopup/SimplePanel/SimplePanelStyles
 *
 * @public
 * @author Михайлов С.Е.
 *
 */
class Panel extends Control<ISimplePanelOptions> {
    protected _template: TemplateFunction = template;
    protected _items: IFilterItem[] = null;
    protected _applyButtonVisible: boolean;
    protected _hasApplyButton: boolean;

    protected _beforeMount(options: ISimplePanelOptions): Promise<void> {
        return this._getItems(options.items).then((items) => {
            this._items = items;
            this._hasApplyButton = this._hasMultiSelect(this._items);
        });
    }

    protected _beforeUpdate(newOptions: ISimplePanelOptions): Promise<void> {
        const itemsChanged = newOptions.items !== this._options.items;
        if (itemsChanged) {
            return this._getItems(newOptions.items).then((items) => {
                this._items = items;
                this._applyButtonVisible = this._needShowApplyButton(this._items);
            });
        }
    }

    protected _itemClickHandler(event: Event, item, keys): void {
        const result = {
            action: 'itemClick',
            event,
            selectedKeys: keys,
            id: item.id
        };
        this._notify('sendResult', [result]);
    }

    protected _checkBoxClickHandler(event, index, keys): void {
        this._items[index].selectedKeys = keys;
        this._applyButtonVisible = this._needShowApplyButton(this._items);
        this._notify('selectedKeysChangedIntent', [index, keys]);
    }

    protected _closeClick(): void {
        this._notify('close');
    }

    protected _applySelection(event: Event): void {
        const result = this._getResult(event, 'applyClick');
        this._notify('sendResult', [result]);
    }

    protected _moreButtonClick(event: Event, item, selectedItems): void {
        this._notify('sendResult',
            [{action: 'moreButtonClick', id: item.id, selectedItems}]);
    }

    private _getItems(initItems: RecordSet) {
        const items = [];
        const loadPromises = [];
        factory(initItems).each((item, index) => {
            const curItem = item.getRawData();
            curItem.initSelectedKeys = this._items ? this._items[index].initSelectedKeys : CoreClone(item.get('selectedKeys'));
            if (curItem.loadDeferred) {
                loadPromises.push(curItem.loadDeferred.addCallback(() => {
                    if (HistoryUtils.isHistorySource(curItem.source)) {
                        curItem.items = curItem.source.prepareItems(curItem.items);
                        curItem.hasMoreButton = curItem.sourceController.hasMoreData('down');
                    }
                }));
            }
            items.push(curItem);
        });
        return Promise.all(loadPromises).then(() => {
            const displayItems = items.filter((item) => {
                const minVisibleItems = item.minVisibleItems !== undefined ? item.minVisibleItems :
                    DEFAULT_MIN_VISIBLE_ITEMS;
                return item.items?.getCount() >= minVisibleItems || item.hasMoreButton;
            });
            return displayItems.length ? displayItems : [items[0]];
        });
    }

    private _isEqualKeys(oldKeys: string[], newKeys: string[]): boolean {
        let result;
        if (oldKeys[0] === null && !newKeys.length) {
            result = false;
        } else {
            result = isEqual(oldKeys, newKeys);
        }
        return result;
    }

    private _needShowApplyButton(items): boolean {
        let isNeedShowApplyButton = false;
        factory(items).each((item) => {
            if (!this._isEqualKeys(item.initSelectedKeys, item.selectedKeys)) {
                isNeedShowApplyButton = true;
            }
        });
        return isNeedShowApplyButton;
    }

    private _getResult(event, action) {
        const result = {
            action,
            event,
            selectedKeys: {}
        };
        factory(this._items).each((item) => {
            result.selectedKeys[item.id] = item.selectedKeys;
        });
        return result;
    }

    private _hasMultiSelect(items: IFilterItem[]): boolean {
        let result = false;
        factory(items).each((item) => {
            if (item.multiSelect) {
                result = true;
            }
        });
        return result;
    }

    static getDefaultOptions(): Partial<ISimplePanelOptions> {
        return {
            itemTemplate: defaultItemTemplate
        }
    };
}

Object.defineProperty(Panel, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Panel.getDefaultOptions();
    }
});

export default Panel;

/**
 * @name Controls/_filterPopup/SimplePanel#items
 * @cfg {RecordSet} Список, в котором описана конфигурация для каждого фильтра, отображающегося в SimplePanel.
 * Формируется контролом {@link Controls/filter:View}. При использовании Controls/_filterPopup/SimplePanel в качестве шаблона для фильтра опцию items необходимо прокинуть в контрол.
 * @example
 * WML:
 * <pre>
 *    <Controls.filterPopup:SimplePanel items="{{_options.items}}"/>
 * </pre>
 */
