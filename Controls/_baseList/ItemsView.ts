// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_baseList/ItemsView';
import {EventUtils} from 'UI/Events';
import {RecordSet} from 'Types/collection';
import {default as BaseControl} from 'Controls/_baseList/BaseControl';
import * as ListView from 'Controls/_baseList/ListView';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';

export interface IItemsViewOptions extends IControlOptions {
    /**
     * @name Controls/_list/IItemsView#items
     * @cfg {Types/collection:RecordSet} Список записей, данные которого нужно отобразить в списке.
     */
    items?: RecordSet;
}

/**
 * Интерфейс, описывающий структуру объекта конфигурации контрола {@link Controls/list:ItemsView}.
 * @interface Controls/_list/IItemsView
 * @public
 * @author Уфимцев Д.Ю.
 */

/**
 * Контрол плоского {@link /doc/platform/developmentapl/interface-development/controls/list/list/ списка}, который умеет работать без {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}.
 * В качестве данных ожидает {@link Types/collection:RecordSet} переданный в опцию {@link Controls/list:IItemsView#items items}.
 *
 * @demo Controls-demo/list_new/ItemsView/Base/Index
 * @demo Controls-demo/list_new/ItemsView/Grouping/Index
 *
 * @class Controls/list:ItemsView
 * @extends UI/Base:Control
 * @implements Controls/list:IItemsView
 * @implements Controls/list:IVirtualScrollConfig
 * @implements Controls/list:IList
 * @implements Controls/list:IClickableView
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/interface/IGroupedList
 * @implements Controls/interface:IMultiSelectable
 * @implements Controls/marker:IMarkerList
 * @implements Controls/itemActions:IItemActions
 *
 * @public
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
