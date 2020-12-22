/**
 *
 * Шаблон-обертка для валидации контролов, не имеющих собственной обводки
 *
 * @class Controls/validate:Highlighter
 * @author Колесова П.С.
 * @example
 * В следующем примере показано, как добавить
 * <pre class="brush: html">
 * <Controls.validate:Container>
 *      <ws:validators>
 *           <ws:Function value="{{false}}">Controls-demo/Input/Validate/FormController:prototype.isTrue</ws:Function>
 *      </ws:validators>
 *      <ws:content>
 *             <Controls.validate:Highlighter>
 *                  <Controls.list:AddButton readOnly="{{false}}" caption="Наименование"/>
 *             </Controls.validate:Highlighter>
 *      </ws:content>
 * </Controls.validate:Container>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/forms-and-validation/validation/client-validate/#custom-validation-usage-scenarios здесь}.
 * @public
 */
