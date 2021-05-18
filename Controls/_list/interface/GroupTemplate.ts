/**
 * Шаблон, который по умолчанию используется для отображения заголовка {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группы} в {@link Controls/list:View плоских списках} и {@link Controls/tile:View плитке}.
 *
 * @class Controls/_list/interface/GroupTemplate
 * @mixes Controls/list:IBaseGroupTemplate
 * @author Авраменко А.С.
 * @see Controls/interface/IGroupedList#groupTemplate
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [3-16]">
 * <!-- WML -->
 * <Controls.list:View source="{{_viewSource}}">
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/list:GroupTemplate"
 *          separatorVisibility="{{ false }}"
 *          expanderVisible="{{ false }}"
 *          textAlign="left"
 *          fontSize="xs"
 *          iconSize="m"
 *          scope="{{groupTemplate}}">
 *          <ws:contentTemplate>
 *             <ws:if data="{{contentTemplate.item.contents === 'nonexclusive'}}">Неисключительные права</ws:if>
 *             <ws:if data="{{contentTemplate.item.contents === 'works'}}">Работы</ws:if>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.list:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/visual/ здесь}.
 * @public
 */

