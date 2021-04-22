import IColumnsStrategy from 'Controls/_columns/interface/IColumnsStrategy';
import {default as AutoStrategy} from './Auto';

const FULL_ADAPTIVE_WIDTH = 100;

export default class Adaptive extends AutoStrategy implements IColumnsStrategy {
    getColumnMaxWidth(maxWidth?: number): string {
        return '100%';
    }

    getColumnMinWidth(minWidth?: number, spacing?: number, columnsCount?: number): string {
        return `${Math.floor(FULL_ADAPTIVE_WIDTH / columnsCount)}%`;
    }
}
