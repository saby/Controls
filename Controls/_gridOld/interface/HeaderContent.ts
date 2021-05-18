/**
 * Шаблон, который по умолчанию используется для отображения {@link /doc/platform/developmentapl/interface-development/controls/list/grid/header/ ячейки заголовка} в {@link Controls/grid:View таблице}.
 *  
 * @class Controls/_gridOld/interface/HeaderContent
 * @author Авраменко А.С.
 * @see Controls/grid:IGridControl/HeaderCell.typedef
 * @see Controls/grid:IGridControl#header
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grid/header/ здесь}.
 * @example
 * <pre class="brush: html; highlight: [7-12]">
 * <!-- WML -->
 * <Controls.grid:View source="{{_viewSource}}" columns="{{_columns}}">
 *    <ws:header>
 *       <ws:Array>
 *          <ws:Object>
 *             <ws:template>
 *                <ws:partial template="Controls/grid:HeaderContent"  scope="{{_options}}">
 *                   <ws:contentTemplate>
 *                      {{contentTemplate.column.config.title}}
 *                   </ws:contentTemplate>
 *                </ws:partial>
 *             </ws:template>
 *          </ws:Object>
 *       </ws:Array>
 *    </ws:header>
 * </Controls.grid:View>
 * </pre>
 * @public
 */
export default interface IHeaderContentOptions {
   /**
    * @cfg {String|TemplateFunction} Пользовательский шаблон для отображения содержимого ячейки шапки.
    * @remark
    * В области видимости шаблона доступен объект **column**. Через него можно получить доступ к свойству **config**, которое содержит конфигурацию {@link /docs/js/Controls/grid/IHeaderCell/ ячейки шапки}.
    * @example
    * **Пример 1.** Шаблон и контрол сконфигурированы в одном WML-файле.
    * <pre class="brush: html; highlight: [7-11]">
    * <!-- WML -->
    * <Controls.grid:View source="{{_viewSource}}" columns="{{_columns}}">
    *    <ws:header>
    *       <ws:Array>
    *          <ws:Object>
    *             <ws:template>
    *                <ws:partial template="Controls/grid:HeaderContent" scope="{{_options}}">
    *                   <ws:contentTemplate>
    *                      {{contentTemplate.column.config.title}}
    *                   </ws:contentTemplate>
    *                </ws:partial>
    *             </ws:template>
    *          </ws:Object>
    *       </ws:Array>
    *    </ws:header>
    * </Controls.grid:View>
    * </pre>
    * 
    * **Пример 2.** Контрол и шаблоны сконфигурированы в отдельных WML-файлах.
    * <pre class="brush: html">
    * <!-- file1.wml --> 
    * <Controls.grid:View source="{{_viewSource}}" columns="{{_columns}}">
    *    <ws:header>
    *       <ws:Array>
    *          <ws:Object>
    *             <ws:template>
    *                <ws:partial template="wml!file2" scope="{{template}}"/>
    *             </ws:template>
    *          </ws:Object>
    *       </ws:Array>
    *    </ws:header>
    * </Controls.grid:View>
    * </pre>
    * 
    * <pre class="brush: html">
    * <!-- file2.wml -->
    * <ws:partial template="Controls/grid:HeaderContent" scope="{{_options}}">
    *    <ws:contentTemplate>
    *       {{contentTemplate.column.config.title}}
    *    </ws:contentTemplate>
    * </ws:partial>
    * </pre>
    * 
    * **Пример 3.** Шаблон contentTemplate сконфигурирован в отдельном WML-файле.
    * 
    * <pre class="brush: html">
    * <!-- file1.wml --> 
    * <Controls.grid:View source="{{_viewSource}}" columns="{{_columns}}">
    *    <ws:header>
    *       <ws:Array>
    *          <ws:Object>
    *             <ws:template>
    *                <ws:partial template="Controls/grid:HeaderContent" scope="{{_options}}">
    *                   <ws:contentTemplate>
    *                      <ws:partial template="wml!file2" scope="{{contentTemplate}}"/>
    *                   </ws:contentTemplate>
    *                </ws:partial>
    *             </ws:template>
    *          </ws:Object>
    *       </ws:Array>
    *    </ws:header>
    * </Controls.grid:View>
    * </pre>
    * 
    * <pre class="brush: html">
    * <!-- file2.wml -->
    * {{contentTemplate.column.config.title}}
    * </pre>
    */
   contentTemplate?: string;
}