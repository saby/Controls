import GridColumn, { IOptions as IColumnOptions } from './GridColumn';
import { OptionsToPropertyMixin }  from 'Types/entity';
import { TemplateFunction } from 'UI/Base';

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:StickyLadderColumnTemplate';

export interface IOptions<T> extends IColumnOptions<T> {
    style: string;
    stickyProperty: string; // из grid/item.wml
}

export default class GridLadderColumn<T> extends GridColumn<T> {
    protected _$style: string;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
    }

    getWrapperClasses(theme: string, backgroundColorStyle?: string, style: string = 'default'): string {
        let wrapperClasses = 'controls-Grid__row-ladder-cell';
        wrapperClasses += this._getWrapperSeparatorClasses(theme);
        return wrapperClasses;
    }

    getContentClasses(theme: string, cursor: string = 'pointer', templateHighlightOnHover: boolean = true): string {
        let contentClasses = 'controls-Grid__row-main_ladderWrapper';
        return contentClasses;
    }

    getOriginalContentClasses(theme: string, cursor: string = 'pointer', templateHighlightOnHover: boolean = true): string {
        const topPadding = this._$owner.getTopPadding();
        let contentClasses = super.getContentClasses.apply(this, arguments);
        contentClasses += ' controls-Grid__row-ladder-cell__content';
        contentClasses += ` controls-Grid__row-ladder-cell__content_${topPadding}_theme-${theme}`;
        return contentClasses;
    }

    getWrapperStyles(): string {
        return this._$style;
    }

    getTemplate(multiSelectTemplate?: TemplateFunction): TemplateFunction|string {
        return DEFAULT_CELL_TEMPLATE;
    }

    getOriginalTemplate(): TemplateFunction|string {
        return super.getTemplate();
    }

    shouldDisplayMarker(): boolean {
        return false;
    }

    shouldDisplayItemActions(): boolean {
        return false;
    }
}

Object.assign(GridLadderColumn.prototype, {
    '[Controls/_display/GridLadderColumn]': true,
    _moduleName: 'Controls/display:GridLadderColumn',
    _instancePrefix: 'grid-ladder-column-',
    _$style: null
});
