import { ItemEntity } from 'Controls/dragnDrop';

export default class EntityNote extends ItemEntity {
   private _startPosition: number;

   constructor(options: any) {
      super(options);
      this._startPosition = options.item.get('position');
   }

   getStartPosition(): number {
      return this._startPosition;
   }
}
