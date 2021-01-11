import rk = require('i18n!Controls');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as ListTemplate from 'wml!Controls/_filterPanel/Editors/List';
import * as ColumnTemplate from 'wml!Controls/_filterPanel/Editors/resources/ColumnTemplate';
import * as AdditionalColumnTemplate from 'wml!Controls/_filterPanel/Editors/resources/AdditionalColumnTemplate';
import * as CircleTemplate from 'wml!Controls/_filterPanel/Editors/resources/CircleTemplate';
import {StackOpener} from 'Controls/popup';
import {Model} from 'Types/entity';
import {IFilterOptions, ISourceOptions, INavigationOptions, IItemActionsOptions, ISelectorDialogOptions} from 'Controls/interface';
import {IList} from 'Controls/list';
import {IColumn} from 'Controls/grid';
import {List, RecordSet} from 'Types/collection';
import {factory} from 'Types/chain';

export interface IListEditorOptions extends IControlOptions, IFilterOptions, ISourceOptions, INavigationOptions,
    IItemActionsOptions, IList, IColumn, ISelectorDialogOptions {
    propertyValue: number[]|string[];
    showSelectorCaption?: string;
    additionalTextProperty: string;
    multiSelect: boolean;
}

/**
 * Контрол используют в качестве редактора для выбора значений из списка на {@link Controls/filterPanel:View панели фильтров}.
 * @class Controls/_filterPanel/Editors/List
 * @extends Core/Control
 * @mixes Controls/_grid/interface/IGridControl
 * @mixes Controls/_interface/INavigation
 * @author Мельникова Е.А.
 * @public
 */

/**
 * @name Controls/_filterPanel/Editors/List#showSelectorCaption
 * @cfg {String} Заголовок для кнопки в подвале списка, которая открывает окно выбора из справочника.
 * @demo Controls-demo/filterPanel/ListEditor/ShowSelectorCaption/Index
 * @default Другие
 */

/**
 * @name Controls/_filterPanel/Editors/List#additionalTextProperty
 * @cfg {String} Имя свойства, содержащего информацию об идентификаторе дополнительного столбца в списке.
 * @demo Controls-demo/filterPanel/ListEditor/AdditionalTextProperty/Index
 */

/**
 * @name ontrols/_filterPanel/Editors/List#style
 * @cfg {String} Стиль отображения чекбокса в списке.
 * @variant default
 * @variant master
 * @default default
 */

/**
 * @name ontrols/_filterPanel/Editors/List#multiSelect
 * @cfg {boolean} Определяет, установлен ли множественный выбор.
 * @demo Controls-demo/filterPanel/ListEditor/MultiSelect/Index
 * @default false
 */

class ListEditor extends Control<IListEditorOptions> {
    protected _template: TemplateFunction = ListTemplate;
    protected _circleTemplate: TemplateFunction = CircleTemplate;
    protected _columns: object[] = null;
    protected _stackOpener: StackOpener = null;
    protected _items: RecordSet = null;
    protected _selectedKeys: string[]|number[] = [];
    private _itemsReadyCallback: Function = null;

    protected _beforeMount(options: IListEditorOptions): void {
        this._selectedKeys = options.propertyValue;
        this._setColumns(options.displayProperty, options.propertyValue, options.additionalTextProperty);
        this._itemsReadyCallback = this._handleItemsReadyCallback.bind(this);
    }

    protected _beforeUpdate(options: IListEditorOptions): void {
        const valueChanged = options.propertyValue !== this._options.propertyValue;
        const displayPropertyChanged = options.displayProperty !== this._options.displayProperty;
        const additionalDataChanged = options.additionalTextProperty !== this._options.additionalTextProperty;
        if (additionalDataChanged || valueChanged || displayPropertyChanged) {
            this._selectedKeys = options.propertyValue;
            this._setColumns(options.displayProperty, options.propertyValue, options.additionalTextProperty);
        }
    }

    protected _handleItemsReadyCallback(items: RecordSet): void {
        this._items = items;
    }

    protected _handleItemClick(event: SyntheticEvent, item: Model, nativeEvent: SyntheticEvent): void {
        const contentClick = nativeEvent.target.closest('.controls-ListEditor__columns');
        if (contentClick) {
            this._notifyPropertyValueChanged([item.get(this._options.keyProperty)], true);
        }
    }

    protected _handleSelectedKeysChanged(event: SyntheticEvent, keys: string[]|number[]): void {
        this._notifyPropertyValueChanged(keys, !this._options.multiSelect);
    }

    protected _handleSelectedKeyChanged(event: SyntheticEvent, key: string|number): void {
        this._notifyPropertyValueChanged([key], !this._options.multiSelect);
    }

    protected _handleSelectorResult(result: Model[]): void {
        const selectedKeys = [];
        result.forEach((item) => {
            selectedKeys.push(item.get(this._options.keyProperty));
        });
        this._notifyPropertyValueChanged(selectedKeys, !this._options.multiSelect);
    }

    protected _handleFooterClick(event: SyntheticEvent): void {
        const selectorOptions = this._options.selectorTemplate;
        this._getStackOpener().open({
            ...{
                opener: this,
                templateOptions: {
                    ...selectorOptions.templateOptions,
                    ...{
                        selectedKeys: this._selectedKeys,
                        selectedItems: this._getSelectedItems(),
                        multiSelect: this._options.multiSelect
                    }
                },
                template: selectorOptions.templateName,
                eventHandlers: {
                    onResult: this._handleSelectorResult.bind(this)
                }
            },
            ...selectorOptions.popupOptions
        });
    }

    protected _notifyPropertyValueChanged(value: string[]|number[], needColapse?: boolean): void {
        const extendedValue = {
            value,
            textValue: this._getTextValue(value),
            needColapse
        };
        this._selectedKeys = value;
        this._setColumns(this._options.displayProperty, this._selectedKeys, this._options.additionalTextProperty);
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    protected _setColumns(displayProperty: string, propertyValue: string[]|number[], additionalTextProperty?: string): void {
        this._columns = [{
            template: ColumnTemplate,
            selected: propertyValue,
            displayProperty
        }];
        if (additionalTextProperty) {
            this._columns.push({
                template: AdditionalColumnTemplate,
                align: 'right',
                displayProperty: additionalTextProperty,
                width: 'auto'});
        }
    }

    protected _beforeUnmount(): void {
        if (this._stackOpener) {
            this._stackOpener.destroy();
        }
    }

    private _getSelectedItems(): List<Model> {
        const selectedItems = [];
        factory(this._selectedKeys).each((key) => {
            const record = this._items.getRecordById(key);
            if (record) {
                selectedItems.push(record);
            }
        });
        return new List({
            items: selectedItems
        });
    }

    private _getTextValue(selectedKeys: number[]|string[]): string {
        const textArray = [];
        selectedKeys.forEach((item, index) => {
            const record = this._items.getRecordById(item);
            textArray.push(record.get(this._options.displayProperty));
        });
        return textArray.join(', ');
    }

    private _getStackOpener(): StackOpener {
        if (!this._stackOpener) {
            this._stackOpener = new StackOpener();
        }
        return this._stackOpener;
    }

    static _theme: string[] = ['Controls/filterPanel', 'Controls/toggle'];

    static getDefaultOptions(): object {
        return {
            showSelectorCaption: rk('Другие'),
            style: 'default',
            itemPadding: {
                right: 'm'
            }
        };
    }
}
export default ListEditor;
