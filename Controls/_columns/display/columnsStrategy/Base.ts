import Collection from 'Controls/_columns/display/Collection';
import IColumnsStrategy from 'Controls/_columns/interface/IColumnsStrategy';
import { Model } from 'Types/entity';

export default abstract class Auto implements IColumnsStrategy {
    abstract calcColumn(collection: Collection<Model>, index: number, columnsCount: number): number;

    getColumnMinWidth(minWidth?: number, spacing?: number, columnsCount?: number): string {
        return `${minWidth + spacing}px`;
    }

    getColumnMaxWidth(maxWidth?: number, spacing?: number, columnsCount?: number): string {
        return `${maxWidth + spacing}px`;
    }
}
