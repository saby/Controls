import { TemplateFunction } from 'UI/Base';
import { Model as EntityModel } from 'Types/entity';
import ResultsRow from './ResultsRow';
import Cell from './Cell';

export interface IOptions<T> {
    owner: ResultsRow<T>;
    template?: TemplateFunction;
    align?: string;
    displayProperty?: string;
}

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:ResultColumnTemplate';
const FIXED_RESULTS_Z_INDEX = 4;
const STICKY_RESULTS_Z_INDEX = 3;

export default class ResultsCell<T> extends Cell<T, ResultsRow<T>> {
    protected _$data: string|number;
    protected _$format: string;

    constructor(options?: IOptions<T>) {
        super(options);
        this._prepareDataAndFormat();
    }

    get data(): string | number {
        return this._$data;
    }

    get format(): string {
        return this._$format;
    }

    getResults(): EntityModel {
        return this._$owner.getResults();
    }

    getTemplate(): TemplateFunction|string {
        return this._$column.resultTemplate || DEFAULT_CELL_TEMPLATE;
    }

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        const isMultiSelectColumn = this.isMultiSelectColumn();

        if (isMultiSelectColumn) {
            return `controls-Grid__results-cell-checkbox_theme-${theme}`;
        }

        const leftPadding = this._$owner.getLeftPadding();
        const rightPadding = this._$owner.getRightPadding();

        // todo <<< START >>> need refactor css classes names
        const compatibleLeftPadding = leftPadding === 'default' ? '' : leftPadding;
        const compatibleRightPadding = rightPadding === 'default' ? '' : rightPadding;
        // todo <<< END >>>

        let wrapperClasses = 'controls-Grid__results-cell'
                            + ` controls-Grid__cell_${style}`
                            + ` controls-Grid__results-cell_theme-${theme}`;


        if (this._$column.align) {
            wrapperClasses += ` controls-Grid__row-cell__content_halign_${this._$align}`;
        }

        if (!this._$owner.isSticked()) {
            wrapperClasses += ' controls-Grid__header-cell_static';
        }

            if (!this.isFirstColumn()) {
                if (this._$owner.getMultiSelectVisibility() === 'hidden' || this.getColumnIndex() > 1) {
                    wrapperClasses += ` controls-Grid__cell_spacingLeft${compatibleLeftPadding}_theme-${theme}`;
                }
            } else {
                wrapperClasses += ` controls-Grid__cell_spacingFirstCol_${leftPadding}_theme-${theme}`;
            }


        // right padding
        if (this.isLastColumn()) {
            wrapperClasses += ` controls-Grid__cell_spacingLastCol_${rightPadding}_theme-${theme}`;
        } else {
            wrapperClasses += ` controls-Grid__cell_spacingRight${compatibleRightPadding}_theme-${theme}`;
        }

        // todo add resultsFormat to here

        if (this._$owner.hasColumnScroll()){
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses(theme)}`;
            wrapperClasses += ` ${this._getBackgroundColorWrapperClasses(backgroundColorStyle, theme)}`;
        }

        return wrapperClasses;
    }

    getWrapperStyles(): string {
        let zIndex;
        if (this._$owner.hasColumnScroll()) {
            zIndex = this._isFixedCell() ? FIXED_RESULTS_Z_INDEX : STICKY_RESULTS_Z_INDEX;
        } else {
            zIndex = FIXED_RESULTS_Z_INDEX;
        }
        return `${super.getWrapperStyles()} z-index: ${zIndex};`;
    }

    getContentClasses(theme: string): string {
        return `controls-Grid__results-cell__content controls-Grid__results-cell__content_theme-${theme}`;
    }

    protected _prepareDataAndFormat(): void {
        const results = this.getResults();
        const displayProperty = this._$column && this._$column.displayProperty;
        if (results && displayProperty) {
            const metaResultsFormat = results.getFormat();
            const displayPropertyFormatIndex = metaResultsFormat.getIndexByValue('name', displayProperty);
            this._$data = results.get(displayProperty);
            if (displayPropertyFormatIndex !== -1) {
                this._$format = metaResultsFormat.at(displayPropertyFormatIndex).getType() as string;
            }
        }
    }
}

Object.assign(ResultsCell.prototype, {
    '[Controls/_display/grid/ResultsCell]': true,
    _moduleName: 'Controls/display:GridResultsCell',
    _instancePrefix: 'grid-results-cell-',
    _$data: null,
    _$format: null
});
