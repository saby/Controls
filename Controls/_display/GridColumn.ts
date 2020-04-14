import { mixin } from 'Types/util';
import {
    OptionsToPropertyMixin,
    DestroyableMixin,
    InstantiableMixin,
    VersionableMixin,
    IInstantiable,
    IVersionable
} from 'Types/entity';
import GridCollectionItem from './GridCollectionItem';
import { TemplateFunction } from 'UI/Base';
import { register } from 'Types/di';

export interface IColumnConfig {
    template: TemplateFunction|string;
    width?: string;
    cellPadding?: { left: string; right: string; };
    displayProperty?: string;
}

export interface IOptions<T> {
    owner: GridCollectionItem<T>;
    column: IColumnConfig;
}

export default class GridColumn<T> extends mixin<
    DestroyableMixin,
    OptionsToPropertyMixin,
    InstantiableMixin,
    VersionableMixin
>(
    DestroyableMixin,
    OptionsToPropertyMixin,
    InstantiableMixin,
    VersionableMixin
) implements IInstantiable, IVersionable {
    readonly '[Types/_entity/IInstantiable]': boolean;
    getInstanceId: () => string;

    protected _$owner: GridCollectionItem<T>;
    protected _$column: IColumnConfig;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
    }

    getCellClasses(templateHighlightOnHover: boolean): string {
        // GridViewModel -> getItemColumnCellClasses
        let classes = 'controls-Grid__row-cell controls-Grid__row-cell_theme-default js-controls-SwipeControl__actionsContainer';

        // if !checkBoxCell
        classes += ' controls-Grid__cell_fit';

        if (this._$owner.isEditing()) {
            classes += ' controls-Grid__row-cell-background-editing_theme-default';
        } else {
            classes += ' controls-Grid__row-cell-background-hover_theme-default';
        }
        if (this._$owner.isActive() && templateHighlightOnHover !== false) {
            classes += ' controls-GridView__item_active_theme-default';
        }
        if (this._$owner.isDragged()) {
            classes += ' controls-ListView__item_dragging_theme-default';
        }

        // prepareRowSeparatorClasses, rowSeparatorVisibility
        classes += ' controls-Grid__row-cell_withoutRowSeparator_theme-default';

        classes += ' ' + this._getCellPaddingClasses();

        // if checkBoxCell
        // if isSelected
        // if getLastColumnIndex

        return classes;
    }

    getCellStyles(): string {
        // There's a lot
        return undefined;
    }

    getTemplate(): TemplateFunction|string {
        return this._$column.template;
    }

    getDisplayProperty(): string {
        return this._$column.displayProperty;
    }

    getContents(): T {
        return this._$owner.getContents();
    }

    get contents(): T {
        return this._$owner.getContents();
    }

    getColumnIndex(): number {
        return this._$owner.getColumnIndex(this._$column);
    }

    isFirstColumn(): boolean {
        return this.getColumnIndex() === 0;
    }

    isLastColumn(): boolean {
        return this.getColumnIndex() === this._$owner.getColumnsCount() - 1;
    }

    shouldDisplayMarker(): boolean {
        return this._$owner.isMarked() && this.isFirstColumn();
    }

    getMarkerClasses(): string {
        return `
        controls-ListView__itemV_marker
        controls-GridView__itemV_marker controls-GridView__itemV_marker_theme-default
        controls-GridView-without-rowSeparator_item_marker_theme-default
        `;
    }

    nextVersion(): void {
        this._nextVersion();
    }

    protected _getCellPaddingClasses(): string {
        // GridViewModel -> getPaddingCellClasses
        const itemSpacing = this._$owner.getItemSpacing();
        let classes = 'controls-Grid__cell_default';

        // left <-> right
        const cellPadding = this._$column.cellPadding;

        if (!this.isFirstColumn()) {
            classes += ' controls-Grid__cell_spacingLeft';
            if (cellPadding?.left) {
                classes += `_${cellPadding.left}`;
            }
            classes += '_theme-default';
        } else {
            classes += ` controls-Grid__cell_spacingFirstCol_${itemSpacing.left}_theme-default`;
        }

        if (!this.isLastColumn()) {
            classes += ' controls-Grid__cell_spacingRight';
            if (cellPadding?.right) {
                classes += `_${cellPadding.right}`;
            }
            classes += '_theme-default';
        } else {
            classes += ` controls-Grid__cell_spacingLastCol_${itemSpacing.right}_theme-default`;
        }

        // top <-> bottom
        classes += ` controls-Grid__row-cell_rowSpacingTop_${itemSpacing.row}_theme-default`;
        classes += ` controls-Grid__row-cell_rowSpacingBottom_${itemSpacing.row}_theme-default`;

        return classes;
    }
}

Object.assign(GridColumn.prototype, {
    '[Controls/_display/GridColumn]': true,
    _moduleName: 'Controls/display:GridColumn',
    _instancePrefix: 'grid-column-',
    _$owner: null,
    _$column: null
});

register('Controls/display:GridColumn', GridColumn, {instantiate: false});
