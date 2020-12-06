import GridRow, {IOptions as IGridRowOptions} from './GridRow';
import GridCollection from './GridCollection';

export interface IOptions<T> extends IGridRowOptions<T> {
    owner: GridCollection<T>;
}

export default class GridSpaceAfterBodyRow<T> extends GridRow<T> {

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getContents(): T {
        return 'bottom-padding' as unknown as T;
    }

    getWrapperClasses(templateHighlightOnHover: boolean = true,
                      theme?: string,
                      cursor: string = 'pointer',
                      backgroundColorStyle?: string,
                      style: string = 'default'): string {
        return `controls-itemActionsV_outside-spacing_theme-${theme}`;
    }

    _initializeColumns(): void {
        if (this._$columns) {
            const factory = this._getColumnsFactory();
            this._$columnItems = [];
            if (this._$owner.getMultiSelectVisibility() !== 'hidden') {
                this._$columnItems.push(factory({
                    column: {}
                }));
            }
            this._$columnItems.push(factory({
                column: {
                    template: null,
                    colspan: this._$owner.getColumnsConfig().length
                }
            }));
        }
    }
}

Object.assign(GridSpaceAfterBodyRow.prototype, {
    _moduleName: 'Controls/display:GridSpaceAfterBodyRow',
    _instancePrefix: 'grid-bottom-padding-row-',
    _cellModule: 'Controls/display:GridSpaceAfterBodyCell'
});
