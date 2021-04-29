export default abstract class InvisibleItem {
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    protected _$lastInvisibleItem: boolean;

    getInvisibleClasses(): string {
        let classes = 'controls-TileView__item controls-TileView__item_invisible ';
        classes += this.getItemPaddingClasses();
        return classes;
    }

    isLastInvisibleItem(): boolean {
        return this._$lastInvisibleItem;
    }

    abstract getItemPaddingClasses(): string;
}

Object.assign(InvisibleItem.prototype, {
    '[Controls/_tile/display/mixins/InvisibleItem]': true,
    _$lastInvisibleItem: false
});
