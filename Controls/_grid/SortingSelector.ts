import template = require('wml!Controls/_grid/SortingResources/SortingSelector');
import 'css!theme?Controls/grid';
import {Control, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Record} from 'Types/entity';
import {Memory} from 'Types/source';
import {isEqual} from 'Types/object';
import {ISortingSelectorOptions, ISortingParam} from 'Controls/interface/ISortingSelector';

class SortingSelector extends Control<ISortingSelectorOptions> {
    protected _template: TemplateFunction = template;
    protected _selectedKeys: [number|string];
    private _currentParamName: string = null;
    private _currentOrder: 'ASC'|'DESC' = null;
    protected _source: Memory;

    protected _beforeMount(options: ISortingSelectorOptions): void {
        this.updateConfig(options.sortingParams, options.value);
    }

    protected  _beforeUpdate(newOptions: ISortingSelectorOptions): void {
        if (!isEqual(this._options.value, newOptions.value) ||
            !isEqual(this._options.sortingParams, newOptions.sortingParams)) {
            this.updateConfig(newOptions.sortingParams, newOptions.value);
        }
    }
    private updateConfig(sortingParams: [ISortingParam], value: [object]|undefined): void {
        const data = [];

        if (value && value.length) {
            this._currentParamName = Object.keys(value[0])[0];
            this._currentOrder = value[0][this._currentParamName];
        } else {
            this._currentParamName = null;
            this._currentOrder = null;
        }
        sortingParams.forEach((item: ISortingParam, i: number) => {
            const dataElem = {...item, id: i, value: '', readOnly: true};
            if (dataElem.paramName === this._currentParamName) {
                if (this._currentOrder !== null) {
                    dataElem.value = this._currentOrder;
                }
                this._selectedKeys = [i];
            }

            // Возможность клика должна быть только для пункта, который сбрасывает сортировку
            if (item.paramName === null) {
                dataElem.readOnly = false;
            }
            data.push(dataElem);
        });

        this._source = new Memory({data, keyProperty: 'id'});
    }

    private _resetValue(): void {
        this._notify('valueChanged', [[]]);
    }

    protected _selectedKeysChangedHandler(e: SyntheticEvent<Event>, [key]: [number|string]): boolean | void {
        if (this._options.sortingParams[key].paramName === null) {
            this._resetValue();
            this._selectedKeys = [key];
        } else {
            return false;
        }
    }
    private _setValue(param: string, order: string): void {
        const newValue = [];
        newValue[0] = {};
        newValue[0][param] = order;
        this._notify('valueChanged', [newValue]);
    }
    protected _switchValue(): void {
        const newValue: string = this._currentOrder === 'ASC' ? 'DESC' : 'ASC';
        this._setValue(this._currentParamName, newValue);
    }
    protected _itemArrowClick(e: SyntheticEvent<Event>, item: Record, order: 'ASC'|'DESC'): void {
        const param = item.get('paramName');
        this._selectedKeys = [item.get('id')];
        this._children.dropdown.closeMenu();
        this._setValue(param, order);
    }

    static _theme: [string] = ['Controls/grid'];
}

export default SortingSelector;
