import template = require('wml!Controls/_grid/SortingResources/SortingSelector');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Record} from 'Types/entity';
import {Memory} from 'Types/source';
import {isEqual} from 'Types/object';
import {RecordSet} from 'Types/collection';
import {IFontColorStyleOptions, IFontSizeOptions} from 'Controls/interface';

type Order = 'ASC'|'DESC'|'';

export interface ISortingParam {
    paramName: string | null;
    title: string;
    value: 'ASC' | 'DESC';
    icon: string;
    iconStyle: string;
    iconSize: 's' | 'm' | 'l';
}
export interface ISortingSelectorOptions extends IControlOptions, IFontColorStyleOptions, IFontSizeOptions {
    sortingParams: [ISortingParam];
    value: [object];
    header: string;
}

/**
 * Контрол в виде кнопки с выпадающим меню, используемый для изменения сортировки. Рекомендуется, если в реестре нет заголовков.
 *
 * @extends Core/Control
 * @public
 * @implements Controls/_interface/IFontColorStyle
 * @implements Controls/_interface/IFontSize
 * @demo Controls-demo/grid/Sorting/SortingSelector/Default/Index
 * @author Авраменко А.С.
 */
class SortingSelector extends Control<ISortingSelectorOptions> {
    protected _template: TemplateFunction = template;
    private _selectedKeys: [number|string];
    private _currentParamName: string = null;
    private _orders: object = {};
    private _source: Memory;
    private _saveLinkToItems: Function;
    private _items: RecordSet;
    // когда выбран пункт с иконкой, в вызывающем элементе отображается только иконка. У нее другой отступ.
    private _nocaption: boolean = false;
    private _arrowIconStyle: string;
    private _arrowIconHover: boolean;

    protected _beforeMount(options: ISortingSelectorOptions): void {
        this._saveLinkToItems = this._saveLinkToItemsFnc.bind(this);
        this._arrowIconStyle = SortingSelector._getIconStyleFromTextStyle(options.fontColorStyle);
        this._arrowIconHover = SortingSelector._isIconHover(this._arrowIconStyle);
        this.updateConfig(options.sortingParams, options.value);
    }

    protected  _beforeUpdate(newOptions: ISortingSelectorOptions): void {
        this._arrowIconStyle = SortingSelector._getIconStyleFromTextStyle(newOptions.fontColorStyle);
        this._arrowIconHover = SortingSelector._isIconHover(this._arrowIconStyle);
        if (!isEqual(this._options.value, newOptions.value) ||
            !isEqual(this._options.sortingParams, newOptions.sortingParams)) {
            this.updateConfig(newOptions.sortingParams, newOptions.value);
        }
    }

    protected _saveLinkToItemsFnc(items: RecordSet): void {
        this._items = items;
    }

    // надо сбросить стрелку, которая показывает текущее выбранное значение. Остальные оставляем
    protected _resetSelectedArrow(): void {
        if (this._options.value && this._options.value.length) {
            const curArrowValue = this._options.value[0][this._currentParamName] || 'ASC';
            this._items?.getRecordById(this._currentParamName)?.set('value', curArrowValue);
            this._orders[this._currentParamName] = curArrowValue;
        }
    }

    private updateConfig(sortingParams: [ISortingParam], value: [object]|undefined): void {
        const data = [];

        if (value && value.length) {
            this._currentParamName = Object.keys(value[0])[0];
            this._orders[this._currentParamName] = value[0][this._currentParamName];
        } else {
            this._currentParamName = null;
        }
        sortingParams.forEach((item: ISortingParam) => {
            const dataElem = {...item, value: '', readOnly: false};
            const key = item.paramName;
            if (this._orders[key]) {
                dataElem.value = this._orders[key];
            }
            if (dataElem.paramName === this._currentParamName) {

                this._selectedKeys = [this._currentParamName];

                if (dataElem.icon) {
                    this._nocaption = true;
                    this._arrowIconStyle = dataElem.iconStyle || 'secondary';
                }
            }
            data.push(dataElem);
        });

        this._source = new Memory({data, keyProperty: 'id'});
    }

    private _resetValue(): void {
        this._notify('valueChanged', [[]]);
    }

    protected _dropdownItemClick(e: SyntheticEvent<Event>, key: number|string): boolean | void {
        if (key === null) {
            this._resetValue();
        } else {
            const order = this._orders[key] || 'ASC';
            this._setValue(key, key ? order : '');
        }
        this._children.dropdown.closeMenu();
        return false;
    }
    private _setValue(param: string | number, order: string): void {
        const newValue = [];
        newValue[0] = {};
        newValue[0][param] = order;
        this._notify('valueChanged', [newValue]);
    }

    protected _switchValue(): void {
        const newValue: string = this._orders[this._currentParamName] === 'ASC' ? 'DESC' : 'ASC';
        this._setValue(this._currentParamName, newValue);
    }

    protected _arrowClick(e: SyntheticEvent<Event>, item: Record): void {
        e.stopPropagation();
        const value = item.get('value') || 'ASC';
        const key = item.get('paramName');
        const newValue = SortingSelector._getOppositeOrder(value);
        // для хранения текущих значений стрелок в выпадающем списке используем _orders
        // но список строится ТОЛЬКО по source и record полученным из него
        // для того чтобы перерисовать стрелку в списке пишем еще в и рекорд
        item.set('value', newValue);
        this._orders[key] = newValue;
    }

    static _theme: string[] = ['Controls/grid', 'Controls/Classes'];

    protected static _getIconStyleFromTextStyle(fontStyle: string): string {
        let iconStyle: string;
        if (fontStyle === 'link') {
            iconStyle = 'secondary';
        } else {
            iconStyle = fontStyle || 'secondary';
        }

        return iconStyle;
    }

    protected static _isIconHover(iconStyle: string): boolean {
        let iconHover = false;
        if (iconStyle === 'secondary' || iconStyle === 'label') {
            iconHover = true;
        }
        return iconHover;
    }

    protected static _getOppositeOrder = (order: Order) => {
        if (order === 'DESC' || !order) {
            return 'ASC';
        }
        return 'DESC';
    }
}
/**
 * @typedef {Object} SortingParam
 * @property {String|null} paramName Имя поля элемента, по которому может осуществляться сортировка. Чтобы задать сброс сортировки, нужно указать значение null.
 * @property {String} title Подпись пункта меню, соответствующего данному полю.
 * @remark Если не задан пункт, сбрасывающий сортировку, то необходимо указать непустую конфигурацию сортировки в опции value.
 */

/**
 * @name Controls/grid:SortingSelector#sortingParams
 * @cfg {Array.<SortingParam>} Параметры сортировки.
 * @demo Controls-demo/grid/Sorting/SortingSelector/Default/Index
 * @demo Controls-demo/grid/Sorting/SortingSelector/SortingSelectorWithReset/Index
 * @demo Controls-demo/grid/Sorting/SortingSelector/Icons/Index
 * @example
 * В опцию передается массив вида
 * <pre class="brush: js;">
 * _sortingParam: null,
 * _beforeMount: function(options) {
 *    this._sortingParam = [
 *       {
 *          paramName: 'FirstParam',
 *          title: 'По первому параметру'
 *       },
 *       {
 *          paramName: 'SecondParam',
 *          title: 'По второму параметру'
 *       }
 *    ]
 * }
 * </pre>
 *
 * Чтобы дать возможность сброса сортировки, нужно добавить пункт со значением paramName = null.
 *
 *
 * <pre class="brush: js; highlight: [5]">
 * _sortingParam: null,
 * _beforeMount: function(options) {
 *    this._sortingParam = [
 *       {
 *          paramName: null,
 *          title: 'По умолчанию'
 *       },
 *       {
 *          paramName: 'Name',
 *          title: 'По имени'
 *       }
 *    ]
 * }
 * </pre>
 *
 * Чтобы отобразить иконки в выпадающем списке, нужно задать поля icon и iconSize. Выпадающий элемент так же отобразится в виде иконки
 *
 *
 * <pre class="brush: js; highlight: [5]">
 * _sortingParam: null,
 * _beforeMount: function(options) {
 *    this._sortingParam = [
 *       {
 *          paramName: null,
 *          title: 'По умолчанию',
 *          icon: 'icon-Attach',
 *          iconSize: 's'
 *       },
 *       {
 *          paramName: 'Name',
 *          title: 'По имени',
 *          icon: 'icon-1c',
 *          iconSize: 's'
 *       }
 *    ]
 * }
 * </pre>
 */
/**
 * @name Controls/grid:SortingSelector#value
 * @cfg {Array.<Object>} Конфигурация сортировки.
 * @remark Если нет возможности сброса сортировки, то опция value должна содержать данные для сортировки.
 * @example
 * <pre class="brush: js;">
 * _sortingValue: null,
 * _sortingParam: null,
 * _beforeMount: function(options) {
 *    this._sortingParam = [
 *       {
 *          paramName: 'Name',
 *          title: 'По имени'
 *       },
 *       {
 *          paramName: 'Surname',
 *          title: 'По фамилии'
 *       }
 *    ]
 *    this._sortingValue = [
 *       {
 *          Name: 'DESC'
 *       }
 *    ];
 * }
 * </pre>
 *
 * Следует использовать директиву bind для опции value.
 *
 * <pre class="brush: html; highlight: [2,4]">
 * <Controls.grid:SortingSelector
 *   bind:value="_sortingValue"
 *   sortingParams="{{_sortingParam}}" />
 * </pre>
 */

/**
 * @name Controls/grid:SortingSelector#header
 * @cfg {String} Заголовок для выпадающего списка сортировки.
 * @remark Если заголовок не требуется, опцию можно не указывать.
 * @demo Controls-demo/grid/Sorting/SortingSelector/SortingSelectorWithHeader/Index
 */
export default SortingSelector;
