import {TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import {mixin} from 'Types/util';
import {GridGroupCellMixin, IGridRowOptions} from 'Controls/grid';
import TreeGridDataCell from 'Controls/_treeGrid/display/TreeGridDataCell';
import {IGroupNodeColumn} from 'Controls/_treeGrid/interface/IGroupNodeColumn';

const GROUP_CELL_TEMPLATE = 'Controls/treeGrid:GroupColumnTemplate';

export default class TreeGridGroupDataCell<T extends Model>
    extends mixin<TreeGridDataCell<T>, GridGroupCellMixin<any>>(TreeGridDataCell, GridGroupCellMixin) {
    readonly '[Controls/treeGrid:TreeGridGroupDataCell]': boolean;

    protected readonly _$column: IGroupNodeColumn;
    readonly _$isExpanded: boolean;

    constructor(options?: IGridRowOptions<T>) {
        super(options);
    }

    getTemplate(multiSelectTemplate?: TemplateFunction): TemplateFunction | string {
        if (this._$column.groupNodeConfig) {
            return GROUP_CELL_TEMPLATE;
        }
        return this._$column.template || this._defaultCellTemplate;
    }

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover?: boolean, templateHoverBackgroundStyle?: string): string {
        let wrapperClasses = '';

        wrapperClasses += this._getWrapperBaseClasses(theme, style, templateHighlightOnHover);
        wrapperClasses += this._getWrapperSeparatorClasses(theme);

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses(theme)}`;
        }

        return wrapperClasses;
    }

    getContentClasses(theme: string): string {
        let classes = '';
        // TODO необходимо разобраться с высотой групп.
        //  https://online.sbis.ru/opendoc.html?guid=6693d47c-515c-4751-949d-55be05fe124e
        classes += ' controls-ListView__groupContent_baseline_default';
        classes += this._getHorizontalPaddingClasses(theme);
        if (this._$owner.hasMultiSelectColumn() && this.isFirstColumn()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}`;
        }
        classes += this._getContentAlignClasses();
        classes += ' controls-ListView__groupContent';
        return classes;
    }

    // region Аспект "Ячейка группы"

    isExpanded(): boolean {
        return this._$isExpanded;
    }

    // endregion Аспект "Ячейка группы"
}

Object.assign(TreeGridGroupDataCell.prototype, {
    '[Controls/treeGrid:TreeGridGroupDataCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridGroupDataCell',
    _instancePrefix: 'tree-grid-group-data-cell-',
    _$isExpanded: null
});
