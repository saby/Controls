/**
 * Библиотека контролов, которые реализуют содержимое всплывающих окон.
 * @library
 * @includes IPopupTemplateBase Controls/_popupTemplate/interface/IPopupTemplateBase
 * @public
 * @author Крайнов Д.О.
 */

export {default as StackHeader} from 'Controls/_popupTemplate/Stack/resources/Header';
export {default as Stack} from 'Controls/_popupTemplate/Stack';
export {default as StackController} from 'Controls/_popupTemplate/Stack/Opener/StackController';
export {default as StackContent} from 'Controls/_popupTemplate/Stack/Opener/StackContent';
export {default as StackStrategy} from 'Controls/_popupTemplate/Stack/Opener/StackStrategy';

export {default as DialogHeader} from 'Controls/_popupTemplate/Dialog/Template/Header';
export {default as Dialog} from 'Controls/_popupTemplate/Dialog/Template/Dialog';
export {default as DialogController} from 'Controls/_popupTemplate/Dialog/DialogController';

export {default as Sticky} from 'Controls/_popupTemplate/Sticky';
export {default as StickyController} from 'Controls/_popupTemplate/Sticky/StickyController';
export {default as Page} from 'Controls/_popupTemplate/Page';

export {Template as Confirmation, DialogTemplate as ConfirmationDialog } from 'Controls/popupConfirmation';

export {default as PreviewerController} from 'Controls/_popupTemplate/Previewer/PreviewerController';

export {default as InfoBox, IInfoboxTemplateOptions} from 'Controls/_popupTemplate/InfoBox';
export {default as templateInfoBox} from 'Controls/_popupTemplate/InfoBox/Opener/resources/template';
export {default as InfoBoxController} from 'Controls/_popupTemplate/InfoBox/Opener/InfoBoxController';

export {default as Notification} from 'Controls/_popupTemplate/Notification/Base';
export {default as NotificationSimple} from 'Controls/_popupTemplate/Notification/Simple';
export {default as INotification, INotificationOptions} from 'Controls/_popupTemplate/Notification/interface/INotification';
export {default as NotificationController} from 'Controls/_popupTemplate/Notification/Opener/NotificationController';

export {default as IPopupTemplate, IPopupTemplateOptions} from 'Controls/_popupTemplate/interface/IPopupTemplate';
export {default as CloseButton} from 'Controls/_popupTemplate/CloseButton';
export {default as IPopupTemplateBaseOptions} from 'Controls/_popupTemplate/interface/IPopupTemplateBase';
export {default as BaseController} from 'Controls/_popupTemplate/BaseController';

import TargetCoords = require('Controls/_popupTemplate/TargetCoords');

export {
   TargetCoords
};
