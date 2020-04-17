/**
 * Списочный контрол, который позволяет расположить записи в нескольких столбцах в зависимости от доступной ширины.
 *
 * @class Controls/columns:View
 * @extends Core/Control
 * @author Авраменко А.С.
 * @public
 */

/**
 * @name Controls/columns:View#columnMinWidth
 * @cfg {Number} Минимальная ширина колонки. 
 * @default 270 
 */

/**
 * @name Controls/columns:View#columnMaxWidth
 * @cfg {Number} Максимальная ширина колонки. 
 * @default 400
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