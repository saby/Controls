import IEditingTemplateOptions from './EditingTemplate';

/**
 * Шаблон для {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования по месту} в {@link Controls/list:View плоских списках}, дающий возможность выводить пользовательский контент как в режиме редактирования, так и в режиме просмотра.
 * 
 * @class Controls/_list/interface/BaseEditingTemplate
 * @mixes Controls/list:EditingTemplate
 * @author Авраменко А.С.
 * @see Controls/list:View
 * @remark
 * Настройка viewTemplate приоритетнее `value`.
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [5,6,7,8,9,10,11,12]">
 * <Controls.list:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/list:ItemTemplate" scope="{{itemTemplate}}">
 *          <ws:contentTemplate>
 *              <ws:partial template="Controls/list:BaseEditingTemplate" value="{{ item.contents.price }}" enabled="{{true}}">
 *                  <ws:viewTemplate>
 *                      Total price: {{ _countTotalPrice() }}$
 *                  </ws:viewTemplate>
 *                  <ws:editorTemplate>
 *                      <Controls.input:Money bind:value="contentTemplate.item.contents.price" selectOnClick="{{ false }}" />
 *                  </ws:editorTemplate>
 *              </ws:partial>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.list:View>
 * </pre>
 * @public
 */
export default interface IBaseEditingTemplateOptions extends IEditingTemplateOptions {
    readonly '[Controls/_list/interface/IBaseEditingTemplateOptions]': boolean;
}
