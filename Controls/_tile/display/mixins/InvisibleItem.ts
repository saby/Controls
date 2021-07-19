/**
 * Миксин, который содержит логику отображения невидимого элемента в коллекции плиток.
 * @author Панихин К.А.
 */
export default abstract class InvisibleItem {
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly EdgeRowSeparatorItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    protected _$lastInvisibleItem: boolean;

    /**
     * Возвращает классы стилей для невидимого элемента
     */
    getInvisibleClasses(): string {
        let classes = 'controls-TileView__item controls-TileView__item_invisible ';
        classes += this.getItemPaddingClasses();
        return classes;
    }

    /**
     * Возвращает признак, означающий что данный элемент является последним элементом среди пачки подряд идущих невидимых элементов
     */
    isLastInvisibleItem(): boolean {
        return this._$lastInvisibleItem;
    }

    abstract getItemPaddingClasses(): string;
}

Object.assign(InvisibleItem.prototype, {
    '[Controls/_tile/display/mixins/InvisibleItem]': true,
    _$lastInvisibleItem: false
});
