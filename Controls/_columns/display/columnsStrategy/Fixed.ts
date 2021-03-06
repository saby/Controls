import Collection from 'Controls/_columns/display/Collection';
import IColumnsStrategy from 'Controls/_columns/interface/IColumnsStrategy';
import { Model } from 'Types/entity';

export default class Fixed implements IColumnsStrategy {
    calcColumn(collection: Collection<Model>, index: number): number {
        if (index < collection.getCount()) {
            const item = collection.at(index);
            return item.getContents().get && item.getContents().get(collection.getColumnProperty() || 'column') || 0;
        }
        return 0;
    }
}
