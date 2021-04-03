import {TemplateFunction} from 'UI/Base';
import {Model as EntityModel} from 'Types/entity';
import ResultsRow from './ResultsRow';
import Cell, {IOptions as IBaseCellOptions} from './Cell';

interface IResultsCellOptions<T> extends IBaseCellOptions<T> {
    metaResults?: EntityModel;
}

const FIXED_RESULTS_Z_INDEX = 4;
const STICKY_RESULTS_Z_INDEX = 3;

class ResultsCell<T extends EntityModel<any>> extends Cell<T, ResultsRow<T>> {
    protected readonly DEFAULT_CELL_TEMPLATE: string = 'Controls/grid:ResultColumnTemplate';
    protected _$metaResults: EntityModel;
    protected _data: string | number;
    protected _format: string;

    constructor(options?: IResultsCellOptions<T>) {
        super(options);
        this._prepareDataAndFormat();
    }

    // TODO: Рассмотреть возможность перевода на отдельную опцию.
    //  Перегрузка необходима из за того, что конфигурация результатов объединена с колонками.
    //  Если результаты будут иметь отдельную опцию под конфиг, то будет полная однородность, метод будет не нужен.
    getTemplate(): TemplateFunction | string {
        const customTemplate = this._$isSingleCell ? this._$column.template : this._$column.resultTemplate;
        return customTemplate || this.DEFAULT_CELL_TEMPLATE;
    }

    //region Аспект "Данные и формат"
    get data(): string | number {
        return this._data;
    }

    get format(): string {
        return this._format;
    }

    setMetaResults(metaResults: EntityModel): void {
        this._$metaResults = metaResults;
        this._prepareDataAndFormat();
        this._nextVersion();
    }

    getMetaResults(): EntityModel {
        return this._$metaResults;
    }

    protected _prepareDataAndFormat(): void {
        const results = this.getMetaResults();
        const displayProperty = this._$column && this._$column.displayProperty;
        if (results && displayProperty) {
            const metaResultsFormat = results.getFormat();
            const displayPropertyFormatIndex = metaResultsFormat.getIndexByValue('name', displayProperty);
            this._data = results.get(displayProperty);
            if (displayPropertyFormatIndex !== -1) {
                this._format = metaResultsFormat.at(displayPropertyFormatIndex).getType() as string;
            }
        }
    }

    //endregion

    //region Аспект "Стилевое оформление"
    getWrapperClasses(theme: string,
                      backgroundColorStyle: string,
                      style: string = 'default',
                      templateHighlightOnHover: boolean): string {
        const isMultiSelectColumn = this.isMultiSelectColumn();

        if (isMultiSelectColumn) {
            return 'controls-Grid__results-cell-checkbox';
        }

        let wrapperClasses = 'controls-Grid__results-cell'
                            + ` controls-Grid__cell_${style}`
                            + ` ${this._getWrapperPaddingClasses(theme)}`
                            + ` ${this._getColumnSeparatorClasses(theme)}`
                            + ` controls-background-${backgroundColorStyle || style}`;

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
                classes += ` controls-Grid__cell_spacingLeft${compatibleLeftPadding}`;
            }
        } else {
            classes += ` controls-Grid__cell_spacingFirstCol_${leftPadding}`;
        }

        // right padding
        if (this.isLastColumn()) {
            classes += ` controls-Grid__cell_spacingLastCol_${rightPadding}`;
        } else {
            classes += ` controls-Grid__cell_spacingRight${compatibleRightPadding}`;
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
        return 'controls-Grid__results-cell__content controls-Grid__results-cell__content';
    }

    //endregion
}

Object.assign(ResultsCell.prototype, {
    '[Controls/_display/grid/ResultsCell]': true,
    _moduleName: 'Controls/gridNew:GridResultsCell',
    _instancePrefix: 'grid-results-cell-',
    _$metaResults: null
});

export default ResultsCell;
export {
    ResultsCell,
    IResultsCellOptions
};
