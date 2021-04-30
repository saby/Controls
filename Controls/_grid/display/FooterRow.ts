import {TemplateFunction} from 'UI/Base';
import {isEqual} from 'Types/object';
import {IColumn, TColumns} from 'Controls/interface';
import {IItemActionsTemplateConfig} from 'Controls/display';
import Row from './Row';
import FooterCell, {IOptions as IFooterCellOptions} from 'Controls/_grid/display/FooterCell';
import {TColspanCallbackResult} from 'Controls/_grid/display/mixins/Grid';

export default class FooterRow<T> extends Row<string> {
    private _hasMoreData: boolean;
    private _actionsTemplateConfig: IItemActionsTemplateConfig;
    protected _$shouldAddFooterPadding: boolean;

    getContents(): string {
        return 'footer';
    }

    // TODO: Испавить вызов этого метода, разделить на 2 метода.
    setFooter(footerTemplate: TemplateFunction, footer?: TColumns): void {
        this.setRowTemplate(footerTemplate);
        this.setColumns(footer);
    }

    getItemClasses(): string {
        return 'controls-GridView__footer';
    }

    setHasMoreData(hasMoreData: boolean): void {
        if (this._hasMoreData !== hasMoreData) {
            this._hasMoreData = hasMoreData;
            this._nextVersion();
        }
    }

    setActionsTemplateConfig(config: IItemActionsTemplateConfig) {
        if (!isEqual(this._actionsTemplateConfig, config)) {
            this._actionsTemplateConfig = config;
            this._nextVersion();
        }
    }

    getActionsTemplateConfig(): IItemActionsTemplateConfig {
        return this._actionsTemplateConfig;
    }

    //region Аспект "Колонки. Создание, колспан."
    protected _initializeColumns(): void {
        super._initializeColumns({
            shouldAddStickyLadderCells: !this._$rowTemplate,
            addEmptyCellsForStickyLadder: true,
            extensionCellsConstructors: {
                stickyLadderCell: FooterCell,
                multiSelectCell: this.getColumnsFactory({column: {}})
            }
        });
    }

    protected _getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
        if (typeof column.colspan !== 'undefined') {
            return column.colspan;
        }
        if (typeof column.startColumn === 'number' && typeof column.endColumn === 'number') {
            return column.endColumn - column.startColumn;
        }
    }

    protected _getColumnFactoryParams(column: IColumn, columnIndex: number): Partial<IFooterCellOptions<T>> {
        return {
            ...super._getColumnFactoryParams(column, columnIndex),
            shouldAddFooterPadding: this._$shouldAddFooterPadding
        };
    }

    //endregion
}

Object.assign(FooterRow.prototype, {
    '[Controls/_display/grid/FooterRow]': true,
    _$shouldAddFooterPadding: false,
    _moduleName: 'Controls/display:GridFooterRow',
    _instancePrefix: 'grid-footer-row-',
    _cellModule: 'Controls/grid:GridFooterCell'
});
