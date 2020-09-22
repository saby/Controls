import { ItemEntity } from 'Controls/dragnDrop';

export default class EntityTriangle extends ItemEntity {
    private _startSize: number;

    constructor(options: any) {
        super(options);
        this._startSize = options.item.get('size');
    }

    getStartSize(): number {
        return this._startSize;
    }
}
