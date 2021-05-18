import {TMarkerClassName} from 'Controls/display';

/**
 * @typedef {String} TCursor
 * @description Значения для типа курсора, отображаемого при наведении на ячейку.
 * @variant default Стандартный указатель (стрелка).
 * @variant pointer Указатель.
 */
export type TCursor = 'default' | 'pointer' | 'right';

/**
 * Шаблон, который по умолчанию используется для отображения ячеек в {@link Controls/grid:View таблице}.
 *
 * @class Controls/_gridOld/interface/ColumnTemplate
 * @author Авраменко А.С.
 *
 * @see Controls/_interface/grid/IGridControl/Column.typedef
 * @see Controls/grid:IGridControl#columns
 *
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grid/columns/template/#_2 здесь}.
 *
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [7-13]">
 * <!-- WML -->
 * <Controls.grid:View source="{{_viewSource}}">
 *    <ws:columns>
 *       <ws:Array>
 *          <ws:Object displayProperty="name">
 *             <ws:template>
 *                <ws:partial template="Controls/grid:ColumnTemplate">
 *                   <ws:contentTemplate>
 *                      <div title="{{contentTemplate.item.contents.name}}">
 *                         {{contentTemplate.item.contents.name}}
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
    * @cfg {String|TemplateFunction} Пользовательский шаблон для отображения содержимого ячейки.
    * @see Controls/grid:IGridControl#showEditArrow
    * @markdown
    * @remark
    * В области видимости шаблона доступны переменные **itemData**, **editArrowTemplate** и **expanderTemplate**.
    *
    * Переменная **itemData** позволяет получить доступ к следующими свойствам:
    *
    * * **columnIndex** — порядковый номер колонки. Отсчет от 0.
    * * **index** — порядковый номер строки. Отсчет от 0.
    * * **isEditing()** — возвращает true, если для записи выполняется {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование по месту}.
    * * **item** (тип {@link Types/entity:Record}) — элемент, данные которого отображаются в колонке.
    * * **column.config** (тип {@link Controls/interface:IColumn IColumn}) — объект с конфигурацией колонки.
    *
    * Переменная **editArrowTemplate** позволяет отобразить {@link Controls/grid:IGridControl#showEditArrow стрелку-шеврон} в прикладном шаблоне для первой колонки. Переменную достаточно встроить в нужное место contentTemplate с помощью директивы {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial}, как это показано в примере № 4.
    *
    * Переменная **expanderTemplate** доступна только, если шаблон используется в контроле {@link Controls/treeGrid:View}. С помощью переменной можно отобразить кнопку раскрытия узла в произвольном месте элемента. При этом опцию {@link Controls/treeGrid:View#expanderPosition expanderPosition} необходимо установить в значение custom. Переменную expanderTemplate достаточно встроить в нужное место contentTemplate с помощью директивы {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial}, как это показано в примере № 5.
    * @example
    * **Пример 1.** Шаблон и контрол сконфигурированы в одном WML-файле.
    * <pre class="brush: html; highlight: [7-13]">
    * <!-- WML -->
    * <Controls.grid:View source="{{_viewSource}}">
    *    <ws:columns>
    *       <ws:Array>
    *          <ws:Object displayProperty="Name">
    *             <ws:template>
    *                <ws:partial template="Controls/grid:ColumnTemplate">
    *                   <ws:contentTemplate>
    *                      <div title="{{contentTemplate.item.contents.Name}}">
    *                         {{contentTemplate.item.contents.Name}}
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
    * <pre class="brush: html; highlight: [7]">
    * <!-- file1.wml -->
    * <Controls.grid:View source="{{_viewSource}}">
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
    *       <div>{{contentTemplate.item.contents.Name}}</div>
    *    </ws:contentTemplate>
    * </ws:partial>
    * </pre>
    *
    * **Пример 3.** Шаблон contentTemplate сконфигурирован в отдельном WML-файле.
    *
    * <pre class="brush: html; highlight: [9]">
    * <!-- file1.wml -->
    * <Controls.grid:View source="{{_viewSource}}">
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
    * <div title="{{contentTemplate.item.contents.Name}}">
    *    {{contentTemplate.item.contents.Name}}
    * </div>
    * </pre>
    *
    * **Пример 4.** Следующий пример настраивает контрол так, что для первой колонки задан пользовательский шаблон. При этом добавлено отображение {@link Controls/grid:IGridControl#showEditArrow стрелки-шеврона}.
    * <pre class="brush: html; highlight: [11]">
    * <Controls.grid:View source="{{_viewSource}}">
    *    <ws:columns>
    *       <ws:Array>
    *          <ws:Object displayProperty="name">
    *             <ws:template>
    *                <ws:partial template="Controls/grid:ColumnTemplate">
    *                   <ws:contentTemplate>
    *                      <div title="{{contentTemplate.item.contents.name}}">
    *                         {{contentTemplate.item.contents.name}}
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
    *
    * **Пример 5.** Следующий пример настраивает контрол так, что для первой колонки задан пользовательский шаблон. При этом добавлено отображение кнопки раскрытия узла.
    * <pre class="brush: html; highlight: [1,13]">
    * <Controls.treeGrid:View source="{{_viewSource}}" nodeProperty="type" parentProperty="parent" expanderPosition="custom">
    *    <ws:itemTemplate>
    *       <ws:partial template="Controls/treeGrid:ItemTemplate" />
    *    </ws:itemTemplate>
    *    <ws:columns>
    *       <ws:Array>
    *          ...
    *          <ws:Object>
    *             <ws:template>
    *                <ws:partial template="Controls/grid:ColumnTemplate">
    *                   <ws:contentTemplate>
    *                      ...
    *                      <ws:partial template="{{ contentTemplate.expanderTemplate }}" scope="{{ contentTemplate }}"/>
    *                   </ws:contentTemplate>
    *                </ws:partial>
    *             </ws:template>
    *          </ws:Object>
    *       </ws:Array>
    *    </ws:columns>
    * </Controls.treeGrid:View>
    * </pre>
    */
   contentTemplate?: string;

    /**
     * @cfg {TCursor} Тип {@link https://developer.mozilla.org/ru/docs/Web/CSS/cursor курсора}, когда он находится в пределах ячейки.
     * @default pointer
     */
    cursor?: TCursor;

    /**
     * @typedef {String} backgroundColorStyle
     * @variant danger
     * @variant success
     * @variant warning
     * @variant primary
     * @variant secondary
     * @variant unaccented
     * @variant readonly
     */
    /**
     * @cfg {backgroundColorStyle} Стиль фона ячейки.
     */
    backgroundColorStyle?: string;

    /**
     * @cfg {String} Позволяет задать стиль для цветных индикаторов в ячейке.
     * @variant info
     * @variant danger
     * @variant primary
     * @variant success
     * @variant warning
     * @variant secondary
     */
    tagStyle?: 'info' | 'danger' | 'primary' | 'success' | 'secondary';

    /**
     * @cfg {Controls/_display/interface/IMarkable/TMarkerClassName.typedef} Размер маркера.
     * @default default
     */
    markerClassName?: TMarkerClassName;
}
