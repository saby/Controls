import Collection from 'Controls/_columns/display/Collection';
import IColumnsStrategy from 'Controls/_columns/interface/IColumnsStrategy';
import { Model } from 'Types/entity';

export default class Auto implements IColumnsStrategy {
    calcColumn(collection: Collection<Model>, index: number, columnsCount: number): number {
        return index % columnsCount;
    }
}
