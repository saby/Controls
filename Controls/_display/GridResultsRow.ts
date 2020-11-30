import { TemplateFunction } from 'UI/Base';
import { Model as EntityModel } from 'Types/entity';
import GridCollection from './GridCollection';
import GridRow from './GridRow';


export type TResultsPosition = 'top' | 'bottom';

export interface IOptions<T> {
    owner: GridCollection<T>;
    resultsTemplate: TemplateFunction;
    results: EntityModel;
}

export default class GridResultsRow<T> extends GridRow<T> {
    protected _$results: EntityModel;
    protected _$resultsTemplate: TemplateFunction;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getContents(): T {
        return 'results' as unknown as T
    }

    getTemplate(): TemplateFunction | string {
        return 'Controls/gridNew:ItemTemplate';
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

            if (this._$owner.getMultiSelectVisibility() !== 'hidden') {
                this._$columnItems.unshift(factory({
                    column: {}
                }));
            }
        }
    }
}

Object.assign(GridResultsRow.prototype, {
    _moduleName: 'Controls/display:GridResults',
    _cellModule: 'Controls/display:GridResultsCell',
    _$results: null,
    _$resultsTemplate: null
});
