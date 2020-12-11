import { TemplateFunction } from 'UI/Base';
import Row, {IOptions as IRowOptions} from './Row';
import Collection from './Collection';

export interface IOptions<T> extends IRowOptions<T> {
    owner: Collection<T>;
    footer?: TFooter;
    footerTemplate?: TemplateFunction;
}

export default class FooterRow<T> extends Row<T> {
    protected '[Controls/_display/IEditableCollectionItem]': boolean = false;
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
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
        const classList = ['controls-GridView__footer'];
        if (this._$owner.isNeedSpaceAfterBody() && !this._$owner.getSpaceAfterBody() &&
            this.getResultsPosition() !== 'bottom') {
            classList.push(`controls-GridView__footer__itemActionsV_outside_theme-${theme}`);
        }
        return classList.join(' ');
    }

    _initializeColumns(): void {
        if (this._$columns) {
            const factory = this._getColumnsFactory();
            this._$columnItems = [];

            if (this._$footerTemplate) {
                if (this._$owner.needMultiSelectColumn()) {
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

Object.assign(FooterRow.prototype, {
    '[Controls/_display/grid/FooterRow]': true,
    _moduleName: 'Controls/display:GridFooterRow',
    _instancePrefix: 'grid-footer-row-',
    _cellModule: 'Controls/display:GridFooterCell',
    _$footerTemplate: null,
    _$footer: null
});
