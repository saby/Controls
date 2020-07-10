/**
 * Библиотека контролов, которые реализуют содержимое всплывающих окон.
 * @library Controls/popupDialog
 * @includes Dialog Controls/_popupDialog/Dialog
 * @public
 * @author Крайнов Д.О.
 */

export {default as DialogHeader} from 'Controls/_popupDialog/Dialog/DialogHeader';
export {default as Dialog} from 'Controls/_popupDialog/Dialog';

import DialogController = require('Controls/_popupDialog/Dialog/Opener/DialogController');

export { DialogController };
