import { TemplateFunction } from 'UI/Base';
import { mixin } from 'Types/util';
import { OptionsToPropertyMixin } from 'Types/entity';
import GridCollection from './GridCollection';
import { TColumns } from 'Controls/grid';
import GridFooterCell from './GridFooterCell';

type TFooterCells<T> = Array<GridFooterCell<T>>;

export interface IOptions<T> {
    owner: GridCollection<T>;
    footerTemplate: TemplateFunction;
}

export default class GridFooter<T> extends mixin<OptionsToPropertyMixin>(OptionsToPropertyMixin) {
    protected _$owner: GridCollection<T>;
    protected _$cells: TFooterCells<T>;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
        this._$cells = this._prepareCells(this._$owner.getColumns(), options.footerTemplate);
    }

    getBodyClasses(theme: string): string {
        /* todo
        // Для предотвращения скролла одной записи в таблице с экшнами.
        // _options._needBottomPadding почему-то иногда не работает.
        if ((this._listModel.getCount() || this._listModel.isEditing()) &&
            this._options.itemActionsPosition === 'outside' &&
            !this._options._needBottomPadding &&
            this._options.resultsPosition !== 'bottom') {
            classList = classList.add(`controls-GridView__footer__itemActionsV_outside_theme-${this._options.theme}`);
        }*/
        return `controls-GridView__footer controls-GridView__footerRow`;
    }

    getCells(): TFooterCells<T> {
        return this._$cells;
    }

    getCellIndex(cell: GridFooterCell<T>): number {
        return this._$cells.indexOf(cell);
    }

    getColumnsCount(): number {
        return this._$owner.getColumns().length;
    }

    getCellsCount(): number {
        return this._$cells.length;
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

    protected _prepareCells(columns: TColumns, footerTemplate: TemplateFunction): TFooterCells<T> {
        const cells = [];
        if (this._$owner.getMultiSelectVisibility()) {
            cells.push(new GridFooterCell({
                owner: this
            }));
        }
        if (footerTemplate) {
            const cell = new GridFooterCell({
                template: footerTemplate,
                owner: this,
                // ToDo | Временная опция для обеспечения вывода общего шаблона строки результатов.
                //      | При разработке мультизаговков colspan будет сделан единообразно и для футера.
                colspan: true
            });
            cells.push(cell);
            return cells;
        }
        /* todo create footerTemplate for every column
        columns.forEach((elem) => {

        });
        return cells;*/
    }
}

Object.assign(GridFooter.prototype, {
    _moduleName: 'Controls/display:GridFooter',
    _$owner: null
});
