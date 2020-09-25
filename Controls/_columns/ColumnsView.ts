/**
 * Списочный контрол, который позволяет расположить записи в нескольких столбцах в зависимости от доступной ширины.
 * 
 * @remark
 * Переменные тем оформления:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_columns.less">набор переменных columns</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">набор переменных list</a>
 * 
 * @class Controls/columns:View
 * @implements Controls/_interface/IErrorController
 * @implements Controls/_list/interface/IListNavigation
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/interface/IDraggable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_list/interface/IClickableView
 * @mixes Controls/_list/interface/IReloadableList
 * @mixes Controls/_list/interface/IMovableList
 * @mixes Controls/_list/interface/IRemovableList
 * @mixes Controls/_list/interface/IVirtualScroll
 * @author Авраменко А.С.
 * @public
 * @example
 * Пример базовой конфигурации:
 * <pre>
 * <Controls.columns:View
 *    keyProperty="id"
 *    useNewModel="{{true}}"
 *    source="{{ _viewSource }}">
 * </Controls.columns:View>
 * </pre>
 * 
 * @demo Controls-demo/list_new/ColumnsView/Default/Index
 */

/**
 * @name Controls/columns:View#itemTemplate
 * @cfg {Number} Шаблон записи. 
 * @example
 * <pre>
 * <Controls.columns:View
 *    keyProperty="id"
 *    useNewModel="{{true}}"
 *    source="{{ _viewSource }}">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/listRender:ColumnsItemTemplate">
 *          <ws:contentTemplate>
 *             {{itemTemplate.item.getContents().get('title')}}
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.columns:View>
 * </pre>
 */

/**
 * @name Controls/columns:View#columnMinWidth
 * @cfg {Number} Минимальная ширина колонки. 
 * @default 270 
 * @example
 * <pre>
 * <Controls.columns:View
 *    keyProperty="id"
 *    useNewModel="{{true}}"
 *    columnMinWidth="{{300}}"
 *    columnMaxWidth="{{500}}"
 *    source="{{ _viewSource }}">
 * </Controls.columns:View>
 * </pre>
 */

/**
 * @name Controls/columns:View#columnMaxWidth
 * @cfg {Number} Максимальная ширина колонки. 
 * @default 400
 * @example
 * <pre>
 * <Controls.columns:View
 *    keyProperty="id"
 *    useNewModel="{{true}}"
 *    columnMinWidth="{{300}}"
 *    columnMaxWidth="{{500}}"
 *    source="{{ _viewSource }}">
 * </Controls.columns:View>
 * </pre>
 */

/**
 * @name Controls/columns:View#initialWidth
 * @cfg {Number} Начальная ширина, которая будет использоваться для расчетов при первом построении.
 * @default undefined
 */

/**
 * @name Controls/columns:View#columnsCount
 * @cfg {Number} Используется для первого построения, если не задан параметр initialWidth.
 * @default 2
 */