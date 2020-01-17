/**
 * Шаблон, который по умолчанию используется для отображения горизонтальной линии-разделителя {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/grouping/ группы} в контроле {@link Controls/grid:View Таблица}.
 * @class Controls/grid:GroupTemplate
 * @mixes Controls/list:BaseGroupTemplate
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
 * Дополнительно о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/templates/grouping/ здесь}.
 * @public
 */

/**
 * @name Controls/grid:GroupTemplate#columnAlignGroup
 * @cfg {Number|undefined} Устанавливает номер колонки, относительно которой происходит горизонтальное выравнивание заголовка группы.
 * @default undefined
 * @remark
 * В значении undefined выравнивание отключено.
 */

export default interface IGroupTemplateOptions {
   columnAlignGroup?: number;
}