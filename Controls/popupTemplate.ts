/**
 * Библиотека контролов, которые реализуют содержимое всплывающих окон.
 * @library Controls/popupTemplate
 * @includes IPopupTemplateBase Controls/_popupTemplate/interface/IPopupTemplateBase
 * @public
 * @author Крайнов Д.О.
 */

export {Template as Confirmation, DialogTemplate as ConfirmationDialog } from 'Controls/popupConfirmation';
export {default as InfoBox, IInfoboxTemplateOptions} from 'Controls/_popupTemplate/InfoBox';
export {default as Notification} from 'Controls/_popupTemplate/Notification/Base';
export {default as NotificationSimple} from 'Controls/_popupTemplate/Notification/Simple';
export {default as StackHeader} from 'Controls/_popupTemplate/Stack/resources/Header';
export {default as Stack} from 'Controls/_popupTemplate/Stack';
export {default as DialogHeader} from 'Controls/_popupTemplate/Dialog/DialogHeader';
export {default as Dialog} from 'Controls/_popupTemplate/Dialog';
export {default as Sticky} from 'Controls/_popupTemplate/Sticky';
export {default as Page} from 'Controls/_popupTemplate/Page';
export {default as IPopupTemplate, IPopupTemplateOptions} from 'Controls/_popupTemplate/interface/IPopupTemplate';
export {default as INotification, INotificationOptions} from 'Controls/_popupTemplate/Notification/interface/INotification';
export {default as CloseButton} from 'Controls/_popupTemplate/CloseButton';
export {default as IPopupTemplateBaseOptions} from 'Controls/_popupTemplate/interface/IPopupTemplateBase';
export {default as templateInfoBox} from 'Controls/_popupTemplate/InfoBox/Opener/resources/template';
export {default as BaseController, IDragOffset} from 'Controls/_popupTemplate/BaseController';
export {default as StackStrategy} from 'Controls/_popupTemplate/Stack/Opener/StackStrategy';

import DialogController = require('Controls/_popupTemplate/Dialog/Opener/DialogController');
import StickyController = require('Controls/_popupTemplate/Sticky/StickyController');
import InfoBoxController = require('Controls/_popupTemplate/InfoBox/Opener/InfoBoxController');
import StackController = require('Controls/_popupTemplate/Stack/Opener/StackController');
import StackContent = require('Controls/_popupTemplate/Stack/Opener/StackContent');
import TargetCoords = require('Controls/_popupTemplate/TargetCoords');
import NotificationController = require('Controls/_popupTemplate/Notification/Opener/NotificationController');
import PreviewerController = require('Controls/_popupTemplate/Previewer/PreviewerController');

export {
   DialogController,
   StickyController,
   StackContent,
   InfoBoxController,
   StackController,
   TargetCoords,
   NotificationController,
   PreviewerController
};
