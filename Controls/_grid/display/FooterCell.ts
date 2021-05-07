import FooterRow from './FooterRow';
import Cell, {IOptions as IBaseCellOptions} from './Cell';

class FooterCell<T> extends Cell<T, FooterRow<T>> {
    protected readonly _defaultCellTemplate: string = 'Controls/grid:FooterColumnTemplate';

    //region Аспект "Стилевое оформление"
    getWrapperClasses(theme: string,
                      backgroundColorStyle: string,
                      style: string = 'default',
                      templateHighlightOnHover: boolean): string {
        let wrapperClasses = 'controls-GridView__footer__cell';

        wrapperClasses += this._getControlsBackgroundClass(style, backgroundColorStyle);

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses(theme)}`;
        }

        if (this.getOwner().getActionsTemplateConfig()?.itemActionsPosition === 'outside') {
            wrapperClasses += ' controls-GridView__footer__itemActionsV_outside';
        }

        wrapperClasses += this._getHorizontalPaddingClasses(theme);

        return wrapperClasses;
    }

    getWrapperStyles(containerSize?: number): string {
        return `${this.getColspanStyles()} ${(this._$isSingleCell && containerSize) ? `width: ${containerSize}px;` : ''}`;
    }

    getContentClasses(theme: string): string {
        return 'controls-GridView__footer__cell__content';
    }

    getInnerContentWrapperClasses(): string {
        return 'controls-GridView__footer__cell__inner-content-wrapper';
    }
    //endregion
}

Object.assign(FooterCell.prototype, {
    '[Controls/_display/grid/FooterCell]': true,
    _moduleName: 'Controls/grid:GridFooterCell',
    _instancePrefix: 'grid-footer-cell-'
});

export default FooterCell;
export {
    FooterCell,
    IBaseCellOptions as IFooterCellOptions
};
