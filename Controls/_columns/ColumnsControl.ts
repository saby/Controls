import { SyntheticEvent } from 'UICommon/Events';
import {BaseControl, IBaseControlOptions} from 'Controls/list';
import Collection from 'Controls/_columns/display/Collection';
import {Model} from 'Types/entity';
import CollectionItem from 'Controls/_columns/display/CollectionItem';
import {scrollToElement} from 'Controls/scroll';
import {CrudEntityKey} from 'Types/source';
import {constants} from 'Env/Env';

const SPACING = 12;
const DEFAULT_MIN_WIDTH = 270;
const DEFAULT_MAX_WIDTH = 400;
const DEFAULT_COLUMNS_COUNT = 2;

export interface IColumnsControlOptions extends IBaseControlOptions {
    columnMinWidth: number;
    columnMaxWidth: number;
    columnsMode: 'auto' | 'fixed';
    columnsCount: number;
    initialWidth: number;
}

export default class ColumnsControl<TOptions extends IColumnsControlOptions = IColumnsControlOptions> extends BaseControl<TOptions> {
    private _columnsCount: number;
    private _spacing: number = SPACING;
    protected _listViewModel: Collection<Model>;

    protected _beforeMount(newOptions: TOptions, context?, receivedState: IReceivedState = {}): void | Promise<unknown> {
        const superMountResult = super._beforeMount(newOptions, context, receivedState);
        if (superMountResult instanceof Promise) {
            superMountResult.then((result) => {
                this._listViewModel?.setColumnsCount(this._columnsCount);
                return result;
            });
        } else {
            this._listViewModel?.setColumnsCount(this._columnsCount);
        }
        return superMountResult;
    }

    protected _afterMount(): void {
        super._afterMount();
        this._resizeHandler();
    }

    protected _afterItemsSet(options): void {
        super._afterItemsSet(options);
        if (options.columnsMode === 'auto' && options.initialWidth) {
            this._recalculateColumnsCountByWidth(options.initialWidth, options.columnMinWidth);
        } else {
            if (options.columnsCount) {
                this._columnsCount = options.columnsCount;
            } else {
                this._columnsCount = DEFAULT_COLUMNS_COUNT;
            }
        }
        this._listViewModel?.setColumnsCount(this._columnsCount);
    }

    protected _beforeUpdate(options: TOptions): void {
        super._beforeUpdate(options);
        if (options.columnsMode === 'fixed' && options.columnsCount !== this._options.columnsCount) {
            this._columnsCount = options.columnsCount;
            this._listViewModel.setColumnsCount(this._columnsCount);
        } else {
            this._resizeHandler();
        }
    }

    protected _shouldMoveMarkerOnScrollPaging(): boolean {
        return false;
    }

    protected _isPlainItemsContainer(): boolean {
        return false;
    }

    protected _viewResize(): void {
        super._viewResize();
        this._resizeHandler();
    }

    protected _resizeHandler(): void {
        const itemsContainer = this._getItemsContainer();
        const currentWidth = itemsContainer.getBoundingClientRect().width;

        // если currentWidth === 0, значит контрол скрыт (на вкладке switchbleArea), и не нужно пересчитывать
        if (this._options.columnsMode === 'auto' && currentWidth > 0) {
            this._recalculateColumnsCountByWidth(currentWidth, this._options.columnMinWidth);
        }
    }

    private _recalculateColumnsCountByWidth(width: number, columnMinWidth: number): void {
        const newColumnsCount = Math.floor(width / ((columnMinWidth || DEFAULT_MIN_WIDTH) + this._spacing));
        if (newColumnsCount !== this._columnsCount) {
            this._columnsCount = newColumnsCount;
            this._listViewModel.setColumnsCount(this._columnsCount);
        }
    }

    private moveMarker(direction: string): void {
        const model = this._listViewModel;
        if (model && this._markerController) {
            const curMarkedItem = model.find((item) => item.isMarked());
            let newMarkedItem: CollectionItem<Model>;
            newMarkedItem = model[`getItemTo${direction}`](curMarkedItem);
            if (newMarkedItem && curMarkedItem !== newMarkedItem) {
                this._changeMarkedKey(newMarkedItem.getContents().getKey());
                const column = newMarkedItem.getColumn();
                const curIndex = model.getIndex(newMarkedItem);
                const columnIndex = model.getIndexInColumnByIndex(curIndex);
                const itemsContainer = this._getItemsContainer();
                const elem = itemsContainer.children[column].children[columnIndex + 1] as HTMLElement;
                scrollToElement(elem, direction === 'Down');
            }
        }
    }

    protected _keyDownHandler(e: SyntheticEvent<KeyboardEvent>): boolean {
        let direction = '';
        switch (e.nativeEvent.keyCode) {
            case constants.key.left:
                direction = 'Left';
                break;
            case constants.key.up:
                direction = 'Up';
                break;
            case constants.key.right:
                direction = 'Right';
                break;
            case constants.key.down:
                direction = 'Down';
                break;
        }
        if (direction) {
            this.moveMarker(direction);
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    }

    static getDefaultOptions(): Partial<IColumnsControlOptions> {
        return {
            ...BaseControl.getDefaultOptions(),
            columnMinWidth: DEFAULT_MIN_WIDTH,
            columnMaxWidth: DEFAULT_MAX_WIDTH,
            columnsMode: 'auto',
            columnsCount: DEFAULT_COLUMNS_COUNT
        };
    }
}

Object.defineProperty(ColumnsControl, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return ColumnsControl.getDefaultOptions();
    }
});
