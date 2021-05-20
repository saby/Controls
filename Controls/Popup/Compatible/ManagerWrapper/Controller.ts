/**
 * Created by as.krasilnikov on 20.11.2018.
 */

import { SyntheticEvent } from 'UICommon/Events';

export default {
   _managerWrapper: null,
   _globalPopup: null,
   _theme: undefined,
   registerManager: function(ManagerWrapper) {
      this._managerWrapper = ManagerWrapper;
   },
   registerGlobalPopup: function(GlobalPopup) {
      this._globalPopup = GlobalPopup;
   },
   getManagerWrapper: function() {
      return this._managerWrapper;
   },
   getGlobalPopup: function() {
      return this._globalPopup;
   },
   getTheme(): string {
      return this._theme;
   },
   setTheme(theme: string): void {
      this._theme = theme;
      this._managerWrapper?.setTheme(theme);
   },
   registerGlobalPopupOpeners: function(GlobalPopupOpeners) {
      this._globalPopupOpeners = GlobalPopupOpeners;
   },
   getGlobalPopupOpeners: function() {
      return this._globalPopupOpeners;
   },
   scrollHandler: function(container) {
      if (this._managerWrapper) {
         this._managerWrapper._scrollHandler(container);
      }
   },
   registerListener: function(event, registerType, component, callback) {
      if (this._managerWrapper) {
         this._managerWrapper.registerListener(event, registerType, component, callback);
      }
   },
   unregisterListener: function(event, registerType, component) {
      if (this._managerWrapper) {
         this._managerWrapper.unregisterListener(event, registerType, component);
      }
   },

   getMaxZIndex: function() {
      if (this._managerWrapper) {
         return this._managerWrapper.getMaxZIndex();
      }
      return 0;
   },

   startResizeEmitter(): void {
      if (this._managerWrapper) {
         const eventCfg = {
            type: 'controlResize'
         };
         this._managerWrapper.startResizeEmitter(new SyntheticEvent(null, eventCfg));
      }
   }
};
