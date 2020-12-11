/**
 * Шаблон, который по умолчанию используется для отображения горизонтальной линии-разделителя {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группы} в контроле {@link Controls/grid:View Таблица}.
 * 
 * @class Controls/_grid/interface/GroupTemplate
 * @mixes Controls/_grid/interface/BaseGroupTemplate
 * @author Авраменко А.С.
 * @see Controls/interface/IGroupedGrid#groupTemplate
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html">
 * <Controls.grid:View>
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/grid:GroupTemplate" expanderVisible="{{ false }}" scope="{{ groupTemplate }}">
 *          <ws:contentTemplate>
 *             <ws:if data="{{contentTemplate.itemData.item === 'tasks'}}">Задачи</ws:if>
 *             <ws:if data="{{contentTemplate.itemData.item === 'error'}}">Ошибки</ws:if>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.grid:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ здесь}.
 * @public
 */
export default interface IGroupTemplateOptions {
   /**
    * @name Controls/_grid/interface/GroupTemplate#columnAlignGroup
    * @cfg {Number|undefined} Номер колонки, относительно которой происходит горизонтальное выравнивание заголовка группы.
    * @default undefined
    * @remark
    * В значении undefined выравнивание отключено.
    */
   columnAlignGroup?: number;
}