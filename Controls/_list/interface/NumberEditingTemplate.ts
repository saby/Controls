import {INumberOptions} from 'Controls/decorator';
import IEditingTemplateOptions from './EditingTemplate'

/**
 * Шаблон для {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования по месту} числовых полей в {@link Controls/list:View плоских списках}.
 * В режиме чтения выводит значение с помощью {@link Controls/decorator:Number}.
 * 
 * @class Controls/_list/interface/NumberEditingTemplate
 * @mixes Controls/list:EditingTemplate
 * @author Авраменко А.С.
 * @see Controls/list:View
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [6-10]">
 * <!-- WML -->
 * <Controls.list:View source="{{_viewSource}}">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/list:ItemTemplate" scope="{{itemTemplate}}">
 *          <ws:contentTemplate>
 *              <ws:partial template="Controls/list:NumberEditingTemplate" value="{{ item.contents.count }}" enabled="{{true}}">
 *                  <ws:editorTemplate>
 *                      <Controls.input:Number bind:value="contentTemplate.item.contents.count" selectOnClick="{{ false }}" />
 *                  </ws:editorTemplate>
 *              </ws:partial>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.list:View>
 * </pre>
 * @public
 */
export default interface INumberEditingTemplateOptions extends INumberOptions, IEditingTemplateOptions {
    readonly '[Controls/_list/interface/INumberEditingTemplateOptions]': boolean;
};
