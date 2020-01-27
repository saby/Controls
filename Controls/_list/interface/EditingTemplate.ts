/**
 * Шаблон, который по умолчанию используется для {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/edit/ редактирования по месту} в {@link Controls/list:View плоских списках}.
 * @class Controls/list:EditingTemplate
 * @author Авраменко А.С.
 * @see Controls/list:View
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [5,6,7,8,9,10,11,12,13,14,15,16]">
 * <Controls.list:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/list:ItemTemplate" scope="{{itemTemplate}}">
 *          <ws:contentTemplate>
 *             <ws:partial template="Controls/list:EditingTemplate" value="{{ contentTemplate.itemData.item.title }}" enabled="{{ true }}">
 *                <ws:editorTemplate>
 *                   <Controls.validate:InputContainer>
 *                      <ws:validators>
 *                         <ws:Function value="{{ contentTemplate.itemData.item.title }}">Controls/validate:isRequired</ws:Function>
 *                      </ws:validators>
 *                      <ws:content>
 *                         <Controls.input:Text bind:value="contentTemplate.itemData.item.title" selectOnClick="{{ false }}" />
 *                      </ws:content>
 *                   </Controls.validate:InputContainer>
 *                </ws:editorTemplate>
 *             </ws:partial>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.list:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/edit/#manual здесь}.
 * @public
 */

export default interface IEditingTemplateOptions {
    /**
     * @name Controls/list:EditingTemplate#editorTemplate
     * @cfg {String|Function} Устанавливает шаблон, отображаемый поверх элемента в режиме редактирования. 
     */
    editorTemplate?: string;
    /**
     * @name Controls/list:EditingTemplate#enabled
     * @cfg {Boolean} Когда опция задана в значение true, при наведении курсора мыши на элемент в режиме редактирования будет выделяться фон у контрола-редактора.
     * @default false
     * @see editorTemplate
     */
    enabled?: boolean;
    /**
     * @name Controls/list:EditingTemplate#value
     * @cfg {String} Устанавливает текст, отображаемый внутри элемента в режиме просмотра.
     */
    value?: string;
    /**
     * @typedef {String} Size
     * @variant default Размер, используемый по умолчанию.
     * @variant s Маленький размер.
     * @variant m Средний размер.
     * @variant l Большой размер.
     */ 

    /**
     * @name Controls/list:EditingTemplate#size
     * @cfg {Size} Устанавливает размер шрифта для {@link Controls/list:EditingTemplate#value текста}, который отображается внутри элемента в режиме просмотра. 
     * @default default
     * @see Controls/list:EditingTemplate#value
     * @remark
     * Каждому значению опции соответствует размер в px. Он зависит от {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     */
    size?: string;
 }
 