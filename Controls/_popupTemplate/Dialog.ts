import Control = require('Core/Control');
import template = require('wml!Controls/_popupTemplate/Dialog/Dialog');
import { goUpByControlTree } from 'UI/Focus';
import {Controller as ManagerController} from 'Controls/popup';

const DialogTemplate = Control.extend({

    /**
     * Базовый шаблон {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/dialog/#template диалогового окна}.
     * @class Controls/_popupTemplate/Dialog
     * @extends Core/Control
     * @control
     * @public
     * @category Popup
     * @author Красильников А.С.
     * @implements Controls/_popupTemplate/interface/IPopupTemplate
     * @implements Controls/_popupTemplate/interface/IPopupTemplateBase
     * @demo Controls-demo/Popup/Templates/DialogTemplatePG
     */

    /**
     * @name Controls/_popupTemplate/Dialog#draggable
     * @cfg {Boolean} Определяет, может ли окно перемещаться с помощью <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/tools/drag-n-drop/'>d'n'd</a>.
     * @default false
     */
    /*
     * @name Controls/_popupTemplate/Dialog#draggable
     * @cfg {Boolean} Determines whether the control can be moved by d'n'd.
     * @default false
     */

         _template: template,
         _closeButtonVisibility: true,
         _closeButtonViewMode: 'popup',
         _beforeMount: function(options) {
             this._prepareTheme();
         },
         _beforeUpdate: function(options) {
             this._prepareTheme();
         },
          _prepareTheme(): void {
              this._headerTheme = ManagerController.getPopupHeaderTheme();
          },
         /*
          * Закрытие всплывающего диалогового окна.
          * @function Controls/_popupTemplate/Dialog#close
          */
         /*
          * Close popup.
          * @function Controls/_popupTemplate/Dialog#close
          */
         close: function() {
            this._notify('close', [], { bubbling: true });
         },

         _onMouseDown(event) {
            if (this._needStartDrag(event.target)) {
               this._startDragNDrop(event)
            }
         },

    _startDragNDrop(event) {
        this._children.dragNDrop.startDragNDrop(null, event);
    },

    _needStartDrag(target) {
        const controlsArray = goUpByControlTree(target);

        // if click to control then control must handle click
        return this._options.draggable && controlsArray[0]._container === this._container;
    },

    _onDragEnd() {
        this._notify('popupDragEnd', [], {bubbling: true});
    },

    _onDragMove(event, dragObject) {
        this._notify('popupDragStart', [dragObject.offset], {bubbling: true});
    }
});
DialogTemplate.getDefaultOptions = function() {
    return {
        headingStyle: 'secondary',
        headingSize: '3xl',
        closeButtonVisibility: true,
        closeButtonViewMode: 'toolButton',
        closeButtonTransparent: true
    };
};
DialogTemplate._theme = ['Controls/popupTemplate'];

export = DialogTemplate;
