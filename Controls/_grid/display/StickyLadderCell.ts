import { IOptions as ICellOptions } from './Cell';
import { OptionsToPropertyMixin }  from 'Types/entity';
import { TemplateFunction } from 'UI/Base';
import DataRow from './DataRow';
import DataCell from './DataCell';

const DEFAULT_CELL_TEMPLATE = 'Controls/grid:StickyLadderColumnTemplate';

export interface IOptions<T> extends ICellOptions<T> {
    wrapperStyle: string;
    contentStyle?: string;
    stickyProperty: string;
    stickyHeaderZIndex: number;
}

export default class StickyLadderCell<T, TOwner extends DataRow<T>> extends DataCell<T, TOwner> {
    readonly Markable: boolean = false;

    protected _$wrapperStyle: string;
    protected _$contentStyle: string;
    protected _$stickyProperty: string;
    protected _$stickyHeaderZIndex: number;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
    }

    getWrapperClasses(theme: string, backgroundColorStyle?: string, style: string = 'default'): string {
        let wrapperClasses = 'controls-Grid__row-ladder-cell';
        wrapperClasses += this._getWrapperSeparatorClasses();
        wrapperClasses += this._getColumnScrollWrapperClasses();
        return wrapperClasses;
    }

    getStickyContentClasses(theme: string, cursor: string = 'pointer', templateHighlightOnHover: boolean = true): string {
        let contentClasses = 'controls-Grid__row-main_ladderWrapper';
        return contentClasses;
    }

    getContentClasses(theme: string, cursor: string = 'pointer', templateHighlightOnHover: boolean = true): string {
        let contentClasses = 'controls-Grid__row-main_ladderWrapper';
        return '';
    }

    getOriginalContentClasses(theme: string, cursor: string = 'pointer', templateHighlightOnHover: boolean = true): string {
        const topPadding = this._$owner.getTopPadding();
        let contentClasses = super.getContentClasses(theme, cursor, false);
        contentClasses += ' controls-Grid__row-ladder-cell__content';
        contentClasses += ` controls-Grid__row-ladder-cell__content_${topPadding}`;
        return contentClasses;
    }

    getWrapperStyles(): string {
        return this._$wrapperStyle;
    }

    getStickyContentStyles(): string {
        return this._$contentStyle;
    }

    getContentStyles(): string {
        return '';
    }

    getStickyProperty(): string {
        return this._$stickyProperty;
    }

    getStickyHeaderClasses(theme: string = 'default'): string {
        let classes = '';
        const stickyLadder = this._$owner.getStickyLadder();
        const stickyProperties = this._$owner.getStickyLadderProperties(this._$column);
        const hasMainCell = !!(stickyLadder[stickyProperties[0]].ladderLength);
        const hasHeader = this._$owner.hasHeader();
        const hasTopResults = this._$owner.getResultsPosition() === 'top';
        const hasGroup = this._$owner.hasStickyGroup();
        if (!hasMainCell) {
            classes += ` controls-Grid__row-cell__ladder-spacing${hasHeader ? '_withHeader' : ''}${hasTopResults ? '_withResults' : ''}${hasGroup ? '_withGroup' : ''}`;
        } else if (hasGroup) {
            classes += ' controls-Grid__row-cell__ladder-main_spacing_withGroup';
        }
        return classes;
    }

    getStickyHeaderStyles(): string {
        return `z-index: ${ this._$stickyHeaderZIndex + (this._$isFixed ? 2 : 0)};`;
    }

    getTemplate(multiSelectTemplate?: TemplateFunction): TemplateFunction|string {
        return DEFAULT_CELL_TEMPLATE;
    }

    getOriginalTemplate(): TemplateFunction|string {
        return super.getTemplate();
    }

    shouldDisplayItemActions(): boolean {
        return false;
    }
}

Object.assign(StickyLadderCell.prototype, {
    '[Controls/_display/StickyLadderCell]': true,
    _moduleName: 'Controls/display:GridStickyLadderCell',
    _instancePrefix: 'grid-ladder-cell-',
    _$wrapperStyle: '',
    _$contentStyle: '',
    _$stickyProperty: '',
    _$stickyHeaderZIndex: null
});
