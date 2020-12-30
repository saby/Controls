import { TemplateFunction } from 'UI/Base';
import Row, {IOptions as IRowOptions} from './Row';
import Collection from './Collection';
import { IColspanParams } from '../../_grid/interface/IColumn';
import { IItemTemplateParams } from './mixins/Row';

export type TFooter = IFooter[];

interface IFooter extends IColspanParams {}

export interface IOptions<T> extends IRowOptions<T> {
    owner: Collection<T>;
    footer?: TFooter;
    footerTemplate?: TemplateFunction;
}

export default class FooterRow<T> extends Row<T> {
    protected _$footerTemplate: TemplateFunction;
    protected _$footer: TFooter;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getContents(): T {
        return 'footer' as unknown as T;
    }

    setFooter(footerTemplate: TemplateFunction, footer: TFooter): void {
        this._$footerTemplate = footerTemplate;
        this._$footer = footer;
        this._reinitializeColumns();
    }

    getItemClasses(params: IItemTemplateParams = { theme: 'default' }): string {
        return 'controls-GridView__footer';
    }

    protected _getColspan(column: IFooter, columnIndex: number): number {
        let colspan = 0;

        if (column.startColumn && column.endColumn) {
            colspan = column.endColumn - column.startColumn;
        } else if (column.colspan) {
            colspan = column.colspan;
        }

        if (columnIndex === 0) {
            const stickyLadderProperties = this.getStickyLadderProperties(column);
            const stickyLadderStyleForFirstProperty = stickyLadderProperties &&
                this._getStickyLadderStyle(column, stickyLadderProperties[0]);
            const stickyLadderStyleForSecondProperty = stickyLadderProperties && stickyLadderProperties.length === 2 &&
                this._getStickyLadderStyle(column, stickyLadderProperties[1]);

            if (stickyLadderStyleForFirstProperty) {
                colspan++;
            }

            if (stickyLadderStyleForSecondProperty) {
                colspan++;
            }
        }

        return colspan;
    }

    protected _initializeColumns(): void {
        if (this._$columns) {
            const factory = this._getColumnsFactory();

            if (this._$footerTemplate) {
                this._$columnItems = [factory({
                    column: {
                        template: this._$footerTemplate
                    },
                    colspan: this._$owner.getColumnsConfig().length,
                    isFixed: true
                })];
            } else {
                this._$columnItems = this._prepareColumnItems(this._$footer, factory);
            }

            if (this._$owner.hasMultiSelectColumn()) {
                this._$columnItems.unshift(factory({
                    column: {},
                    isFixed: true
                }));
            }
        }
    }
}

Object.assign(FooterRow.prototype, {
    '[Controls/_display/grid/FooterRow]': true,
    _moduleName: 'Controls/display:GridFooterRow',
    _instancePrefix: 'grid-footer-row-',
    _cellModule: 'Controls/display:GridFooterCell',
    _$footerTemplate: null,
    _$footer: null
});
