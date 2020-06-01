import { IEditInPlaceModel, IEditInPlaceItem} from './interface';
import { TItemKey } from 'Controls/display';
import { Model } from 'Types/entity';
import { default as AddInPlaceStrategy } from './AddInPlace';

const findPredicate = (item) =>  item.isEditing();

export default class Controller {
    static beginEdit(model: IEditInPlaceModel, key: TItemKey, editingContents?: unknown): void {
        const oldEditItem = Controller.getEditedItem(model);
        const newEditItem = model.getItemBySourceKey(key);

        if (oldEditItem) {
            oldEditItem.setEditing(false);
        }
        if (newEditItem) {
            newEditItem.setEditing(true, editingContents);
        }

        model.nextVersion();
    }

    static endEdit(model: IEditInPlaceModel): void {
        Controller.beginEdit(model, null);
    }

    static beginAdd(model: IEditInPlaceModel,  record: Model): void {
        const editingConfig = model.getEditingConfig();

        // TODO support tree
        const addIndex = editingConfig?.addPosition === 'top' ? 0 : Number.MAX_SAFE_INTEGER;

        model.appendStrategy(AddInPlaceStrategy, {
            contents: record,
            addIndex
        });
    }

    static endAdd(model: IEditInPlaceModel): void {
        model.removeStrategy(AddInPlaceStrategy);
    }

    static getEditedItem(model: IEditInPlaceModel): IEditInPlaceItem {
        return model.find(findPredicate);
    }

    static isEditing(model: IEditInPlaceModel): boolean {
        return !!model.find(findPredicate);
    }
}
