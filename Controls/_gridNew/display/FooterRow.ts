import { TemplateFunction } from 'UI/Base';
import { isEqual } from 'Types/object';

import { IColspanParams } from 'Controls/interface';

import { IItemActionsTemplateConfig } from 'Controls/display';

import Row, {IOptions as IRowOptions} from './Row';
import Collection from './Collection';
import { IItemTemplateParams } from './mixins/Row';
import ItemActionsCell from './ItemActionsCell';

export type TFooter = IFooter[];

interface IFooter extends IColspanParams {
    startColumn?: number;
    endColumn?: number;
    template?: TemplateFunction;
}

export interface IOptions<T> extends IRowOptions<T> {
    owner: Collection<T>;
    footer?: TFooter;
    footerTemplate?: TemplateFunction;
}

export default class FooterRow<T> extends Row<T> {
    protected _$footerTemplate: TemplateFunction;
    protected _$footer: TFooter;

    private _hasMoreData: boolean;
    private _actionsTemplateConfig: IItemActionsTemplateConfig;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getContents(): T {
        return 'footer' as unknown as T;
    }

    setFooter(footerTemplate: TemplateFunction, footer?: TFooter): void {
        this._$footerTemplate = footerTemplate;
        this._$footer = footer;
        this._reinitializeColumns();
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

    getItemClasses(params: IItemTemplateParams = { theme: 'default' }): string {
        return 'controls-GridView__footer';
    }

    protected _getColspan(column: IFooter, columnIndex: number): number {
        return 0;
    }

    protected _initializeColumns(): void {
        if (this._$columns) {
            const factory = this.getColumnsFactory();

            if (this._$footer) {
                this._$columnItems = this._prepareColumnItems(this._$footer, factory);
            } else {
                this._$columnItems = [factory({
                    column: {
                        template: this._$footerTemplate
                    },
                    colspan: this._$owner.getColumnsConfig().length,
                    isFixed: true
                })];
            }

            if (this._$owner.hasMultiSelectColumn()) {
                this._$columnItems.unshift(factory({
                    column: {},
                    colspan: 0,
                    isFixed: true
                }));
            }
            if (this._$columns && this.hasItemActionsSeparatedCell()) {
                this._$columnItems.push(new ItemActionsCell({
                    owner: this,
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
    _cellModule: 'Controls/gridNew:GridFooterCell',
    _$footerTemplate: null,
    _$footer: null
});
