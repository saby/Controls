/**
 * @typedef {String} TCursor
 * @description Значения для типа курсора, отображаемого при наведении на ячейку.
 * @variant default Стандартный указатель (стрелка).
 * @variant pointer Указатель.
 */
export type TCursor = 'default' | 'pointer' | 'right';

/**
 * @typedef {String} TMarkerClassName
 * @variant default Маркер по высоте растягивается на весь контейнер записи.
 * @variant image-l Используется для размещения маркера рядом с изображением размера "l".
 * @variant image-m Используется для размещения маркера рядом с изображением размера "m".
 * @variant image-s Используется для размещения маркера рядом с изображением размера "s".
 * @variant image-xs Используется для размещения маркера рядом с изображением размера "xs".
 * @variant text-2xl Используется для размещения маркера рядом с текстом размера "2xl".
 * @variant text-xl Используется для размещения маркера рядом с текстом размера "xl".
 * @variant text-l Используется для размещения маркера рядом с текстом размера "l".
 * @variant text-m Используется для размещения маркера рядом с текстом размера "m".
 * @variant text-xs Используется для размещения маркера рядом с текстом размера "xs".
 */
export type TMarkerClassName = 'default' | 'image-l' | 'image-m' | 'image-s' | 'image-xl' |
    'text-2xl' | 'text-xl' | 'text-l' | 'text-m' | 'text-xs';

/**
 * Шаблон, который по умолчанию используется для отображения ячеек в контроле {@link Controls/grid:View Таблица}.
 *
 * @class Controls/_grid/interface/ColumnTemplate
 * @author Авраменко А.С.
 * 
 * @see Controls/_grid/interface/IGridControl/Column.typedef
 * @see Controls/grid:IGridControl#columns
 * 
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/columns/template/#_2 здесь}.
 * 
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [6,7,8,9,10,11,12]">
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
    * @name Controls/_grid/interface/ColumnTemplate#contentTemplate
    * @cfg {String|Function} Пользовательский шаблон для отображения содержимого ячейки.
    * @see Controls/grid:IGridControl#showEditArrow
    * @remark
    * В области видимости шаблона доступны переменные **itemData**, **editArrowTemplate** и **expanderTemplate**.
    *
    * Переменная **itemData** позволяет получить доступ к следующими свойствам:
    *
    * * **columnIndex** — порядковый номер колонки. Отсчет от 0.
    * * **index** — порядковый номер строки. Отсчет от 0.
    * * **isEditing()** — возвращает true, если для записи выполняется {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/edit/ редактирование по месту}.
    * * **item** (тип {@link Types/entity:Record}) — элемент, данные которого отображаются в колонке.
    * * **column** (тип {@link Controls/grid:IColumn IColumn}) — объект с конфигурацией колонки.
    *
    * Переменная **editArrowTemplate** позволяет отобразить {@link Controls/grid:IGridControl#showEditArrow стрелку-шеврон} в прикладном шаблоне для первой колонки. Переменную достаточно встроить в нужное место contentTemplate с помощью директивы {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial}, как это показано в примере № 4.
    *
    * Переменная **expanderTemplate** доступна только, если шаблон используется в контроле {@link Controls/treeGrid:View}. С помощью переменной можно отобразить кнопку раскрытия узла в произвольном месте элемента. При этом опцию {@link Controls/treeGrid:View#expanderPosition expanderPosition} необходимо установить в значение custom. Переменную expanderTemplate достаточно встроить в нужное место contentTemplate с помощью директивы {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial}, как это показано в примере № 5.
    * @example
    * **Пример 1.** Шаблон и контрол сконфигурированы в одном WML-файле.
    * <pre class="brush: html; highlight: [6,7,8,9,10,11,12]">
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
    * <pre class="brush: html; highlight: [7]">
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
    * <pre class="brush: html; highlight: [8]">
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
    * **Пример 4.** Следующий пример настраивает контрол так, что для первой колонки задан пользовательский шаблон. При этом добавлено отображение {@link Controls/grid:IGridControl#showEditArrow стрелки-шеврона}.
    * <pre class="brush: html; highlight: [11]">
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
    *
    * **Пример 5.** Следующий пример настраивает контрол так, что для первой колонки задан пользовательский шаблон. При этом добавлено отображение кнопки раскрытия узла.
    * <pre class="brush: html; highlight: [1,13]">
    * <Controls.treeGrid:View expanderPosition="custom">
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
     * @name Controls/_grid/interface/ColumnTemplate#cursor
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
     * @name Controls/_grid/interface/ColumnTemplate#backgroundColorStyle
     * @cfg {backgroundColorStyle} Стиль фона ячейки.
     */
    backgroundColorStyle?: string;

    /**
     * @name Controls/_grid/interface/ColumnTemplate#tagStyle
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
     * @name Controls/_grid/interface/ColumnTemplate#expanderTemplate
     * @cfg {Function} Шаблон позволяет отобразить иконку для узла. Такой шаблон достаточно встроить в нужное место contentTemplate с помощью директивы {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial}.
     */
    expanderTemplate?: Function;

    /**
     * @name Controls/_grid/interface/ColumnTemplate#markerClassName
     * @cfg {TMarkerClassName} Размер маркера.
     * @default default
     */
    markerClassName?: TMarkerClassName;
}
