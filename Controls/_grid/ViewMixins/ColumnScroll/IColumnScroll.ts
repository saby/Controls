import {Control, IControlOptions} from 'UI/Base';
import {
    NewColumnScrollController as ColumnScrollController,
    ScrollBar,
    DragScrollController,
    StyleContainers
} from 'Controls/columnScroll';
import {SyntheticEvent} from 'UI/Vdom';

interface IViewOptions extends IControlOptions {
    columnScroll?: boolean;
    dragScrolling?: boolean;

    stickyColumnsCount?: number;
    columns: Object[];
    isFullGridSupport: boolean;
    backgroundStyle?: string;
    needShowEmptyTemplate?: boolean;
    itemsDragNDrop?: boolean;
}

abstract class IView extends Control<IViewOptions> {
    protected _children: {
        gridWrapper: HTMLDivElement;
        grid: HTMLDivElement | HTMLTableElement;
        horizontalScrollBar: ScrollBar;
        columnScrollStyleContainers: StyleContainers;
    } & (
        { results: HTMLDivElement; } |
        { header: HTMLDivElement; }
    );

    _getStickyLadderCellsCount: (options: IViewOptions) => number;
}

interface IColumnScrollViewMixin {
    '[Controls/_grid/ViewMixins/ColumnScrollViewMixin]': true;
    _$columnScrollController: ColumnScrollController;
    _$columnScrollSelector: string;
    _$dragScrollController: DragScrollController;
    _$dragScrollStylesContainer: HTMLStyleElement;

    // IFreezable
    _$columnScrollFreezeCount: number;
    _freezeColumnScroll(): void;
    _unFreezeColumnScroll(): void;
    _isColumnScrollFrozen(): boolean;

    // Hooks
    _columnScrollOnViewBeforeMount(options: IViewOptions): void;
    _columnScrollOnViewMounted(): void;
    _columnScrollOnViewBeforeUpdate(options: IViewOptions): void;
    _columnScrollOnViewUpdated(oldOptions: IViewOptions): void;

    // Methods
    _getColumnScrollThumbStyles(options: IViewOptions): string;
    _getColumnScrollWrapperClasses(options: IViewOptions): string;
    _getColumnScrollContentClasses(options: IViewOptions): string;

    // EventHandlers
    _onColumnScrollThumbPositionChanged(e: SyntheticEvent<null>, newPosition: number): void;
    _onColumnScrollViewWheel(e: SyntheticEvent<WheelEvent>): void;
    _onColumnScrollWrapperResized(): void;

    _onColumnScrollStartDragScrolling(e: SyntheticEvent<TouchEvent | MouseEvent>, startBy: 'mouse' | 'touch'): void;
    _onColumnScrollDragScrolling(e: SyntheticEvent<TouchEvent | MouseEvent>, startBy: 'mouse' | 'touch'): void;
    _onColumnScrollStopDragScrolling(e: SyntheticEvent<TouchEvent | MouseEvent>, startBy: 'mouse' | 'touch'): void;
}

type TColumnScrollViewMixin = IView & IColumnScrollViewMixin;

export {
    IView as IAbstractView,
    IViewOptions as IAbstractViewOptions,
    TColumnScrollViewMixin
};
