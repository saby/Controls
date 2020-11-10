import { TemplateFunction } from 'UI/Base';
import { mixin } from 'Types/util';
import { OptionsToPropertyMixin } from 'Types/entity';
import GridResults from "./GridResults";
import { Model as EntityModel } from 'Types/entity';

export interface IOptions<T> {
    owner: GridResults<T>;
    template?: TemplateFunction;
    align?: string;
    displayProperty?: string;
    // ToDo | Временная опция для обеспечения вывода общего шаблона строки результатов.
    //      | При разработке мультизаговков colspan будет сделан единообразно и для результатов.
    colspan?: boolean;
}

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:ResultColumnTemplate';

export default class GridResultsCell<T> extends mixin<OptionsToPropertyMixin>(OptionsToPropertyMixin) {
    protected _$owner: GridResults<T>;
    protected _$template: TemplateFunction;
    protected _$align: string;
    protected _$data: string|number;
    protected _$format: string;
    protected _$displayProperty: string;
    protected _$colspan: boolean;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
        this._prepareDataAndFormat();
    }

    getResults(): EntityModel {
        return this._$owner.getResults();
    }

    getCellIndex(): number {
        return this._$owner.getCellIndex(this);
    }

    isFirstColumn(): boolean {
        return this.getCellIndex() === 0;
    }

    isLastColumn(): boolean {
        return this.getCellIndex() === this._$owner.getCellsCount() - 1;
    }

    isMultiSelectColumn(): boolean {
        return this._$owner.getMultiSelectVisibility() !== 'hidden' && this.isFirstColumn();
    }

    getWrapperClasses(theme: string, style: string = 'default'): string {
        let wrapperClasses = `controls-Grid__results-cell controls-Grid__cell_${style}`;

        const isMultiSelectColumn = this.isMultiSelectColumn();
        const isStickySupport = false;

        wrapperClasses += ` controls-Grid__results-cell_theme-${theme}`;

        if (this._$align) {
            wrapperClasses += ` controls-Grid__row-cell__content_halign_${this._$align}`;
        }

        if (!isStickySupport) {
            wrapperClasses += ' controls-Grid__header-cell_static';
        }


        if (isMultiSelectColumn) {
            wrapperClasses += ' controls-Grid__results-cell-checkbox' + `_theme-${theme}`;
        } else {
            wrapperClasses += this._getWrapperPaddingClasses(theme);
        }

        // todo add resultsFormat to here

        return wrapperClasses;
    }

    getWrapperStyles(): string {
        if (this._$colspan) {
            return `grid-column: 1 / ${this._$owner.getColumnsCount() + 1}`;
        }
        return '';
    }

    getContentClasses(theme: string): string {
        return `controls-Grid__results-cell__content controls-Grid__results-cell__content_theme-${theme}`;
    }

    get data(): string|number {
        return this._$data;
    }

    get format(): string {
        return this._$format;
    }

    getTemplate(): TemplateFunction|string {
        return this._$template || DEFAULT_CELL_TEMPLATE;
    }

    getTemplateOptions(): {} {
        return {};
    }

    protected _prepareDataAndFormat(): void {
        const results = this.getResults();
        const displayProperty = this._$displayProperty;
        if (results && displayProperty) {
            const metaResultsFormat = results.getFormat();
            const displayPropertyFormatIndex = metaResultsFormat.getIndexByValue('name', displayProperty);
            this._$data = results.get(displayProperty);
            if (displayPropertyFormatIndex !== -1) {
                this._$format = metaResultsFormat.at(displayPropertyFormatIndex).getType() as string;
            }
        }
    }

    protected _getWrapperPaddingClasses(theme: string): string {
        let paddingClasses = '';
        const leftPadding = this._$owner.getLeftPadding();
        const rightPadding = this._$owner.getRightPadding();
        const isMultiSelectColumn = this.isMultiSelectColumn();
        const isFirstColumn = this.isFirstColumn();
        const isLastColumn = this.isLastColumn();

        // todo <<< START >>> need refactor css classes names
        const compatibleLeftPadding = leftPadding === 'default' ? '' : leftPadding;
        const compatibleRightPadding = rightPadding === 'default' ? '' : rightPadding;
        // todo <<< END >>>

        // left padding
        if (!isMultiSelectColumn) {
            if (!this.isFirstColumn()) {
                if (this._$owner.getMultiSelectVisibility() === 'hidden' || this.getCellIndex() > 1) {
                    paddingClasses += ` controls-Grid__cell_spacingLeft${compatibleLeftPadding}_theme-${theme}`;
                }
            } else {
                paddingClasses += ` controls-Grid__cell_spacingFirstCol_${leftPadding}_theme-${theme}`;
            }
        }

        // right padding
        if (isLastColumn) {
            paddingClasses += ` controls-Grid__cell_spacingLastCol_${rightPadding}_theme-${theme}`;
        } else {
            paddingClasses += ` controls-Grid__cell_spacingRight${compatibleRightPadding}_theme-${theme}`;
        }

        return paddingClasses;
    }
}

Object.assign(GridResultsCell.prototype, {
    _moduleName: 'Controls/display:GridResultsCell',
    _instancePrefix: 'grid-results-cell-',
    _$owner: null,
    _$template: null,
    _$align: null,
    _$data: null,
    _$format: null,
    _$displayProperty: null,
    _$colspan: null,
});
