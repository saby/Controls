import {Control, IControlOptions} from 'UI/Base';
import {
    NewColumnScrollController as ColumnScrollController,
    NewScrollBar as ScrollBar,
    DragScrollController,
    StyleContainers
} from 'Controls/columnScroll';
import {SyntheticEvent} from 'UI/Vdom';
import {DestroyableMixin} from 'Types/entity';

interface IViewOptions extends IControlOptions {
    columnScroll?: boolean;
    dragScrolling?: boolean;

    stickyColumnsCount?: number;
    columns: Object[];
    isFullGridSupport: boolean;
    header: Object[];
    backgroundStyle?: string;
    needShowEmptyTemplate?: boolean;
    itemsDragNDrop?: boolean;
    headerVisibility?: string;
    headerInEmptyListVisible?: boolean;
    startDragNDropCallback?: () => void;
    columnScrollStartPosition?: 'end';
    itemActionsPosition?: string;
    multiSelectVisibility?: string;
    multiSelectPosition?: string;
}

interface IView extends Control<IViewOptions> {
    _children: {
        gridWrapper: HTMLDivElement;
        grid: HTMLDivElement | HTMLTableElement;
        horizontalScrollBar: ScrollBar;
        columnScrollStyleContainers: StyleContainers;
    } & (
        { results: HTMLDivElement; } |
        { header: HTMLDivElement; }
    );

    _getStickyLadderCellsCount: (options: IViewOptions) => number;
    _notify: (eName: string,  args: [boolean]) => void;
    _listModel: DestroyableMixin & {
        setStickyColumnsCount(stickyColumnsCount: number): void;
    };
}

interface IColumnScrollViewMixin {
    '[Controls/_grid/ViewMixins/ColumnScrollViewMixin]': true;
    _$columnScrollController: ColumnScrollController;
    _$columnScrollSelector: string;
    _$dragScrollController: DragScrollController;
    _$dragScrollStylesContainer: HTMLStyleElement;
    _$columnScrollFreezeCount: number;
    _$columnScrollEmptyViewMaxWidth: number;

    // IFreezable
    _freezeColumnScroll(): void;
    _unFreezeColumnScroll(): void;
    _isColumnScrollFrozen(): boolean;

    // Hooks
    _columnScrollOnViewBeforeMount(options: IViewOptions): void;
    _columnScrollOnViewDidMount(): void;
    _columnScrollOnViewBeforeUpdate(newOptions: IViewOptions): void;
    _columnScrollOnViewDidUpdate(oldOptions: IViewOptions): void;
    _columnScrollOnViewBeforeUnmount(): void;

    // Methods
    isColumnScrollVisible(): boolean;
    _resetColumnScroll(options: IViewOptions): void;
    _columnScrollHasItemActionsCell(options: IViewOptions): boolean;
    _isDragScrollEnabledByOptions(options: IViewOptions): boolean;
    _getColumnScrollEmptyViewMaxWidth(): number;
    _getColumnScrollThumbStyles(options: IViewOptions): string;
    _getColumnScrollWrapperClasses(options: IViewOptions): string;
    _getColumnScrollContentClasses(options: IViewOptions): string;

    // EventHandlers
    _onColumnScrollThumbPositionChanged(e: SyntheticEvent<null>, newPosition: number): void;
    _onColumnScrollThumbDragEnd(e: SyntheticEvent<null>): void;
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
