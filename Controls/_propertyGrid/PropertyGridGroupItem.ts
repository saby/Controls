import {GroupItem} from 'Controls/display';
import PropertyGridCollectionItem from './PropertyGridCollectionItem';
import {PROPERTY_TOGGLE_BUTTON_ICON_FIELD} from './Constants';
import {TemplateFunction} from 'UI/Base';

export default class PropertyGridGroupItem<T> extends GroupItem<PropertyGridCollectionItem<T>> {
    getToggleEditorsButtons(): T[] {
        const toggleButtons = [];

        this.getOwner().getCollection().each((item) => {
            if (item.get(PROPERTY_TOGGLE_BUTTON_ICON_FIELD)) {
                toggleButtons.push(item);
            }
        });

        return toggleButtons;
    }

    getItemTemplate(
        itemTemplateProperty: string,
        userItemTemplate: TemplateFunction | string,
        userGroupTemplate?: TemplateFunction | string,
        editorsToggleTemplate?: TemplateFunction): TemplateFunction | string {
        if (this.getContents() === 'propertyGrid_toggleable_editors_group') {
            return editorsToggleTemplate;
        } else {
            return super.getItemTemplate(itemTemplateProperty, userItemTemplate, userGroupTemplate);
        }
    }
}

Object.assign(GroupItem.prototype, {
    '[Controls/_propertyGrid/PropertyGridGroupItem]': true,
    _moduleName: 'Controls/propertyGrid:PropertyGridGroupItem'
});
