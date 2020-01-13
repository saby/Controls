import {Bus} from 'Env/Event';
import {detection} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';

export interface IMobileFocusController {
   blurHandler(event: SyntheticEvent<FocusEvent>): void;
   focusHandler(event: SyntheticEvent<FocusEvent>): void;
   touchStartHandler(event: SyntheticEvent<TouchEvent>): void;
}

interface IItem {
   wasTouch: boolean;
   wasFocus: boolean;
   target: EventTarget;
}

type FocusEventName = 'MobileInputFocus' | 'MobileInputFocusOut';

/**
 * Controls the focus behavior of input fields on mobile devices.
 * @remark
 * Allows to react in case of when the field gets focus, the keyboard on the touch devices is shown.
 * This changes the size of the workspace and may require repositioning controls on the page, such as popup.
 * @remark
 * TODO: Kingo
 * Как происходит оповещения событиями:
 * 1. Пользователь tap, поле не фокусировалось -> инициация событий не происходит.
 * 2. Пользователь tap, поле фокусировалось -> инициируется событие MobileInputFocus.
 * 3. Поле фокусируется, пользовательского tap не было -> инициация событий не происходит.
 * 4. Поле фокусируется, был пользовательский tap -> инициируется событие MobileInputFocus.
 * 5. Поле теряет фокус -> инициируется событие MobileInputFocusOut.
 */
class MobileFocusController implements IMobileFocusController {
   private _items: IItem[] = [];
   private _userActivated: boolean = false;

   private _addItem(target: EventTarget): IItem {
      let addedItem: IItem = this._at(target);

      if (addedItem === undefined) {
         addedItem = {
            target,
            wasTouch: false,
            wasFocus: false
         };
         this._items.push(addedItem);
      }

      return addedItem;
   }

   private _removeItem(target: EventTarget): void {
      const indexRemovedItem = this._findIndex(target);
      if (typeof indexRemovedItem === 'number') {
         this._items.splice(indexRemovedItem, 1);
      }
   }

   private _at(target: EventTarget): IItem | undefined {
      return this._items[this._findIndex(target)];
   }

   private _findIndex(target: EventTarget): number | undefined {
      const length = this._items.length;

      for (let index = 0; index < length; index++) {
         const item = this._items[index];

         if (item.target === target) {
            return index;
         }
      }

      return undefined;
   }

   /**
    * Notify to global channel about receiving or losing focus in field.
    */
   private _notify(eventName: FocusEventName): void {
      switch (eventName) {
         case 'MobileInputFocus':
            if (!this._userActivated) {
               this._userActivated = true;
               Bus.globalChannel().notify('MobileInputFocus');
            }
            break;
         case 'MobileInputFocusOut':
            if (this._userActivated) {
               this._userActivated = false;
               Bus.globalChannel().notify('MobileInputFocusOut');
            }
            break;
      }
   }

   touchStartHandler(event: SyntheticEvent<TouchEvent>): void {
      if (!detection.isMobileIOS) {
         return;
      }

      const item = this._addItem(event.target);

      item.wasTouch = true;
      if (item.wasFocus) {
         this._notify('MobileInputFocus');
      }
   }

   focusHandler(event: SyntheticEvent<FocusEvent>): void {
      if (!detection.isMobileIOS) {
         return;
      }

      const item = this._addItem(event.target);

      item.wasFocus = true;
      if (item.wasTouch) {
         this._notify('MobileInputFocus');
      }
   }

   blurHandler(event: SyntheticEvent<FocusEvent>): void {
      if (!detection.isMobileIOS) {
         return;
      }

      this._removeItem(event.target);
      this._notify('MobileInputFocusOut');
   }
}

export default new MobileFocusController();
