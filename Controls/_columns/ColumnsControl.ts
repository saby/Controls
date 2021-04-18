import {SyntheticEvent} from 'Vdom/Vdom';
import {BaseControl, IBaseControlOptions} from 'Controls/list';
import Collection from 'Controls/_columns/display/Collection';
import {Model} from 'Types/entity';
import CollectionItem from 'Controls/_columns/display/CollectionItem';
import {scrollToElement} from 'Controls/scroll';
import {constants} from 'Env/Env';
import {DEFAULT_MIN_WIDTH, DEFAULT_MAX_WIDTH, DEFAULT_COLUMNS_COUNT} from 'Controls/_columns/Constants';

export interface IColumnsControlOptions extends IBaseControlOptions {
    columnMinWidth: number;
    columnMaxWidth: number;
    columnsMode: 'auto' | 'fixed';
    columnsCount: number;
    initialWidth: number;
}

export default class ColumnsControl<TOptions extends IColumnsControlOptions = IColumnsControlOptions> extends BaseControl<TOptions> {
    private _columnsCount: number;
    protected _listViewModel: Collection<Model>;

    protected _beforeMount(
        newOptions: TOptions,
        context?,
        receivedState: IReceivedState = {}
        ): void | Promise<unknown> {
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
    }

    protected _afterItemsSet(options: IColumnsControlOptions): void {
        super._afterItemsSet(options);
        if (options.columnsMode === 'auto' && options.initialWidth) {
            this._listViewModel.setCurrentWidth(options.initialWidth, options.columnMinWidth);
        } else {
            this._listViewModel.setColumnsCount(options.columnsCount || DEFAULT_COLUMNS_COUNT);
        }
    }

    protected _beforeUpdate(options: TOptions): void {
        super._beforeUpdate(options);
        if (options.columnsMode === 'fixed' && options.columnsCount !== this._options.columnsCount) {
            this._listViewModel.setColumnsCount(this._columnsCount);
        }
    }

    protected _shouldMoveMarkerOnScrollPaging(): boolean {
        return false;
    }

    protected _isPlainItemsContainer(): boolean {
        return false;
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
