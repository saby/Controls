/**
 * Библиотека контролов, которые реализуют содержимое всплывающих окон.
 * @library Controls/popupTemplate
 * @includes CloseButton Controls/_popupTemplate/CloseButton
 * @includes Stack Controls/_popupTemplate/Stack
 * @includes StackHeader wml!Controls/_popupTemplate/Stack/resources/Header
 * @includes InfoBox Controls/_popupTemplate/InfoBox
 * @includes Notification Controls/_popupTemplate/Notification/Base
 * @includes NotificationSimple Controls/_popupTemplate/Notification/Simple
 * @includes INotification Controls/_popupTemplate/Notification/interface/INotification
 * @includes IPopupTemplate Controls/_popupTemplate/interface/IPopupTemplate
 * @includes IPopupTemplateBaseOptions Controls/_popupTemplate/interface/IPopupTemplateBase
 * @includes Sticky Controls/_popupTemplate/Sticky
 * @public
 * @author Крайнов Д.О.
 */

export {Template as Confirmation, DialogTemplate as ConfirmationDialog } from 'Controls/popupConfirmation';
export {default as InfoBox} from 'Controls/_popupTemplate/InfoBox';
export {default as Notification} from 'Controls/_popupTemplate/Notification/Base';
export {default as NotificationSimple} from 'Controls/_popupTemplate/Notification/Simple';
export {default as StackHeader} from 'Controls/_popupTemplate/Stack/resources/Header';
export {default as Stack} from 'Controls/_popupTemplate/Stack';
export {default as Sticky} from 'Controls/_popupTemplate/Sticky';
export {default as IPopupTemplate, IPopupTemplateOptions} from 'Controls/_popupTemplate/interface/IPopupTemplate';
export {default as INotification, INotificationOptions} from 'Controls/_popupTemplate/Notification/interface/INotification';
export {default as CloseButton} from 'Controls/_popupTemplate/CloseButton';
export {default as IPopupTemplateBaseOptions} from 'Controls/_popupTemplate/interface/IPopupTemplateBase';
export {default as templateInfoBox} from 'Controls/_popupTemplate/InfoBox/Opener/resources/template';
export {default as BaseController} from 'Controls/_popupTemplate/BaseController';

import StickyController = require('Controls/_popupTemplate/Sticky/StickyController');
import InfoBoxController = require('Controls/_popupTemplate/InfoBox/Opener/InfoBoxController');
import StackController = require('Controls/_popupTemplate/Stack/Opener/StackController');
import StackContent = require('Controls/_popupTemplate/Stack/Opener/StackContent');
import TargetCoords = require('Controls/_popupTemplate/TargetCoords');
import NotificationController = require('Controls/_popupTemplate/Notification/Opener/NotificationController');
import PreviewerController = require('Controls/_popupTemplate/Previewer/PreviewerController');
import StackStrategy = require('Controls/_popupTemplate/Stack/Opener/StackStrategy');

export {
   StickyController,
   StackContent,
   InfoBoxController,
   StackController,
   TargetCoords,
   NotificationController,
   PreviewerController,
   StackStrategy
};
