/**
 * Библиотека контролов, которые реализуют содержимое всплывающих окон.
 * @library
 * @includes IPopupTemplateBase Controls/_popupTemplate/interface/IPopupTemplateBase
 * @public
 * @author Крайнов Д.О.
 */

export {default as Stack} from 'Controls/_popupTemplate/Stack/Template/Stack';
export {default as StackController} from 'Controls/_popupTemplate/Stack/StackController';

export {default as Dialog} from 'Controls/_popupTemplate/Dialog/Template/Dialog';
export {default as DialogController} from 'Controls/_popupTemplate/Dialog/DialogController';

export {default as Sticky} from 'Controls/_popupTemplate/Sticky/Template/Sticky';
export {default as StickyController} from 'Controls/_popupTemplate/Sticky/StickyController';

export {default as Page} from 'Controls/_popupTemplate/Page';

export {Template as Confirmation, DialogTemplate as ConfirmationDialog } from 'Controls/popupConfirmation';

export {default as PreviewerController} from 'Controls/_popupTemplate/Previewer/PreviewerController';

export {default as InfoBox, IInfoboxTemplateOptions} from 'Controls/_popupTemplate/InfoBox/Template/InfoBox';
export {default as templateInfoBox} from 'Controls/_popupTemplate/InfoBox/Template/Simple/template';
export {default as InfoBoxController} from 'Controls/_popupTemplate/InfoBox/InfoBoxController';

export {default as Notification} from 'Controls/_popupTemplate/Notification/Template/Base';
export {default as NotificationSimple} from 'Controls/_popupTemplate/Notification/Template/Simple';
export {default as NotificationController} from 'Controls/_popupTemplate/Notification/NotificationController';
export {INotification, INotificationOptions} from 'Controls/_popupTemplate/interface/INotification';

export {default as IPopupTemplate, IPopupTemplateOptions} from 'Controls/_popupTemplate/interface/IPopupTemplate';
export {default as IPopupTemplateBaseOptions} from 'Controls/_popupTemplate/interface/IPopupTemplateBase';

export {default as CloseButton} from 'Controls/_popupTemplate/CloseButton';
export {default as BaseController} from 'Controls/_popupTemplate/BaseController';

// Удалить
export {default as StackStrategy} from 'Controls/_popupTemplate/Stack/StackStrategy'; // для CompoundArea
export {default as DialogHeader} from 'Controls/_popupTemplate/Dialog/Template/Header'; // В рознице
