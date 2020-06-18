import {Control, IControlOptions} from 'UI/Base';
import Env = require('Env/Env');
import {SyntheticEvent} from "Vdom/Vdom";

const PRELOAD_DEPENDENCIES_HOVER_DELAY = 80;

class BaseDropdown extends Control<IControlOptions> {

   protected _handleKeyDown(event): void {
      if (event.nativeEvent.keyCode === Env.constants.key.esc && this._popupId) {
         this._controller.closeMenu();
         event.stopPropagation();
      }
   }

   protected _handleClick(event: SyntheticEvent): void {
      // stop bubbling event, so the list does not handle click event.
      event.stopPropagation();
   }

   protected _handleMouseEnter(event: SyntheticEvent): void {
      this._loadDependenciesTimer = setTimeout(this._controller.loadDependencies.bind(this._controller),
                                    PRELOAD_DEPENDENCIES_HOVER_DELAY);
   }

   protected _handleMouseLeave(event: SyntheticEvent): void {
      clearTimeout(this._loadDependenciesTimer);
   }

   protected _onOpen(event, args): void {
      this._notify('dropDownOpen');
      if (typeof (this._options.open) === 'function') {
         this._options.open(args);
      }
   }

   protected _onClose(event, args): void {
      this._controller._isOpened = false;
      this._controller._menuSource = null;
      this._notify('dropDownClose');
      if (typeof (this._options.close) === 'function') {
         this._options.close(args);
      }
   }

   protected _footerClick(data): void {
      this._notify('footerClick', [data]);
      if (!this._$active) {
         this.closeMenu();
      }
   }

   protected _selectorDialogOpened(data): void {
      this._initSelectorItems = data;
      this.closeMenu();
   }
}

export = BaseDropdown;
