import {Tree} from 'Controls/display';
import {IOptions as ITreeCollectionOptions} from 'Controls/_display/Tree';
import PropertyGridCollectionItem from 'Controls/_propertyGrid/PropertyGridCollectionItem';
import {Model} from 'Types/entity';
import {ItemsFactory} from 'Controls/_display/Collection';
import PropertyGridGroupItem from 'Controls/_propertyGrid/PropertyGridGroupItem';
import TToggledEditors from './PropertyGrid';

export interface IPropertyGridCollectionOptions<S, T> extends ITreeCollectionOptions<S, T> {
    toggledEditors?: TToggledEditors;
    editingObject: Record<string, unknown> | Model | object;
}

export default class PropertyGridCollection<S, T extends PropertyGridCollectionItem<S> = PropertyGridCollectionItem<S>>
    extends Tree<S, PropertyGridCollectionItem<S>> {

    protected _$toggledEditors: TToggledEditors;
    protected _$editingObject: object | Model | Record<string, unknown>;

    constructor(options?: IPropertyGridCollectionOptions<S, T>) {
        super(options);
    }

    protected _getGroupItemConstructor(): new() => PropertyGridGroupItem<S> {
        return PropertyGridGroupItem;
    }

    setToggledEditors(toggledEditors: TToggledEditors): void {
        this._$toggledEditors = toggledEditors;
        this._nextVersion();
    }

    getToggledEditors(): TToggledEditors {
        return this._$toggledEditors;
    }

    setEditingObject(editingObject: Object | Model | Record<string, any>): void {
        this._$editingObject = editingObject;
        this._updateItemsEditingObject();
        this.nextVersion();
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return function CollectionItemsFactory(options?): T {
            options.editingObject = this._$editingObject;
            return superFactory.call(this, options);
        };
    }

    protected _updateItemsEditingObject(): void {
        this.getViewIterator().each((item: PropertyGridCollectionItem<T>) => {
            if (item['[Controls/_propertyGrid/PropertyGridCollectionItem]']) {
                item.setPropertyValue(this._$editingObject);
            }
        });
    }
}

Object.assign(PropertyGridCollection.prototype, {
    '[Controls/_propertyGrid/PropertyGridCollection]': true,
    _moduleName: 'Controls/propertyGrid:PropertyGridCollection',
    _itemModule: 'Controls/propertyGrid:PropertyGridCollectionItem',
    _$editingObject: null
});
