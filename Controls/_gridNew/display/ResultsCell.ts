import { TemplateFunction } from 'UI/Base';
import { Model as EntityModel } from 'Types/entity';
import ResultsRow from './ResultsRow';
import Cell, {IOptions as ICellOptions} from './Cell';

export interface IOptions<T> extends ICellOptions<T> {
    owner: ResultsRow<T>;
    template?: TemplateFunction;
    align?: string;
    displayProperty?: string;
    metaResults?: EntityModel;
}

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:ResultColumnTemplate';
const FIXED_RESULTS_Z_INDEX = 4;
const STICKY_RESULTS_Z_INDEX = 3;

export default class ResultsCell<T> extends Cell<T, ResultsRow<T>> {
    protected _$data: string|number;
    protected _$format: string;
    protected _$metaResults: EntityModel;

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

    setMetaResults(metaResults: EntityModel): void {
        this._$metaResults = metaResults;
        this._prepareDataAndFormat();
        this._nextVersion();
    }

    getMetaResults(): EntityModel {
        return this._$metaResults;
    }

    getTemplate(): TemplateFunction|string {
        return this._$column.resultTemplate || DEFAULT_CELL_TEMPLATE;
    }

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        const isMultiSelectColumn = this.isMultiSelectColumn();

        if (isMultiSelectColumn) {
            return `controls-Grid__results-cell-checkbox_theme-${theme}`;
        }

        let wrapperClasses = 'controls-Grid__results-cell'
                            + ` controls-Grid__cell_${style}`
                            + ` controls-Grid__results-cell_theme-${theme}`
                            + ` ${this._getWrapperPaddingClasses(theme)}`
                            + ` ${this._getColumnSeparatorClasses(theme)}`
                            + ` controls-background-${backgroundColorStyle || style}_theme-${theme}`;

        if (this._$column.align) {
            wrapperClasses += ` controls-Grid__row-cell__content_halign_${this._$column.align}`;
        }

        if (!this._$owner.isSticked()) {
            wrapperClasses += ' controls-Grid__header-cell_static';
        }

        // todo add resultsFormat to here

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses(theme)}`;
        }

        return wrapperClasses;
    }

    _getWrapperPaddingClasses(theme: string): string {
        // Для ячейки, создаваемой в связи с множественной лесенкой не нужны отступы, иначе будут проблемы с наложением
        // тени: https://online.sbis.ru/opendoc.html?guid=758f38c7-f5e7-447e-ab79-d81546b9f76e
        if (this._$ladderCell) {
            return '';
        }

        let classes = '';

        const leftPadding = this._$owner.getLeftPadding();
        const rightPadding = this._$owner.getRightPadding();

        // todo <<< START >>> need refactor css classes names
        const compatibleLeftPadding = leftPadding === 'default' ? '' : leftPadding;
        const compatibleRightPadding = rightPadding === 'default' ? '' : rightPadding;
        // todo <<< END >>>

        if (!this.isFirstColumn()) {
            if (this._$owner.getMultiSelectVisibility() === 'hidden' || this.getColumnIndex() > 1) {
                classes += ` controls-Grid__cell_spacingLeft${compatibleLeftPadding}_theme-${theme}`;
            }
        } else {
            classes += ` controls-Grid__cell_spacingFirstCol_${leftPadding}_theme-${theme}`;
        }

        // right padding
        if (this.isLastColumn()) {
            classes += ` controls-Grid__cell_spacingLastCol_${rightPadding}_theme-${theme}`;
        } else {
            classes += ` controls-Grid__cell_spacingRight${compatibleRightPadding}_theme-${theme}`;
        }

        return classes;
    }

    getWrapperStyles(): string {
        return `${super.getWrapperStyles()} z-index: ${this.getZIndex()};`;
    }
    getZIndex(): number {
        let zIndex;
        if (this._$owner.hasColumnScroll()) {
            zIndex = this._$isFixed ? FIXED_RESULTS_Z_INDEX : STICKY_RESULTS_Z_INDEX;
        } else {
            zIndex = FIXED_RESULTS_Z_INDEX;
        }
        return zIndex;
    }
    getContentClasses(theme: string): string {
        return `controls-Grid__results-cell__content controls-Grid__results-cell__content_theme-${theme}`;
    }

    protected _prepareDataAndFormat(): void {
        const results = this.getMetaResults();
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
    _moduleName: 'Controls/gridNew:GridResultsCell',
    _instancePrefix: 'grid-results-cell-',
    _$metaResults: null,
    _$data: null,
    _$format: null
});
