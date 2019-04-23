/**
 * Popup library
 * @library Controls/popup
 * @includes Confirmation Controls/_popup/Opener/Confirmation
 * @includes Dialog Controls/_popup/Opener/Dialog
 * @includes Stack Controls/_popup/Opener/Stack
 * @includes Edit Controls/_popup/Opener/Edit
 * @includes Infobox Controls/_popup/Opener/Infobox
 * @includes Notification Controls/_popup/Opener/Notification
 * @includes Previewer Controls/_popup/Opener/Previewer
 * @includes Sticky Controls/_popup/Opener/Sticky
 * @includes InfoboxTarget Controls/_popup/InfoBox
 * @includes PreviewerTarget Controls/_popup/Previewer
 * @includes Manager Controls/_popup/Manager
 * @includes Controller Controls/_popup/Manager/ManagerController
 * @includes Container Controls/_popup/Manager/Container
 * @public
 * @author Kraynov D.
 */

import Confirmation = require('Controls/_popup/Opener/Confirmation');
import Dialog = require('Controls/_popup/Opener/Dialog');
import Stack = require('Controls/_popup/Opener/Stack');
import Edit = require('Controls/_popup/Opener/Edit');
import Infobox = require('Controls/_popup/Opener/InfoBox');
import Notification = require('Controls/_popup/Opener/Notification');
import Previewer = require('Controls/_popup/Opener/Previewer');
import Sticky = require('Controls/_popup/Opener/Sticky');
import InfoboxTarget = require('Controls/_popup/InfoBox');
import PreviewerTarget = require('Controls/_popup/Previewer');
import Manager = require('Controls/_popup/Manager');
import Controller = require('Controls/_popup/Manager/ManagerController');
import Container = require('Controls/_popup/Manager/Container');

import ConfirmationDialog = require('Controls/_popup/Opener/Confirmation/Dialog');
import BaseOpener = require('Controls/_popup/Opener/BaseOpener');
import StackController = require('Controls/_popup/Opener/Stack/StackController');
import StickyController = require('Controls/_popup/Opener/Sticky/StickyController');
import DialogController = require('Controls/_popup/Opener/Dialog/DialogController');
import NotificationController = require('Controls/_popup/Opener/Notification/NotificationController');

export {
    Confirmation,
    Dialog,
    Stack,
    Edit,
    Infobox,
    Notification,
    Previewer,
    Sticky,
    InfoboxTarget,
    PreviewerTarget,
    Manager,
    Controller,
    Container,

    ConfirmationDialog,
    BaseOpener,
    StackController,
    StickyController,
    DialogController,
    NotificationController
}
