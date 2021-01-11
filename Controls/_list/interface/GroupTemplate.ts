/**
 * Шаблон, который по умолчанию используется для отображения заголовка {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группы} в {@link Controls/list:View плоских списках}.
 *
 * @class Controls/_list/interface/GroupTemplate
 * @mixes Controls/list:IBaseGroupTemplate
 * @author Авраменко А.С.
 * @see Controls/interface/IGroupedGrid#groupTemplate
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html">
 * <Controls.list:View>
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/list:GroupTemplate"
 *          separatorVisibility="{{ false }}"
 *          expanderVisible="{{ false }}"
 *          textAlign="left"
 *          fontSize="xs"
 *          iconSize="m"
 *          scope="{{groupTemplate}}">
 *          <ws:contentTemplate>
 *             <ws:if data="{{contentTemplate.itemData.item === 'nonexclusive'}}">Неисключительные права</ws:if>
 *             <ws:if data="{{contentTemplate.itemData.item === 'works'}}">Работы</ws:if>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.list:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ здесь}.
 * @public
 */

