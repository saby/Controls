/**
 * Шаблон, который по умолчанию используется для {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования по месту} в {@link Controls/list:View плоских списках}.
 *  
 * @class Controls/_list/interface/EditingTemplate
 * @author Авраменко А.С.
 * @see Controls/list:View
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [6-18]">
 * <!-- WML -->
 * <Controls.list:View source="{{_viewSource}}">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/list:ItemTemplate" scope="{{itemTemplate}}">
 *          <ws:contentTemplate>
 *             <ws:partial template="Controls/list:EditingTemplate" value="{{ contentTemplate.item.contents.title }}" enabled="{{ true }}">
 *                <ws:editorTemplate>
 *                   <Controls.validate:InputContainer>
 *                      <ws:validators>
 *                         <ws:Function value="{{ contentTemplate.item.contents.title }}">Controls/validate:isRequired</ws:Function>
 *                      </ws:validators>
 *                      <ws:content>
 *                         <Controls.input:Text bind:value="contentTemplate.item.contents.title" selectOnClick="{{ false }}" />
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
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/#manual здесь}.
 * @public
 */

export default interface IEditingTemplateOptions {
    /**
     * @name Controls/_list/interface/EditingTemplate#editorTemplate
     * @cfg {String|TemplateFunction} Шаблон, отображаемый поверх элемента в режиме редактирования. 
     */
    editorTemplate?: string;
    /**
     * @name Controls/_list/interface/EditingTemplate#enabled
     * @cfg {Boolean} Когда опция задана в значение true, при наведении курсора мыши на элемент в режиме редактирования будет выделяться фон у контрола-редактора.
     * @default false
     * @see editorTemplate
     */
    enabled?: boolean;
    /**
     * @name Controls/_list/interface/EditingTemplate#value
     * @cfg {String} Текст, отображаемый внутри элемента в режиме просмотра.
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
     * @name Controls/_list/interface/EditingTemplate#size
     * @cfg {Size} Размер шрифта для {@link Controls/list:EditingTemplate#value текста}, который отображается внутри элемента в режиме просмотра. 
     * @default default
     * @see Controls/list:EditingTemplate#value
     * @remark
     * Каждому значению опции соответствует размер в px. Он зависит от {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     */
    size?: string;
 }
 