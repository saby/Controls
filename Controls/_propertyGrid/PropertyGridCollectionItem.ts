import {TreeItem} from 'Controls/display';
import PropertyGridCollection from './PropertyGridCollection';
import {DEFAULT_EDITORS} from './Constants';
import {Enum} from 'Types/collection';
import * as getType from 'Core/helpers/getType';
import {Model} from 'Types/entity';
import {object} from 'Types/util';
import {IOptions} from 'Controls/_display/grid/Collection';

export default class PropertyGridCollectionItem<T> extends TreeItem<T> {
    protected _$owner: PropertyGridCollection<T>;
    protected _$keyProperty: string = 'name';
    protected _$propertyValue: unknown;

    constructor(options?: IOptions<T>) {
        super(options);
        this.setPropertyValue(options.editingObject);
    }

    getEditorTemplateName(): string {
        const itemContents = this.getContents();
        const editorTemplateName = itemContents.get('editorTemplateName');
        const type = itemContents.get('type');
        const propertyValue = this._$propertyValue;

        if (editorTemplateName || DEFAULT_EDITORS[type]) {
            return editorTemplateName || DEFAULT_EDITORS[type];
        }
        if (getType(propertyValue) === 'object') {
            if (propertyValue instanceof Enum) {
                return DEFAULT_EDITORS.enum;
            }
        }
        return DEFAULT_EDITORS[getType(propertyValue)];
    }

    getEditorOptions(): object {
        const itemContents = this.getContents();
        const editorOptions = itemContents.get('editorOptions') || {};
        editorOptions.propertyValue = this._$propertyValue;
        return editorOptions;
    }

    setPropertyValue(editingObject: Object | Model | Record<string, any>): void {
        const itemContents = this.getContents();
        this._$propertyValue = object.getPropertyValue(editingObject, itemContents.get(this._$keyProperty));
    }
}

Object.assign(PropertyGridCollectionItem.prototype, {
    '[Controls/_propertyGrid/PropertyGridCollectionItem]': true,
    _moduleName: 'Controls/propertyGrid:PropertyGridCollectionItem'
});
