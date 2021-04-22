import Collection from 'Controls/_columns/display/Collection';
import IColumnsStrategy from 'Controls/_columns/interface/IColumnsStrategy';
import {default as BaseStrategy} from './Base';
import { Model } from 'Types/entity';

export default class Auto extends BaseStrategy implements IColumnsStrategy {
    calcColumn(collection: Collection<Model>, index: number, columnsCount: number): number {
        return index % columnsCount;
    }
}
