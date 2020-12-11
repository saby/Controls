/**
 * Шаблон, который по умолчанию используется для отображения подвала {@link /doc/platform/developmentapl/interface-development/controls/input/suggest/ автодополнения}.
 * @class Controls/suggestPopup:FooterTemplate
 * @remark
 * Подробнее о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/input/suggest/ здесь}.
 * @example
 * <pre class="brush: html">
 * <Controls.suggest:Input>
 *    <ws:footerTemplate templateName="Controls/suggestPopup:FooterTemplate">
 *       <ws:templateOptions>   
 *          <ws:showSelectorButtonTemplate>
 *             <span on:click="_showAllClick()">
 *                <span>Моя кнопка</span>
 *             </span>
 *          </ws:showSelectorButtonTemplate>
 *       </ws:templateOptions>
 *    </ws:footerTemplate>
 * </Controls.suggest:Input>
 * </pre>
 * @demo Controls-demo/Suggest_new/SearchInput/FooterTemplate/FooterTemplate
 * @see Controls/suggestPopup
 * @see Controls/interface/ISuggest#footerTemplate
 * @author Герасимов А.М.
 * @public
 */
export default interface IFooterTemplateOptions {
    /**
     * @name Controls/suggestPopup:FooterTemplate#showMoreButtonTemplate
     * @cfg {Function|String} Шаблон кнопки "Ещё".
     * @example 
     * <pre class="brush: html">
     * <ws:partial template="Controls/suggestPopup:FooterTemplate">
     *    <ws:showMoreButtonTemplate>
     *       <span on:click="_showAllClick()">
     *          <span>Моя кнопка</span>
     *       </span>
     *    </ws:showMoreButtonTemplate>
     * </ws:partial>
     * </pre>
     */
    showMoreButtonTemplate?: string;
    /**
     * @name Controls/suggestPopup:FooterTemplate#showSelectorButtonTemplate
     * @cfg {Function|String} Шаблон кнопки "Показать всё".
     * @example 
     * <pre class="brush: html">
     * <ws:partial template="Controls/suggestPopup:FooterTemplate">
     *    <ws:showSelectorButtonTemplate>
     *       <span on:click="_showAllClick()">
     *          <span>Моя кнопка</span>
     *       </span>
     *    </ws:showSelectorButtonTemplate>
     * </ws:partial>
     * </pre>
     */
    showSelectorButtonTemplate?: string;
 }
 