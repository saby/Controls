import CollectionItem from '../CollectionItem';
import Collection from './Collection';
import { mixin } from 'Types/util';
import GridRowMixin, { IOptions as IGridRowMixinOptions } from './mixins/Row';
import {TemplateFunction} from 'UI/Base';

export interface IOptions<T> extends IGridRowMixinOptions<T> {
    owner: Collection<T>;
}

export default class Row<T>
    extends mixin<CollectionItem<any>, GridRowMixin<any>>(CollectionItem, GridRowMixin) {
    readonly '[Controls/_display/grid/Row]': boolean;

    // По умолчанию любая абстрактная строка таблицы не имеет возможности редактироваться.
    // Данная возможность доступна только строке с данными.
    readonly '[Controls/_display/IEditableCollectionItem]': boolean;

    // TODO: Удалить имплементирование после выделения сущностей элементов списка
    //  (базовый элемент -> элемент данных / элемент группы /...)
    //  Интерфейс должен имплементироваться только у элементов, которые поддерживает отметку маркером.
    //  Сейчас, т.к. нет элемента данных, его имплементирует CollectionItem.
    readonly Markable = false;
    readonly SelectableItem = false;

    constructor(options?: IOptions<T>) {
        super(options);
        GridRowMixin.call(this, options);
    }

    // region overrides

    getTemplate(): TemplateFunction | string {
        return this.getDefaultTemplate();
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

Object.assign(Row.prototype, {
    '[Controls/_display/IEditableCollectionItem]': false,
    '[Controls/_display/grid/Row]': true,
    _moduleName: 'Controls/display:GridRow',
    _instancePrefix: 'grid-row-'
});
