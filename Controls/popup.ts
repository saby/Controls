/**
 * Библиотека контролов, открывающих всплывающие окна. Существуют окна нескольких видов, которые различаются внешним видом и алгоритмом позиционирования.
 * @library Controls/popup
 * @public
 * @author Крайнов Д.О.
 */

/*
 * popup library
 * @library Controls/popup
 * @public
 * @author Крайнов Д.О.
 */

export {default as ManagerClass} from './_popup/Manager';
export {default as Container} from './_popup/Manager/Container';
export {default as Controller} from './_popup/Manager/ManagerController';
export {default as Global} from './_popup/Global';
export {default as GlobalController} from './_popup/GlobalController';

export {default as BaseOpener} from 'Controls/_popup/Opener/BaseOpener';
export {default as Stack} from './_popup/Opener/Stack';
export {default as Dialog} from './_popup/Opener/Dialog';
export {default as Sticky} from './_popup/Opener/Sticky';
export {default as Confirmation} from './_popup/Opener/Confirmation';
export {default as Notification} from 'Controls/_popup/Opener/Notification';
export {default as Infobox} from './_popup/Opener/InfoBox';
export {default as Previewer} from './_popup/Opener/Previewer';
export {default as Edit} from './_popup/Opener/Edit';
export {default as EditContainer} from './_popup/Opener/Edit/Container';

export {default as InfoboxButton} from './_popup/InfoBox/InfoboxButton';
export {default as PreviewerTarget} from './_popup/Previewer';
export {default as InfoboxTarget} from './_popup/InfoBox';
export {default as PreviewerTemplate} from './_popup/Previewer/PreviewerTemplate';

export {default as StackOpener} from './_popup/PopupHelper/Stack';
export {default as StickyOpener} from './_popup/PopupHelper/Sticky';
export {default as DialogOpener} from './_popup/PopupHelper/Dialog';
export {default as NotificationOpener} from './_popup/PopupHelper/Notification';

export {default as IPopup, IPopupOptions, IPopupItem, IPopupSizes, IPopupPosition, IEventHandlers, IPopupItemInfo} from './_popup/interface/IPopup';
export {IBasePopupOptions} from './_popup/interface/IBaseOpener';
export {IStackPopupOptions, IStackOpener} from './_popup/interface/IStack';
export {IStickyPopupOptions, IStickyPosition, IStickyPositionOffset, IStickyOpener} from './_popup/interface/ISticky';
export {IDialogPopupOptions, IDialogOpener} from './_popup/interface/IDialog';
export {IConfirmationOptions, IConfirmationOpener} from './_popup/interface/IConfirmation';
export {INotificationPopupOptions, INotificationOpener} from './_popup/interface/INotification';
export {IPreviewerOptions, IPreviewer} from './_popup/interface/IPreviewer';
export {IInfoBoxOptions, IInfoBox} from './_popup/interface/IInfoBox';
export {IInfoBoxPopupOptions, IInfoBoxOpener} from './_popup/interface/IInfoBoxOpener';

export {isVDOMTemplate} from './_popup/utils/isVdomTemplate';

export {isMouseEvent, MouseUp, MouseButtons} from './_popup/fastOpenUtils/MouseEventHelper';
export {isLeftMouseButton, DependencyTimer} from './_popup/fastOpenUtils/FastOpen';

export {IEditOptions} from './_popup/interface/IEdit';

// TODO Compatible
import GlobalTemplate = require('wml!Controls/_popup/Global/Global');
export {
    GlobalTemplate
};
