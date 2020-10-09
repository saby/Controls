import Entity from '../Entity';

interface IItemOptions {
    item: any;
}

export default class Item extends Entity {
    protected _options: IItemOptions;

    getItem(): any {
        return this._options.item;
    }
}
