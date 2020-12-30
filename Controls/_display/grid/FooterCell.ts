import { TemplateFunction } from 'UI/Base';
import FooterRow from './FooterRow';
import Cell, {IOptions as ICellOptions} from './Cell';

export interface IOptions<T> extends ICellOptions<T> {
    owner: FooterRow<T>;
    template?: TemplateFunction;
}

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:FooterContent';

export default class FooterCell<T> extends Cell<T, FooterRow<T>> {

    constructor(options?: IOptions<T>) {
        super(options);
    }

    isLastColumn(): boolean {
        // В футере не создаются столбцы для ItemActions
        return this.getColumnIndex() === this._$owner.getColumnsCount() - 1;
    }

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        let wrapperClasses = 'controls-GridView__footer-cell'
                          + ` controls-GridView__footer__cell_theme-${theme}`
                          + ` controls-background-${backgroundColorStyle}_theme-${theme}`;

        if (!this.getOwner().hasMultiSelectColumn() && this.isFirstColumn()) {
            wrapperClasses += ` controls-GridView__footer__cell__paddingLeft_${this._$owner.getLeftPadding()}_theme-${theme}`;
        }

        if (this.isLastColumn()) {
            wrapperClasses += ` controls-GridView__footer__cell__paddingRight_${this._$owner.getRightPadding()}_theme-${theme}`;
        }

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses(theme)}`;
        }

        return wrapperClasses;
    }

    getWrapperStyles(containerSize?: number): string {
        let styles = `${this.getColspan()} `;

        if (containerSize) {
            styles += `width: ${containerSize}px`;
        }

        return styles;
    }

    getContentClasses(theme: string): string {
        return 'controls-Grid__footer-cell__content';
    }

    getTemplate(): TemplateFunction|string {
        return this._$column.template || DEFAULT_CELL_TEMPLATE;
    }
}

Object.assign(FooterCell.prototype, {
    '[Controls/_display/grid/FooterCell]': true,
    _moduleName: 'Controls/display:GridFooterCell',
    _instancePrefix: 'grid-footer-cell-'
});
