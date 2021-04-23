/**
 * Списочный контрол, который позволяет расположить записи в нескольких столбцах в зависимости от доступной ширины.
 *
 * @remark
 * Переменные тем оформления:
 * * {@link https://github.com/saby/wasaby-controls/blob/6156a9009ee88d96bf73c8b1200e197f9db1c3c8/Controls-default-theme/variables/_columns.less набор переменных columns}
 * * {@link https://github.com/saby/wasaby-controls/blob/6156a9009ee88d96bf73c8b1200e197f9db1c3c8/Controls-default-theme/variables/_list.less набор переменных list}
 *
 * @class Controls/columns:View
 * @extends UI/Base:Control
 * @implements Controls/interface:IErrorController
 * @implements Controls/list:IListNavigation
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/list:IList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/interface:ISorting
 * @mixes Controls/interface:IDraggable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/list:IClickableView
 * @mixes Controls/list:IReloadableList
 * @mixes Controls/list:IMovableList
 * @mixes Controls/list:IRemovableList
 * @mixes Controls/list:IVirtualScrollConfig
 * @mixes Controls/marker:IMarkerList
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
 *         <ws:partial template="Controls/columns:ItemTemplate">
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
