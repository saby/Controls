import {TemplateFunction} from 'UI/Base';

/**
 * Шаблон, который по умолчанию используется для отображения индикатора загрузки в списочных контролах.
 *
 * @class Controls/_list/interface/LoadingIndicatorTemplate
 * @author Михайлов С.Е.
 * @public
 * @see Controls/list
 * @example
 * <pre class="brush: html; highlight: [3-10]">
 * <!-- WML -->
 * <Controls.list:View source="{{_viewSource}}">
 *     <ws:loadingIndicatorTemplate>
 *         <ws:partial template="Controls/list:LoadingIndicatorTemplate"
 *                      scope="{{loadingIndicatorTemplate}}">
 *             <ws:footerTemplate>
 *                 <div>Дополнительная информация</div>
 *             </ws:footerTemplate>
 *         </ws:partial>
 *     </ws:loadingIndicatorTemplate>
 * </Controls.list:View>
 * </pre>
 */

export default interface ILoadingIndicatorTemplateOptions {
    /**
     * @cfg {String|Function|undefined} Пользовательский шаблон, описывающий контент индикатора
     * @example
     * <pre class="brush: html; highlight: [6-8]">
     * <!-- WML -->
     * <Controls.list:View source="{{_viewSource}}">
     *    <ws:loadingIndicatorTemplate>
     *       <ws:partial template="Controls/list:LoadingIndicatorTemplate"
     *          scope="{{loadingIndicatorTemplate}}">
     *          <ws:contentTemplate>
     *             <div>Данные загружаются</div>
     *          </ws:contentTemplate>
     *       </ws:partial>
     *    </ws:loadingIndicatorTemplate>
     * </Controls.list:View>
     * </pre>
     */
    contentTemplate: TemplateFunction | string;
    /**
     * @cfg {String|Function|undefined} Пользовательский шаблон, описывающий подвал индикатора.
     * @example
     * <pre class="brush: html; highlight: [6-8]">
     * <!-- WML -->
     * <Controls.list:View source="{{_viewSource}}">
     *    <ws:loadingIndicatorTemplate>
     *       <ws:partial template="Controls/list:LoadingIndicatorTemplate"
     *          scope="{{loadingIndicatorTemplate}}">
     *          <ws:footerTemplate>
     *              <div>Дополнительная информация при поиске/div>
     *          </ws:footerTemplate>
     *       </ws:partial>
     *    </ws:loadingIndicatorTemplate>
     * </Controls.list:View>
     * </pre>
     */
    footerTemplate: TemplateFunction | string;
}
