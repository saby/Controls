import { TemplateFunction } from 'UI/Base';
import Row, {IOptions as IRowOptions} from './Row';
import Collection from './Collection';
import { IColspanParams } from '../../_grid/interface/IColumn';

export type TFooter = IFooter[];

interface IFooter extends IColspanParams {
}

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
        return 'footer' as unknown as T
    }

    // TODO: Переделать параметры на объект
    getWrapperClasses(templateHighlightOnHover: boolean = true,
                      theme?: string,
                      cursor: string = 'pointer',
                      backgroundColorStyle?: string,
                      style: string = 'default'): string {
        /* todo
        // Для предотвращения скролла одной записи в таблице с экшнами.
        // _options._needBottomPadding почему-то иногда не работает.
        if ((this._listModel.getCount() || this._listModel.isEditing()) &&
            this._options.itemActionsPosition === 'outside' &&
            !this._options._needBottomPadding &&
            this._options.resultsPosition !== 'bottom') {
            classList = classList.add(`controls-GridView__footer__itemActionsV_outside_theme-${this._options.theme}`);
        }*/
        return `controls-GridView__footer`;
    }

    protected _getColspanParams(column: IFooter, columnIndex: number): IColspanParams {
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

        if (colspan) {
            return {
                colspan
            }
        }
    }

    _initializeColumns(): void {
        if (this._$columns) {
            const factory = this._getColumnsFactory();

            if (this._$footerTemplate) {
                this._$columnItems = [factory({
                    column: {
                        template: this._$footerTemplate
                    },
                    colspan: this._$owner.getColumnsConfig().length
                })];
            } else {
                this._$columnItems = this._prepareColumnItems(this._$footer, factory);
            }

            if (this._$owner.needMultiSelectColumn()) {
                this._$columnItems.unshift(factory({
                    column: {}
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
