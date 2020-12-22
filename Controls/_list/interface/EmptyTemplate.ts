/**
 * Шаблон, который по умолчанию используется для отображения {@link Controls/list:View плоского списка} без элементов.
 * 
 * @class Controls/_list/interface/EmptyTemplate
 * @author Авраменко А.С.
 * @see Controls/list:IList#emptyTemplate
 * @see Controls/list:View
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [2,3,4,5,6]">
 * <Controls.list:View>
 *    <ws:emptyTemplate>
 *       <ws:partial template="Controls/list:EmptyTemplate" topSpacing="xxl" bottomSpacing="m">
 *          <ws:contentTemplate>No data available!</ws:contentTemplate>
 *       </ws:partial>
 *    </ws:emptyTemplate>
 * </Controls.list:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/list/empty-list/ здесь}.
 * @public
 */

export default interface IEmptyTemplateOptions {
    /**
     * @typedef {String} Spacing
     * @variant xs Минимальный отступ.
     * @variant s Маленький отступ.
     * @variant m Средний отступ.
     * @variant l Большой отступ.
     * @variant xl Очень большой оступ.
     * @variant xxl Максимальный отступ.
     */

    /**
     * @name Controls/_list/interface/EmptyTemplate#topSpacing
     * @cfg {Spacing|null} Отступ между верхней границей  и шаблоном contentTemplate.
     * @remark
     * В значении null отступ отсутствует.
     * Каждому значению опции соответствует размер в px. Он зависит от {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     * @default l
     */
    topSpacing?: string;
    /**
     * @name Controls/_list/interface/EmptyTemplate#bottomSpacing
     * @cfg {Spacing|null} Отступ между нижней границей и шаблоном contentTemplate.
     * @remark
     * В значении null отступ отсутствует.
     * Каждому значению опции соответствует размер в px. Он зависит от {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     * @default l
     */
    bottomSpacing?: string;
    /**
     * @name Controls/_list/interface/EmptyTemplate#contentTemplate
     * @cfg {String|Function|undefined} Шаблон, описывающий контент плоского списка без элементов.
     */
    contentTemplate?: string;
 }
 