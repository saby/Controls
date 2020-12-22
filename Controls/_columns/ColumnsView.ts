/**
 * Списочный контрол, который позволяет расположить записи в нескольких столбцах в зависимости от доступной ширины.
 *
 * @remark
 * Переменные тем оформления:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_columns.less набор переменных columns}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less набор переменных list}
 *
 * @class Controls/columns:View
 * @extends Core/Control
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
 * @mixes Controls/_interface/IDraggable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_list/interface/IClickableView
 * @mixes Controls/_list/interface/IReloadableList
 * @mixes Controls/_list/interface/IMovableList
 * @mixes Controls/_list/interface/IRemovableList
 * @mixes Controls/_list/interface/IVirtualScrollConfig
 * @mixes Controls/_marker/interface/IMarkerList
 * @author Авраменко А.С.
 * @public
 * @example
 * Пример базовой конфигурации:
 * <pre class="brush: html;">
 * <Controls.columns:View
 *     keyProperty="id"
 *     useNewModel="{{true}}"
 *     source="{{_viewSource}}" />
 * </pre>
 * @demo Controls-demo/list_new/ColumnsView/Default/Index
 */

/**
 * @name Controls/columns:View#itemTemplate
 * @cfg {Number} Шаблон записи.
 * @example
 * <pre class="brush: html; highlight: [5,6,7,8,9,10,11]">
 * <Controls.columns:View
 *     keyProperty="id"
 *     useNewModel="{{true}}"
 *     source="{{_viewSource}}">
 *     <ws:itemTemplate>
 *         <ws:partial template="Controls/listRender:ColumnsItemTemplate">
 *             <ws:contentTemplate>
 *                 {{itemTemplate.item.getContents().get('title')}}
 *             </ws:contentTemplate>
 *         </ws:partial>
 *     </ws:itemTemplate>
 * </Controls.columns:View>
 * </pre>
 */

/**
 * @name Controls/columns:View#columnMinWidth
 * @cfg {Number} Минимальная ширина колонки.
 * @default 270
 * @example
 * <pre class="brush: html;">
 * <Controls.columns:View
 *     keyProperty="id"
 *     useNewModel="{{true}}"
 *     columnMinWidth="{{300}}"
 *     columnMaxWidth="{{500}}"
 *     source="{{ _viewSource }}"/>
 * </pre>
 * @see columnMaxWidth
 */

/**
 * @name Controls/columns:View#columnMaxWidth
 * @cfg {Number} Максимальная ширина колонки.
 * @default 400
 * @example
 * <pre class="brush: html;>
 * <Controls.columns:View
 *     keyProperty="id"
 *     useNewModel="{{true}}"
 *     columnMinWidth="{{300}}"
 *     columnMaxWidth="{{500}}"
 *     source="{{_viewSource}}"/>
 * </pre>
 * @see columnMinWidth
 */

/**
 * @name Controls/columns:View#initialWidth
 * @cfg {Number} Начальная ширина, которая будет использоваться для расчетов при первом построении.
 * @default undefined
 * @see columnsCount
 */

/**
 * @name Controls/columns:View#columnsCount
 * @cfg {Number} Используется для первого построения, если не задана опция {@link initialWidth}.
 * @default 2
 * @see initialWidth
 */

/**
 * @typedef {String} ColumnsMode
 * @variant auto Автоматическое распределение записей по колонкам.
 * @variant fixed Каждая запись располагается в заранее определенную колонку.
 */

 /**
 * @name Controls/columns:View#columnsMode
 * @cfg {ColumnsMode} Режим распределения записей по колонкам.
 * @default auto
 * @remark
 * Дополнительно необходимо задать значение для опции {@link columnProperty}, а также для каждого элемента данных в соответствующем поле указать номер колонки.
 */