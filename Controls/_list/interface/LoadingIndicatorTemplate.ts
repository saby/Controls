import {TemplateFunction} from 'UI/Base';

/**
 * Шаблон, который по умолчанию используется для отображения индикатора загрузки в списочных контролах.
 *
 * @class Controls/_list/interface/LoadingIndicatorTemplate
 * @author Михайлов С.Е.
 * @public
 * @see Controls/list
 *
 *
 * @example
 * <pre class="brush: html">
 * <Controls.list:View>
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
     * @name Controls/_list/interface/LoadingIndicatorTemplate#contentTemplate
     * @cfg {String|Function|undefined} Пользовательский шаблон, описывающий контент индикатора
     * @example
     * WML:
     * <pre class="brush: html">
     *   <Controls.list:View
     *      <ws:loadingIndicatorTemplate>
     *           <ws:partial template="Controls/list:LoadingIndicatorTemplate"
     *                      scope="{{loadingIndicatorTemplate}}">
     *               <ws:contentTemplate>
     *                   <div>Данные загружаются</div>
     *               </ws:contentTemplate>
     *          </ws:partial>
     *      </ws:loadingIndicatorTemplate>
     *  </Controls.list:View>
     * </pre>
     */
    contentTemplate: TemplateFunction | string;
    /**
     * @name Controls/_list/interface/LoadingIndicatorTemplate#footerTemplate
     * @cfg {String|Function|undefined} Пользовательский шаблон, описывающий подвал индикатора.
     * @example
     * WML:
     * <pre class="brush: html">
     *   <Controls.list:View
     *      <ws:loadingIndicatorTemplate>
     *           <ws:partial template="Controls/list:LoadingIndicatorTemplate"
     *                      scope="{{loadingIndicatorTemplate}}">
     *               <ws:footerTemplate>
     *                   <div>Дополнительная информация при поиске/div>
     *               </ws:footerTemplate>
     *          </ws:partial>
     *      </ws:loadingIndicatorTemplate>
     *  </Controls.list:View>
     * </pre>
     */
    footerTemplate: TemplateFunction | string;
}
