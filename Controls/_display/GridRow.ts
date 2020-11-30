import CollectionItem from './CollectionItem';
import GridCollection from './GridCollection';
import { mixin } from 'Types/util';
import GridRowMixin, { IOptions as IGridRowMixinOptions } from './GridRowMixin';
import {TemplateFunction} from "UI/_base/Control";

export interface IOptions<T> extends IGridRowMixinOptions<T> {
    owner: GridCollection<T>;
}

export default class GridRow<T> extends mixin<
    CollectionItem<any>,
    GridRowMixin<any>
>(
    CollectionItem,
    GridRowMixin
) {
    readonly '[Controls/_display/GridRow]': boolean;

    constructor(options?: IOptions<T>) {
        super(options);
        GridRowMixin.call(this, options);
    }

    // region overrides

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction|string): TemplateFunction | string {
        const templateFromProperty = itemTemplateProperty ? this.getContents().get(itemTemplateProperty) : undefined;
        return templateFromProperty || userTemplate || this.getDefaultTemplate();
    }

    setMultiSelectVisibility(multiSelectVisibility: string): boolean {
        const isChangedMultiSelectVisibility = super.setMultiSelectVisibility(multiSelectVisibility);
        if (isChangedMultiSelectVisibility) {
            this._reinitializeColumns();
        }
        return isChangedMultiSelectVisibility;
    }

    setMarked(marked: boolean, silent?: boolean): void {
        const changed = marked !== this.isMarked();
        super.setMarked(marked, silent);
        if (changed) {
            this._redrawColumns('first');
        }
    }

    setSelected(selected: boolean|null, silent?: boolean): void {
        const changed = this._$selected !== selected;
        super.setSelected(selected, silent);
        if (changed) {
            this._redrawColumns('first');
        }
    }

    setActive(active: boolean, silent?: boolean): void {
        const changed = active !== this.isActive();
        super.setActive(active, silent);
        if (changed) {
            this._redrawColumns('all');
        }
    }

    // endregion
}

Object.assign(GridRow.prototype, {
    '[Controls/_display/GridRow]': true,
    _moduleName: 'Controls/display:GridRow',
    _instancePrefix: 'grid-row-'
});
