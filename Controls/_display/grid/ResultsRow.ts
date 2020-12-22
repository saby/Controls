import { TemplateFunction } from 'UI/Base';
import { Model as EntityModel } from 'Types/entity';
import Collection from './Collection';
import Row from './Row';


export type TResultsPosition = 'top' | 'bottom';

export interface IOptions<T> {
    owner: Collection<T>;
    resultsTemplate: TemplateFunction;
    results: EntityModel;
}

export default class ResultsRow<T> extends Row<T> {
    protected _$results: EntityModel;
    protected _$resultsTemplate: TemplateFunction;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getContents(): T {
        return 'results' as unknown as T
    }

    isSticked(): boolean {
        return this.isStickyHeader() && this.getResultsPosition() === 'top';
    }

    getItemClasses(): string {
        return `controls-Grid__results`;
    }

    getResults(): EntityModel {
        return this._$results;
    }

    protected _initializeColumns(): void {
        if (this._$columns) {
            const factory = this._getColumnsFactory();

            if (this._$resultsTemplate) {
                this._$columnItems = [factory({
                    column: {
                        resultTemplate: this._$resultsTemplate,
                        colspan: this._$owner.getColumnsConfig().length
                    },
                })];
            } else {
                this._$columnItems = this._$owner.getColumnsConfig().map((column) => factory({
                    column,
                }));
            }

            if (this._$owner.needMultiSelectColumn()) {
                this._$columnItems.unshift(factory({
                    column: {}
                }));
            }
        }
    }
}

Object.assign(ResultsRow.prototype, {
    '[Controls/_display/grid/ResultsRow]': true,
    _moduleName: 'Controls/display:GridResults',
    _cellModule: 'Controls/display:GridResultsCell',
    _$results: null,
    _$resultsTemplate: null
});
