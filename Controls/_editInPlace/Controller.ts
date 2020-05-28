import { IEditInPlaceModel, IEditInPlaceItem, IOptions } from './interface';
import { TItemKey } from 'Controls/display';
import { Model } from 'Types/entity';
import { itemsStrategy } from 'Controls/display';

const findPredicate = (item) =>  item.isEditing();

export default class Controller {
    private _model: IEditInPlaceModel;

    constructor(options: IOptions) {
        this._model = options.model;
    }

    beginEdit(key: TItemKey, editingContents?: unknown): void {
        const oldEditItem = this.getEditedItem();
        const newEditItem = this._model.getItemBySourceKey(key);

        if (oldEditItem) {
            oldEditItem.setEditing(false);
        }
        if (newEditItem) {
            newEditItem.setEditing(true, editingContents);
        }

        this._model.nextVersion();
    }

    endEdit(): void {
        this.beginEdit(null);
    }

    beginAdd(record: Model): void {
        const editingConfig = this._model.getEditingConfig();

        // TODO support tree
        const addIndex = editingConfig?.addPosition === 'top' ? 0 : Number.MAX_SAFE_INTEGER;

        this._model.appendStrategy(itemsStrategy.AddInPlace, {
            contents: record,
            addIndex
        });
    }

    endAdd(): void {
        this._model.removeStrategy(itemsStrategy.AddInPlace);
    }

    getEditedItem(): IEditInPlaceItem {
        return this._model.find(findPredicate);
    }

    static isEditing(model: IEditInPlaceModel): boolean {
        return !!model.find(findPredicate);
    }
}
