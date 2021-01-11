import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import template = require('wml!Controls/_operations/MultiSelector/MultiSelector');
import {IMultiSelectableOptions} from 'Controls/interface';

export interface IMultiSelectorOptions extends IMultiSelectableOptions, IControlOptions {
    isAllSelected: boolean;
    selectedKeysCount: number | null;
}
/**
 * Контрол, отображающий чекбокс для массовой отметки записей и выпадающий список, позволяющий отмечать все записи, инвертировать, снимать с них отметку.
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/actions/operations/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_operations.less переменные тем оформления}
 *
 * @class Controls/_operations/MultiSelector
 * @extends UI/Base:Control
 *
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/operations/MultiSelector/Index
 */
class MultiSelector extends Control<IMultiSelectorOptions> {
    protected _template: TemplateFunction = template;
    static _theme: string[] = ['Controls/operations'];
}

export default MultiSelector;
