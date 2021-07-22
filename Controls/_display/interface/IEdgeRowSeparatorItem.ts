/**
 * Запись, которая учитывается при отображении разделителей у крайних записей списка.
 * Это может быть любая запись, кроме TreeNodeFooter, TreeGridNodeFooter, SearchSeparator, InvisibleItem
 */
export default interface IEdgeRowSeparatorItem {
    readonly EdgeRowSeparatorItem: boolean;
}
