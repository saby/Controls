import Control = require('Core/Control');
import template = require('wml!Controls/_popup/Global/Global');
import InfoBox from './Opener/InfoBox';
import Dialog from './Opener/Dialog';
import Previewer from './Opener/Previewer';
import { goUpByControlTree } from 'UI/Focus';

/**
 * @class Controls/_popup/Global
 * @private
 */

let _private = {
    getPopupConfig(config) {
        // Find opener for Infobox
        if (!config.opener) {
            config.opener = goUpByControlTree(config.target)[0];
        }
        return config;
    }
};

const Global = Control.extend({
   _template: template,
   _infoBoxId: null,
   _afterMount() {
      // В старом окружении регистрируем GlobalPopup, чтобы к нему был доступ.
      // На вдоме ничего не зарегистрируется, т.к. слой совместимости там не подгрузится
      let ManagerWrapperControllerModule = 'Controls/Popup/Compatible/ManagerWrapper/Controller';
      let ManagerWrapperController = requirejs.defined(ManagerWrapperControllerModule) ? requirejs(ManagerWrapperControllerModule).default : null;

      // COMPATIBLE: В слое совместимости для каждого окна с vdom шаблоном создается Global.js. Это нужно для работы событий по
      // открытию глобальный окон (openInfobox, etc). Но глобальные опенеры должны быть одни для всех из созданных Global.js
      // Код ниже делает создание глобальных опенеров единоразовым, при создании второго и следующего инстанса Global.js
      // в качестве опенеров ему передаются уже созданные опенеры у первого инстанста
      // На Vdom странице Global.js всегда один.
      if (ManagerWrapperController && !ManagerWrapperController.getGlobalPopup()) {
         ManagerWrapperController.registerGlobalPopup(this);
      }
   },

   _openInfoBoxHandler(event, config) {
      this._activeInfobox = event.target;
      _private.getPopupConfig(config);
      this._infoBoxId = this._openInfoBox(config);
   },

   _openInfoBox(config) {
      return InfoBox.openPopup(config);
   },

   _closeInfoBox(delay) {
      InfoBox.closePopup(delay);
   },

   _closeInfoBoxHandler(event, delay) {
      // TODO: fixed by https://online.sbis.ru/doc/d7b89438-00b0-404f-b3d9-cc7e02e61bb3
      let activeInf = this._activeInfobox && this._activeInfobox.get ? this._activeInfobox.get(0) : this._activeInfobox;
      let eventTarget = event.target && event.target.get ? event.target.get(0) : event.target;
      if (activeInf === eventTarget) {
         this._activeInfobox = null;
         this._closeInfoBox(delay);
      }
   },

   // Needed to immediately hide the infobox after its target or one
   // of their parent components are hidden
   // Will be removed:
   // https://online.sbis.ru/opendoc.html?guid=1b793c4f-848a-4735-b96a-f0c1cf479fab
   _forceCloseInfoBoxHandler() {
      if (this._activeInfobox) {
         this._activeInfobox = null;
         this._closeInfoBox(0);
      }
   },
   _openPreviewerHandler(event, config, type) {
      this._activePreviewer = event.target;
      return Previewer.openPopup(config, type).then((id: string) => {
         this._previewerId = id;
      });
   },

   _closePreviewerHandler(event, type) {
      Previewer.closePopup(this._previewerId, type);
   },

   _cancelPreviewerHandler(event, action) {
      Previewer.cancelPopup(this._previewerId, action);
   },
   _isPreviewerOpenedHandler(event) {
      if (this._activePreviewer === event.target && this._previewerId) {
         return Previewer.isOpenedPopup(this._previewerId);
      }
      return false;
   },
   _popupBeforeDestroyedHandler(event, popupCfg, popupList, popupContainer) {
      if (this._activeInfobox) {
         // If infobox is displayed inside the popup, then close infobox.
         if (this._needCloseInfoBox(this._activeInfobox, popupContainer)) {
            this._activeInfobox = null;
            this._closeInfoBox(0);
         }
      }
   },

   _needCloseInfoBox(infobox, popup) {
      let parent = infobox.parentElement;
      while (parent) {
         if (parent === popup) {
            return true;
         }
         parent = parent.parentElement;
      }
      return false;
   },

   /**
    * open modal dialog
    * @param event
    * @param {String | Function} template
    * @param {Object} templateOptions
    * @param {Core/Control} [opener=null]
    * @return {Promise.<void>} result promise
    * @private
    */
   _openDialogHandler(event, template, templateOptions, opener = null) {
      this._onDialogClosed();

      Dialog.openPopup({
         template,
         templateOptions,
         opener,
         eventHandlers: {
            onClose: () => {
               this._onDialogClosed();
            }
         }
      });

      //
      return new Promise((resolve, reject) => {
         this._closedDialodResolve = resolve;
      });
   },
   _onDialogClosed() {
      if (this._closedDialodResolve) {
         this._closedDialodResolve();
         delete this._closedDialodResolve;
      }
   },

   _private
});

export default Global;
