/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/treeGrid:View дереве с колонками}.
 * @class Controls/_treeGrid/interface/ItemTemplate
 * @implements Controls/list:IBaseItemTemplate
 * @author Авраменко А.С.
 * @see Controls/interface/ITreeGridItemTemplate#itemTemplate
 * @see Controls/interface/ITreeGridItemTemplate#itemTemplateProperty
 * @see Controls/treeGrid:View
 * @example
 * <pre class="brush: html; highlight: [3-5]">
 * <!-- WML -->
 * <Controls.treeGrid:View >
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
     * @cfg {Boolean} Когда опция установлена в значение true, в дереве отсутствуют {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/paddings/ структурные отступы} для элементов иерархии.
     * @default false
     * @see levelIndentSize
     */
    withoutLevelPadding?: boolean;
    /**
     * @cfg {Stings|undefined} Стиль отображения {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/expander/#expander-icon иконки} для узла и скрытого узла.
     * @variant none Иконки всех узлов не отображаются.
     * @variant node Иконки всех узлов отображаются как иконки узлов.
     * @variant emptyNode Иконки всех узлов отображаются как иконки пустых узлов.
     * @variant hiddenNode Иконки всех узлов отображаются как иконки скрытых узлов."
     * @default undefined
     * @remark
     * Когда в опции задано undefined, используются иконки узлов и скрытых узлов.
     * @see expanderSize
     */
    expanderIcon?: string;
    /**
     * @cfg {Controls/_tree/interface/ITreeControl/ExpanderSize.typedef} Размер области, который отведён под иконку узла или скрытого узла.
     * @default s
     * @see expanderIcon
     * @remark
     * Каждому значению опции соответствует размер в px. Он зависит от {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/expander/#expander-size здесь}.
     */
    expanderSize?: string;
    /**
     * @cfg {Controls/_tree/interface/ITreeControl/ExpanderSize.typedef} Размер структурного отступа для элементов иерархии.
     * @default s
     * @see withoutLevelPadding
     * @remark
     * Каждому значению опции соответствует размер в px. Он зависит от {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/paddings/#hierarchical-indentation здесь}.
     */
    levelIndentSize?: string;
}
