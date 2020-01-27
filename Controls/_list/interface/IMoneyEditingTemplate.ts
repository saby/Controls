/**
 * Шаблон для {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/edit/ редактирования по месту} денежных полей в {@link Controls/list:View плоских списках}.
 * В режиме чтения выводит значение с помощью {@link https://wi.sbis.ru/docs/js/Controls/decorator/Money/ Controls.decorator:Money}.
 * @class Controls/list:MoneyEditingTemplate
 * @mixes Controls/_list/interface/EditingTemplate
 * @author Авраменко А.С.
 * @see Controls/list:View
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [5,6,7,8,9]">
 * <Controls.list:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/list:ItemTemplate" scope="{{itemTemplate}}">
 *          <ws:contentTemplate>
 *              <ws:partial template="Controls/list:MoneyEditingTemplate" value="{{ itemData.item.price }}" enabled="{{true}}">
 *                  <ws:editorTemplate>
 *                      <Controls.input:Money bind:value="contentTemplate.itemData.item.price" selectOnClick="{{ false }}" />
 *                  </ws:editorTemplate>
 *              </ws:partial>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.list:View>
 * </pre>
 * @public
 */

import {IMoneyOptions} from 'Controls/decorator';
import IEditingTemplateOptions from './EditingTemplate'

export default interface IMoneyEditingTemplateOptions extends IEditingTemplateOptions, IMoneyOptions {
    readonly '[Controls/_list/interface/IMoneyEditingTemplate]': boolean;
};
