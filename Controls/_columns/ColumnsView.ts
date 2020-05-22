/**
 * Списочный контрол, который позволяет расположить записи в нескольких столбцах в зависимости от доступной ширины.
 * 
 * @remark
 * Переменные тем оформления:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_columns.less">набор переменных columns</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">набор переменных list</a>
 * 
 * @class Controls/columns:View
 * @extends Core/Control
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