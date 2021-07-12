import FooterRow from './FooterRow';
import Cell, {IOptions as ICellOptions, IOptions as IBaseCellOptions} from './Cell';

export interface IOptions<T> extends ICellOptions<T> {
    shouldAddFooterPadding: boolean;
}

class FooterCell<T> extends Cell<T, FooterRow<T>> {
    protected readonly _defaultCellTemplate: string = 'Controls/grid:FooterColumnTemplate';
    protected _$shouldAddFooterPadding: boolean;

    //region Аспект "Стилевое оформление"
    getWrapperClasses(theme: string,
                      backgroundColorStyle: string,
                      style: string = 'default',
                      templateHighlightOnHover: boolean): string {
        let wrapperClasses = 'controls-ListView__footer controls-GridView__footer__cell';

        wrapperClasses += this._getControlsBackgroundClass(style, backgroundColorStyle);

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses(theme)}`;
        }

        if (this._$shouldAddFooterPadding) {
            wrapperClasses += ' controls-GridView__footer__itemActionsV_outside';
        }

        wrapperClasses += this._getHorizontalPaddingClasses(this._$column.cellPadding);

        return wrapperClasses;
    }

    getWrapperStyles(containerSize?: number): string {
        let styles = this.getColspanStyles();
        if (containerSize && this._$isActsAsRowTemplate) {
            styles += ` width: ${containerSize}px;`;
        }
        return styles;
    }

    getContentClasses(): string {
        return 'controls-GridView__footer__cell__content';
    }

    getInnerContentWrapperClasses(): string {
        return 'controls-GridView__footer__cell__inner-content-wrapper';
    }
    //endregion
}

Object.assign(FooterCell.prototype, {
    '[Controls/_display/grid/FooterCell]': true,
    _$shouldAddFooterPadding: false,
    _moduleName: 'Controls/grid:GridFooterCell',
    _instancePrefix: 'grid-footer-cell-'
});

export default FooterCell;
export {
    FooterCell,
    IBaseCellOptions as IFooterCellOptions
};
