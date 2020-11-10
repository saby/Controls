import { TemplateFunction } from 'UI/Base';
import { mixin } from 'Types/util';
import { OptionsToPropertyMixin } from 'Types/entity';
import GridCollection from './GridCollection';
import { TColumns } from 'Controls/grid';
import GridResultsCell from './GridResultsCell';
import { Model as EntityModel } from 'Types/entity';

type TResultsCells<T> = Array<GridResultsCell<T>>;

export type TResultsPosition = 'top' | 'bottom';

export interface IOptions<T> {
    owner: GridCollection<T>;
    resultsTemplate: TemplateFunction;
    results: EntityModel;
}

export default class GridResults<T> extends mixin<OptionsToPropertyMixin>(OptionsToPropertyMixin) {
    protected _$owner: GridCollection<T>;
    protected _$cells: TResultsCells<T>;
    protected _$results: EntityModel;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
        this._$cells = this._prepareCells(this._$owner.getColumns(), options.resultsTemplate);
    }

    getBodyClasses(theme: string): string {
        return `controls-Grid__results`;
    }

    getCells(): TResultsCells<T> {
        return this._$cells;
    }

    getCellIndex(cell: GridResultsCell<T>): number {
        return this._$cells.indexOf(cell);
    }

    getColumnsCount(): number {
        return this._$owner.getColumns().length;
    }

    getCellsCount(): number {
        return this._$cells.length;
    }

    getTopPadding(): string {
        return this._$owner.getTopPadding().toLowerCase();
    }

    getBottomPadding(): string {
        return this._$owner.getBottomPadding().toLowerCase();
    }

    getLeftPadding(): string {
        return this._$owner.getLeftPadding().toLowerCase();
    }

    getRightPadding(): string {
        return this._$owner.getRightPadding().toLowerCase();
    }

    getMultiSelectVisibility(): string {
        return this._$owner.getMultiSelectVisibility();
    }

    isStickyHeader(): boolean {
        return this._$owner.isStickyHeader();
    }

    getResults(): EntityModel {
        return this._$results;
    }

    protected _prepareCells(columns: TColumns, resultsTemplate: TemplateFunction): TResultsCells<T> {
        const cells = [];
        if (this._$owner.getMultiSelectVisibility()) {
            cells.push(new GridResultsCell({
                owner: this
            }));
        }
        if (resultsTemplate) {
            const cell = new GridResultsCell({
                template: resultsTemplate,
                owner: this,
                // ToDo | Временная опция для обеспечения вывода общего шаблона строки результатов.
                //      | При разработке мультизаговков colspan будет сделан единообразно и для результатов.
                colspan: true
            });
            cells.push(cell);
            return cells;
        }
        columns.forEach((elem) => {
            const cell = new GridResultsCell({
                template: elem.resultTemplate,
                displayProperty: elem.displayProperty,
                align: elem.align,
                owner: this
            });
            cells.push(cell);
        });
        return cells;
    }
}

Object.assign(GridResults.prototype, {
    _moduleName: 'Controls/display:GridResults',
    _$results: null,
    _$owner: null
});
