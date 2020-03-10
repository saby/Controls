/**
 * Интерфейс стилизованного элемента коллекции
 *
 * @interface Controls/_display/interface/ICollectionItemStyled
 * @public
 * @author Аверкиев П.А.
 */
/*
 * Interface of styled item of collection
 *
 * @interface Controls/_display/interface/ICollectionItemStyled
 * @public
 * @author Аверкиев П.А.
 */
export interface ICollectionItemStyled {
    getMultiSelectClasses(): string;
    getWrapperClasses(templateHighlightOnHover?: boolean, marker?: boolean): string;
    getContentClasses(): string;

    /**
     * Классы CSS для отображения действий над записью (в Controls/listRender:itemActionsTemplate)
     * @param itemActionsPosition позиция по отношению к записи: 'inside' | 'outside'
     */
    /*
     * CSS classes to show Item Actions (within Controls/listRender:itemActionsTemplate template)
     * @param itemActionsPosition position relative to Item: 'inside' | 'outside'
     */
    getItemActionClasses(itemActionsPosition: string): string;
}
