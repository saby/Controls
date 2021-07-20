import rk = require('i18n!Controls');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_dropdown/Toggle/Toggle');
import {Memory} from 'Types/source';
import 'css!Controls/dropdown';

interface IToggleOptions extends IControlOptions {
    selectedKeys: boolean[];
}

const items = [
    {key: true, title: rk('Да'), icon: 'icon-Successfully', iconStyle: 'success'},
    {key: false, title: rk('Нет'), icon: 'icon-Decline', iconStyle: 'danger'}
];

/**
 * Контрол, позволяющий выбрать значение из списка. Отображается в виде выпадающего списка с тремя значениями: "Да", "Нет" и "Не выбрано".
 * @remark
 * Меню можно открыть кликом на контрол. Для работы единичным параметром selectedKeys используйте контрол с {@link Controls/source:SelectedKey}.
 *
 * @extends UI/Base:Control
 * @mixes Controls/interface:IMultiSelectable
 * @demo Controls-demo/dropdown_new/Toggle/Index
 *
 * @public
 * @author Золотова Э.Е.
 */
export default class Toggle extends Control<IToggleOptions> {
    protected _template: TemplateFunction = template;
    protected _source: Memory;
    protected _selectedKeys: boolean[];

    _beforeMount(options: IToggleOptions): void {
        this._selectedKeys = options.selectedKeys || [null];
        this._source = new Memory({
            data: items,
            keyProperty: 'key'
        });
    }
}
