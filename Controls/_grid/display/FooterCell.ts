import FooterRow from './FooterRow';
import Cell from './Cell';
import { IColspanParams } from 'Controls/interface';

export default class FooterCell<T> extends Cell<T, FooterRow<T>> {
    protected readonly DEFAULT_CELL_TEMPLATE: string = 'Controls/grid:FooterColumnTemplate';

    // TODO: Не undefined, строка и индекс ячейки.
    getInstanceId(): string {
        return undefined;
    }

    // TODO: Это что? Вроде не нужно нигде, нужно удалить.
    _getColspanParams(): IColspanParams {
        if (this._$column.startColumn && this._$column.endColumn) {
            const multiSelectOffset = this._$owner.hasMultiSelectColumn() ? 1 : 0;
            return {
                startColumn: this._$column.startColumn + multiSelectOffset,
                endColumn: this._$column.endColumn + multiSelectOffset
            };
        }
        return super._getColspanParams();
    }

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        let wrapperClasses = 'controls-GridView__footer__cell';

        if (backgroundColorStyle) {
            wrapperClasses += ` controls-background-${backgroundColorStyle}`;
        }

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
        return `${this.getColspan()} ${(this._$isSingleCell && containerSize) ? `width: ${containerSize}px;` : ''}`;
    }

    getContentClasses(theme: string): string {
        return 'controls-Grid__footer-cell__content';
    }
}

Object.assign(FooterCell.prototype, {
    '[Controls/_display/grid/FooterCell]': true,
    _moduleName: 'Controls/gridNew:GridFooterCell',
    _instancePrefix: 'grid-footer-cell-'
});
