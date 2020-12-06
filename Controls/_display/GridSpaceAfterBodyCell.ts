import { TemplateFunction } from 'UI/Base';
import GridFooterRow from './GridFooterRow';
import GridCell, {IOptions as IGridCellOptions} from './GridCell';

export interface IOptions<T> extends IGridCellOptions<T> {
    owner: GridFooterRow<T>;
    template?: TemplateFunction;
}

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:SpaceAfterBodyCellContent';

export default class GridSpaceAfterBodyCell<T> extends GridCell<T, GridFooterRow<T>> {

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        return '';
    }

    getWrapperStyles(): string {
        return super.getWrapperStyles();
    }

    getContentClasses(theme: string): string {
        return '';
    }

    getTemplate(): TemplateFunction|string {
        return DEFAULT_CELL_TEMPLATE;
    }
}

Object.assign(GridSpaceAfterBodyCell.prototype, {
    _moduleName: 'Controls/display:GridSpaceAfterBodyCell',
    _instancePrefix: 'grid-bottom-padding-cell-'
});
