/**
 * Шаблон, который по умолчанию используется для отображения {@link Controls/list:View плоского списка} без элементов.
 * @class Controls/list:EmptyTemplate
 * @author Авраменко А.С.
 * @see Controls/list:IList#emptyTemplate
 * @see Controls/list:View
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html">
 * <Controls.list:View>
 *    <ws:emptyTemplate>
 *       <ws:partial template="Controls/list:EmptyTemplate" topSpacing="xxl" bottomSpacing="m">
 *          <ws:contentTemplate>No data available!</ws:contentTemplate>
 *       </ws:partial>
 *    </ws:emptyTemplate>
 * </Controls.list:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/templates/empty/ здесь}.
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
     * @name Controls/list:EmptyTemplate#topSpacing
     * @cfg {Spacing|null} Устанавливает расстояние между верхней границей и контентом шаблона.
     * @remark
     * В значении null отступ отсутствует.
     * Каждому значению опции соответствует размер в px. Он зависит от {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     * @default l
     */
    topSpacing?: string;
    /**
     * @name Controls/list:EmptyTemplate#bottomSpacing
     * @cfg {Spacing|null} Устанавливает расстояние между нижней границей и контентом шаблона.
     * @remark
     * В значении null отступ отсутствует.
     * @remark
     * Каждому значению опции соответствует размер в px. Он зависит от {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     * @default l
     */
    bottomSpacing?: string;
    /**
     * @name Controls/list:EmptyTemplate#contentTemplate
     * @cfg {String|Function|undefined} Устанавливает пользовательский шаблон, описывающий отображение контрола без элементов.
     */
    contentTemplate?: string;
 }
 