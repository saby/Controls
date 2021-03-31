/**
 * Интерфейс записи дерева, которая может быть или не быть узлом-группой
 * @author Аверкиев П.А.
 * @public
 */
export default interface IGroupNode {
    /**
     * Возвращает true, если узел необходимо показать как группу.
     */
    isGroupNode(): boolean;
}
