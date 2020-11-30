import { TemplateFunction } from 'UI/Base';
import GridRow, {IOptions as IGridRowOptions} from './GridRow';
import GridCollection from './GridCollection';

export interface IOptions<T> extends IGridRowOptions<T> {
    owner: GridCollection<T>;
    footer?: TFooter;
    footerTemplate?: TemplateFunction;
}

export default class GridFooterRow<T> extends GridRow<T> {
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

    _initializeColumns(): void {
        if (this._$columns) {
            const factory = this._getColumnsFactory();
            this._$columnItems = [];

            if (this._$footerTemplate) {
                if (this._$owner.getMultiSelectVisibility() !== 'hidden') {
                    this._$columnItems.push(factory({
                        column: {}
                    }));
                }
                this._$columnItems.push(factory({
                    column: {
                        template: this._$footerTemplate,
                        colspan: this._$owner.getColumnsConfig().length
                    }
                }));
            } else {
                this._$columnItems = this.prepareColspanedColumns(this._$footer).map((footerColumn) => factory({
                    column: footerColumn
                }));
            }
        }
    }
}

Object.assign(GridFooterRow.prototype, {
    _moduleName: 'Controls/display:GridFooterRow',
    _instancePrefix: 'grid-footer-row-',
    _cellModule: 'Controls/display:GridFooterCell',
    _$footerTemplate: null,
    _$footer: null
});
