/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/treeGrid:View дереве}.
 * @class Controls/_treeGrid/interface/ItemTemplate
 * @mixes Controls/list:IBaseItemTemplate
 * @author Авраменко А.С.
 * @see Controls/interface/ITreeGridItemTemplate#itemTemplate
 * @see Controls/interface/ITreeGridItemTemplate#itemTemplateProperty
 * @see Controls/treeGrid:View
 * @example
 * <pre class="brush: html">
 * <Controls.treeGrid:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/treeGrid:ItemTemplate" levelIndentSize="null" expanderSize="l" expanderIcon="node" />
 *    </ws:itemTemplate>
 * </Controls.treeGrid:View>
 * </pre>
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/item/ руководство разработчика}
 *
 * @public
 */

export default interface IItemTemplateOptions {
    /**
     * @typedef {String} Controls/_treeGrid/interface/ItemTemplate/Size
     * @default Допустимые значения для опций {@link expanderSize} и {@link levelIndentSize}.
     * @variant s Маленький размер.
     * @variant m Средний размер.
     * @variant l Большой размер.
     * @variant xl Очень большой размер.
     */

    /**
     * @cfg {Boolean} Когда опция установлена в значение true, в дереве отсутствуют структурные отступы для элементов иерархии.
     * @default false
     * @see levelIndentSize
     * @remark
     * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/paddings/#two-level-tree здесь}.
     */
    withoutLevelPadding?: boolean;
    /**
     * @typedef {String} ExpanderIcon
     * @description Допустимые значения для опции {@link expanderIcon}.
     * @variant none Иконки всех узлов не отображаются.
     * @variant node Иконки всех узлов отображаются как иконки узлов.
     * @variant emptyNode Иконки всех узлов отображаются как иконки пустых узлов.
     * @variant hiddenNode Иконки всех узлов отображаются как иконки скрытых узлов."
     */
    /**
     * @cfg {ExpanderIcon|undefined} Стиль отображения иконки для узла и скрытого узла.
     * @default undefined
     * @remark
     * Когда в опции задано undefined, используются иконки узлов и скрытых узлов.
     * @see expanderSize
     * @remark
     * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/expander/#expander-icon здесь}.
     */
    expanderIcon?: string;
    /**
     * @cfg {Controls/_treeGrid/interface/ItemTemplate/Size.typedef} Размер области, который отведён под иконку узла или скрытого узла.
     * @default s
     * @see expanderIcon
     * @remark
     * Каждому значению опции соответствует размер в px. Он зависит от {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/expander/#expander-size здесь}.
     */
    expanderSize?: string;
    /**
     * @cfg {Controls/_treeGrid/interface/ItemTemplate/Size.typedef} Размер структурного отступа для элементов иерархии.
     * @default s
     * @see withoutLevelPadding
     * @remark
     * Каждому значению опции соответствует размер в px. Он зависит от {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/paddings/#hierarchical-indentation здесь}.
     */
    levelIndentSize?: string;
}
