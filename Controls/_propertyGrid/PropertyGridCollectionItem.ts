import {TreeItem} from 'Controls/display';
import PropertyGridCollection from './PropertyGridCollection';
import {DEFAULT_EDITORS, DEFAULT_VALIDATORS} from './Constants';
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

    getItemPaddingClasses(theme: string, gridColumnIndex?: number): string {
        const owner = this.getOwner();
        let classes = `controls-PropertyGrid__editor_spacingTop_${owner.getTopPadding()}_theme-${theme}
                       controls-PropertyGrid__editor_spacingBottom_${owner.getBottomPadding()}_theme-${theme}`;
        if (gridColumnIndex !== 1) {
            classes += ` controls-PropertyGrid__editor_spacingRight_${owner.getRightPadding()}_theme-${theme}`;
        }
        if (gridColumnIndex !== 2) {
            classes += ` controls-PropertyGrid__editor_spacingLeft_${owner.getLeftPadding()}_theme-${theme}`;
        }
        return classes;
    }

    getEditorOptions(): object {
        const itemContents = this.getContents();
        const editorOptions = itemContents.get('editorOptions') || {};
        editorOptions.propertyValue = this._$propertyValue;
        return editorOptions;
    }

    getValidateTemplateName(): string {
        const editorOptions = this.getEditorOptions();
        const type = this.getContents().get('type');
        if (editorOptions.validators) {
            return editorOptions.validateTemplateName || DEFAULT_VALIDATORS[type];
        }
        return '';
    }

    getValidateTemplateOptions(): Record<string, any> {
        return this.getEditorOptions().validateTemplateOptions || {};
    }

    getValidators(): Function[] | null {
        return this.getEditorOptions().validators;
    }

    getPropertyValue(): any {
        return this._$propertyValue;
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
