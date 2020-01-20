/// <amd-module name='Controls/popupConfirmation' />
import 'css!theme?Controls/popupConfirmation';

/**
 * Библиотека контролов, которые реализуют содержимое всплывающих окон.
 * @library Controls/popupConfirmation
 * @includes Template Controls/_popupConfirmation/Template
 * @includes DialogTemplate Controls/_popupConfirmation/Opener/Dialog
 * @includes style Controls/_popupConfirmation/style
 * @includes Footer Controls/_popupConfirmation/Footer
 * @includes IConfirmationFooter Controls/_popup/interface/IConfirmationFooter
 * @public
 * @author Красильников А.С.
 */
/*
 * popupConfirmation library
 * @library Controls/popupConfirmation
 * @includes Template Controls/_popupConfirmation/Template
 * @includes DialogTemplate Controls/_popupConfirmation/Opener/Dialog
 * @includes style Controls/_popupConfirmation/style
 * @includes Footer Controls/_popupConfirmation/Footer
 * @includes IConfirmationFooter  Controls/_popup/interface/IConfirmationFooter
 * @public
 * @author Красильников А.С.
 */
// @ts-ignore
export { default as Template} from 'Controls/_popupConfirmation/Template';
// @ts-ignore
export { default as DialogTemplate} from 'Controls/_popupConfirmation/Opener/Dialog';
export { default as Footer} from 'Controls/_popupConfirmation/Footer';
export {IConfirmationFooterOptions, IConfirmationFooter} from 'Controls/_popup/interface/IConfirmationFooter';
