export type TSelectionType = 'all' | 'leaf' | 'node';

export type TKeySelection = number|string|null;
export type TKeysSelection = TKeySelection[];

export type TSelectionRecord = Record<{
    marked: TKeysSelection,
    excluded: TKeysSelection,
    type: TSelectionType,
    recursive: boolean
}>;

/**
 * @interface Controls/_interface/ISelectionObject
 * @public
 * @author Герасимов А.М.
 */
export interface ISelectionObject {
   /**
    * @name Controls/_interface/ISelectionObject#selected
    * @cfg {Array<Number>|Array<String>} Идентификаторы отмеченных записей.
    */
    selected: TKeysSelection;
   /**
    * @name Controls/_interface/ISelectionObject#excluded
    * @cfg {Array<Number>|Array<String>} Идентификаторы исключённых записей.
    */
    excluded: TKeysSelection;
}

export interface ISelectionTypeOptions {
    selectionType: TSelectionType;
    recursiveSelection: boolean;
}

/**
 * Интерфейс для контролов, поддерживающих выбор записей определённого типа.
 *
 * @interface Controls/_interface/ISelectionType
 * @public
 * @author Герасимов А.М.
 */

export default interface ISelectionType {
    readonly '[Controls/_interface/ISelectionType]': boolean;
};

/**
 * @typedef {String} SelectionType
 * @variant all Для выбора доступны любые типы элементов.
 * @variant allBySelectAction Для выбора доступен любой тип элемента. Выбор осуществляется нажатием на кнопку «Выбрать».
 * @variant node Для выбора доступны любые типа «Узел».
 * @variant leaf Для выбора доступны только элементы типа «лист» и «скрытый узел».
 */

/**
 * @name Controls/_interface/ISelectionType#selectionType
 * @cfg {SelectionType} Тип выбираемых записей.
 * @default all
 * @example
 * В этом примере для выбора будут доступны только узлы.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Layout.Selector.Browser parentProperty="Раздел" nodeProperty="Раздел@" selectionType="node">
 *     <ws:content>
 *         <Controls.treeGrid:View />
 *     </ws:content>
 * </Layout.Selector.Browser>
 * </pre>
 */

/**
 * @name Controls/_interface/ISelectionType#recursiveSelection
 * @cfg {Boolean} Определяет, будут ли выбираться дочерние элементы при выборе папки.
 * @default true
 * @example
 * В этом примере при выборе папки в результат выбора вернётся только сама папке, без вложений.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Layout.Selector.Browser parentProperty="Раздел" nodeProperty="Раздел@" selectionType="node" recursiveSelection="{{false}}">
 *     <ws:content>
 *         <Controls.treeGrid:View />
 *     </ws:content>
 * </Layout.Selector.Browser>
 * </pre>
 */
