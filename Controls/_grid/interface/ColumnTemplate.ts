/**
 * @typedef {String} TCursor
 * @description Значения для типа курсора, отображаемого при наведении на ячейку.
 * @variant default Стандартный указатель (стрелка).
 * @variant pointer Указатель.
 */
export type TCursor = 'default' | 'pointer' | 'right';

/**
 * Шаблон, который по умолчанию используется для отображения ячеек в контроле {@link Controls/grid:View Таблица}.
 * 
 * @class Controls/grid:ColumnTemplate
 * @author Авраменко А.С.
 * @see Controls/_grid/interface/IGridControl/Column.typedef
 * @see Controls/grid:IGridControl#columns
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/templates/column/ здесь}.
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html">
 * <Controls.grid:View>
 *    <ws:columns>
 *       <ws:Array>
 *          <ws:Object displayProperty="name">
 *             <ws:template>
 *                <ws:partial template="Controls/grid:ColumnTemplate">
 *                   <ws:contentTemplate>
 *                      <div title="{{contentTemplate.itemData.item.name}}">
 *                         {{contentTemplate.itemData.item.name}}
 *                      </div>
 *                   </ws:contentTemplate>
 *                </ws:partial>
 *             </ws:template>
 *          </ws:Object>
 *       </ws:Array>
 *    </ws:columns>
 * </Controls.grid:View>
 * </pre>
 * @public
 */

 export default interface IColumnTemplateOptions {
   /**
    * @name Controls/grid:ColumnTemplate#contentTemplate
    * @cfg {String|Function} Пользовательский шаблон для отображения содержимого ячейки.
    * @see Controls/grid:IGridControl#showEditArrow
    * @remark
    * В области видимости шаблона доступен объект **itemData** со следующими свойствами:
    *
    * * **columnIndex** — порядковый номер колонки. Отсчет от 0.
    * * **index** — порядковый номер строки. Отсчет от 0.
    * * **isEditing** (тип Boolean) — признак {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/edit/ редактирования по месту}.
    * * **item** (тип {@link Types/entity:Record}) — элемент, данные которого отображаются в колонке.
    * * **column** (тип {@link Controls/grid:IColumn IColumn}) — объект с конфигурацией колонки.
    *
    * Также в области видимости шаблона есть переменная **editArrowTemplate**, которая позволяет отобразить {@link Controls/grid:IGridControl#showEditArrow стрелку-шеврон}. Такой шаблон достаточно встроить в нужное место contentTemplate с помощью директивы {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial}. Работа с переменной показана в примере № 4.
    * @example
    * **Пример 1.** Шаблон и контрол сконфигурированы в одном WML-файле.
    * <pre class="brush: html">
    * <Controls.grid:View>
    *    <ws:columns>
    *       <ws:Array>
    *          <ws:Object displayProperty="Name">
    *             <ws:template>
    *                <ws:partial template="Controls/grid:ColumnTemplate">
    *                   <ws:contentTemplate>
    *                      <div title="{{contentTemplate.itemData.item.Name}}">
    *                         {{contentTemplate.itemData.item.Name}}
    *                      </div>
    *                   </ws:contentTemplate>
    *                </ws:partial>
    *             </ws:template>
    *          </ws:Object>
    *       </ws:Array>
    *    </ws:columns>
    * </Controls.grid:View>
    * </pre>
    *
    * **Пример 2.** Контрол и шаблоны сконфигурированы в отдельных WML-файлах.
    * <pre class="brush: html">
    * <!-- file1.wml -->
    * <Controls.grid:View>
    *    <ws:columns>
    *       <ws:Array>
    *          <ws:Object displayProperty="Name">
    *             <ws:template>
    *                <ws:partial template="wml!file2" scope="{{template}}"/>
    *             </ws:template>
    *          </ws:Object>
    *       </ws:Array>
    *    </ws:columns>
    * </Controls.grid:View>
    * </pre>
    *
    * <pre class="brush: html">
    * <!-- file2.wml -->
    * <ws:partial template="Controls/grid:ColumnTemplate">
    *    <ws:contentTemplate>
    *       <div>{{contentTemplate.itemData.item.Name}}</div>
    *    </ws:contentTemplate>
    * </ws:partial>
    * </pre>
    *
    * **Пример 3.** Шаблон contentTemplate сконфигурирован в отдельном WML-файле.
    *
    * <pre class="brush: html">
    * <Controls.grid:View>
    *    <ws:columns>
    *       <ws:Array>
    *          <ws:Object displayProperty="Name">
    *             <ws:template>
    *                <ws:partial template="Controls/grid:ColumnTemplate">
    *                   <ws:contentTemplate>
    *                      <ws:partial template="wml!file2" scope="{{contentTemplate}}"/>
    *                   </ws:contentTemplate>
    *                </ws:partial>
    *             </ws:template>
    *          </ws:Object>
    *       </ws:Array>
    *    </ws:columns>
    * </Controls.grid:View>
    * </pre>
    *
    * <pre class="brush: html">
    * <!-- file2.wml -->
    * <div title="{{contentTemplate.itemData.item.Name}}">
    *    {{contentTemplate.itemData.item.Name}}
    * </div>
    * </pre>
    *
    * **Пример 4.** Следующий пример настраивает контрол так, что для первой колонки задан пользовательский шаблон. При этом добавлено отображение стрелки-шеврона.
    * <pre class="brush: html">
    * <Controls.grid:View>
    *    <ws:columns>
    *       <ws:Array>
    *          <ws:Object displayProperty="name">
    *             <ws:template>
    *                <ws:partial template="Controls/grid:ColumnTemplate">
    *                   <ws:contentTemplate>
    *                      <div title="{{contentTemplate.itemData.item.name}}">
    *                         {{contentTemplate.itemData.item.name}}
    *                      </div>
    *                      <ws:partial template="{{contentTemplate.editArrowTemplate}}"/>
    *                   </ws:contentTemplate>
    *                </ws:partial>
    *             </ws:template>
    *          </ws:Object>
    *       </ws:Array>
    *    </ws:columns>
    * </Controls.grid:View>
    * </pre>
    */
   contentTemplate?: string;

    /**
     * @name Controls/grid:ColumnTemplate#cursor
     * @cfg {TCursor} Тип {@link https://developer.mozilla.org/ru/docs/Web/CSS/cursor курсора}, когда он находится в пределах ячейки.
     * @default pointer
     */
    cursor?: TCursor;
}

    /**
     * @name Controls/grid:ColumnTemplate#tagStyle
     * @cfg {String} Позволяет задать стиль для цветных индикаторов в ячейке.
     * @variant info
     * @variant danger
     * @variant primary
     * @variant success
     * @variant warning
     * @variant secondary
     */