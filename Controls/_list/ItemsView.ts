// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_list/ItemsView';
import {RecordSet} from 'Types/collection';
import {default as BaseControl} from 'Controls/_list/BaseControl';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';

/**
 * Опции для контрола {@link ItemsView}
 * @author Уфимцев Д.Ю.
 */
export interface IItemsViewOptions extends IControlOptions {
    /**
     * @cfg Список записей данные которого нужно отобразить в списке
     */
    items?: RecordSet;
}

/**
 * Контрол плоского списка, который умеет работать по {@link RecordSet}
 * @author Уфимцев Д.Ю.
 */
export default class ItemsView extends Control<IItemsViewOptions> {
    //region base control props
    protected _template: TemplateFunction = template;

    protected _children: {
        baseControl: BaseControl
    };
    //endregion
}
