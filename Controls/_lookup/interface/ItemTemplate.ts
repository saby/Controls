/**
 * Шаблон, который по умолчанию используется для отображения выбранных значений в контролах {@link Controls/lookup:Input} и {@link Controls/lookup:Selector}.
 *
 * @class Controls/_lookup/interface/ItemTemplate
 * @author Герасимов А.М.
 * @public
 * @see Controls/lookup
 * @see Controls/lookup:Input
 *
 * @remark
 *
 * Если вы переопределите contentTemplate/crossTemplate, вы не будете уведомлены о событиях itemClick/crossClick.
 * Для правильной работы необходимо пометить свой контент классами:
 * 
 * * js-controls-SelectedCollection__item__caption
 * * js-controls-SelectedCollection__item__cross
 *
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.lookup:Selector
 *     source="{{_source}}"
 *     keyProperty="id">
 *     <ws:itemTemplate>
 *         <ws:partial template="Controls/lookup:ItemTemplate"
 *             style="primary"
 *             size="xl"
 *             displayProperty="title"
 *             clickable="{{true}}" />
 *     </ws:itemTemplate>
 * </Controls.lookup:Selector>
 * </pre>
 */

export default interface IItemTemplateOptions {
    /**
     * @name Controls/_lookup/interface/ItemTemplate#contentTemplate
     * @cfg {String|Function} Шаблон отображения выбранной записи.
     */
    contentTemplate?: string;
    /**
     * @name Controls/_lookup/interface/ItemTemplate#crossTemplate
     * @cfg {String|Function} Шаблон крестика удаления элемента.
     */
    crossTemplate?: string;
    /**
     * @name Controls/_lookup/interface/ItemTemplate#displayProperty
     * @cfg {String} Название поля, значение которого отображается при выборе элемента.
     */
    displayProperty?: string;
    /**
     * @name Controls/_lookup/interface/ItemTemplate#clickable
     * @cfg {Boolean} Позволяет установить кликабельность выбранного значения.
     *
     * @remark
     * Использование параметра допустимо только в случае применения contentTemplate по умолчанию.
     */
    clickable?: boolean;
    /**
     * @name Controls/_lookup/interface/ItemTemplate#size
     * @cfg {String} Размер записей.
     *
     * @remark
     * Использование параметра допустимо только в случае применения contentTemplate по умолчанию.
     * Доступные значения: m, l, xl, 2xl, 3xl.
     */
    size?: string;
    /**
     * @name Controls/_lookup/interface/ItemTemplate#style
     * @cfg {String} Cтиль записей.
     *
     * @remark
     * Использование параметра допустимо только в случае применения contentTemplate по умолчанию.
     * Доступные значения: default, bold, accent, primary, label.
     */
    style?: string;
 }

