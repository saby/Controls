// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_list/ItemsView';
import {EventUtils} from 'UI/Events';
import {RecordSet} from 'Types/collection';
import {default as BaseControl} from 'Controls/_list/BaseControl';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ListView = require('Controls/_list/ListView');

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
export default class ItemsView<TOptions extends IItemsViewOptions = IItemsViewOptions> extends Control<TOptions> {
    //region base control props
    protected _template: TemplateFunction = template;
    //endregion

    //region template props
    protected _viewTemplate: Function = BaseControl;

    protected _viewName: Function = ListView;

    protected _viewModelConstructor: string = 'Controls/display:Collection';
    //endregion

    //region helper props for the template
    /**
     * Обработчик который используется в шаблоне для проксирования событий логическому родителю.
     */
    protected _notifyHandler: typeof EventUtils.tmplNotify = EventUtils.tmplNotify;
    //endregion

    static defaultProps: object = {
        multiSelectVisibility: 'hidden',
        multiSelectPosition: 'default',
        stickyHeader: true,
        style: 'default'
    };
}
