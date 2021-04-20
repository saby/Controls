import {IConfirmationFooterOptions} from 'Controls/_popup/interface/IConfirmationFooter';
import {IControlOptions} from 'UI/Base';

export interface IConfirmationOptions extends IConfirmationFooterOptions, IControlOptions {
    style?: string;
    size?: string;
    message?: string;
    details?: string;
    closeHandler?: Function;
    zIndex?: number; //todo: Compatible
}

/**
 * Интерфейс для опций окон подтверждения.
 * @public
 * @extends Controls/_popup/interface/IConfirmationFooter
 * @author Красильников А.С.
 */
export interface IConfirmationOpener {
    open(templateOptions: IConfirmationOptions): Promise<boolean | undefined>;
    readonly '[Controls/_popup/interface/IConfirmationOpener]': boolean;
}

/**
 * @name Controls/_popup/interface/IConfirmationOpener#size
 * @cfg {String} Размер диалога подтверждения. Размер меняется автоматически, если длина основного сообщения превышает
 * 100 символов или длина дополнительного текста превышает 160 символов.
 * @variant m (ширина 350px)
 * @variant l (ширина 440px)
 * @default m
 */

/**
 * @name Controls/_popup/interface/IConfirmationOpener#message
 * @cfg {String} Основной текст диалога подтверждения.
 */

/**
 * @name Controls/_popup/interface/IConfirmationOpener#details
 * @cfg {String} Дополнительный текст диалога подтверждения
 */

/**
 * @name Controls/_popup/interface/IConfirmationOpener#style
 * @cfg {String} Внешний вид диалога подтверждения.
 * @variant default
 * @variant success
 * @variant danger
 * @variant primary
 * @default default
 */

/**
 * Метод открытия окна подтверждения.
 * @name Controls/_popup/interface/IConfirmationOpener#open
 * @function
 * @param {Controls/popup:IConfirmationOpener} IConfirmationOptions Конфигурация диалога подтверждения.
 * @returns {Deferred} Результат будет возвращен после того, как пользователь закроет всплывающее окно.
 * @remark
 * 1. Если требуется открыть окно, без создания popup:Confirmation в верстке, следует использовать статический метод {@link openPopup}
 * 2. Если вы хотите использовать собственный шаблон в диалоге подтверждения используйте шаблон, смотрите
 * {@link /doc/platform/developmentapl/interface-development/controls/openers/confirmation/#config-template инструкцию}
 * @see openPopup
 * @example
 * wml
 * <pre>
 *    <Controls.popup:Confirmation name="confirmationOpener">
 *    </Controls.popup:Confirmation>
 *
 *    <Controls.buttons:Button caption="open confirmation" on:click="_open()"/>
 * </pre>
 * js
 * <pre>
 *    class MyControl extends Control<IControlOptions>{
 *       ...
 *
 *        _open() {
 *           var config= {
 *              message: 'Save changes?'
 *              type: 'yesnocancel'
 *           }
 *           this._children.confirmationOpener.open(config).addCallback(function(result) {
 *              if (result === true) {
 *                  console.log('Пользователь выбрал "Да"');
 *              } else if (result === false) {
 *                  console.log('Пользователь выбрал "Нет"');
 *              } else {
 *                  console.log('Пользователь выбрал "Отмена"');
 *              }
 *           });
 *        }
 *     };
 * </pre>
 */

/*
 * Open confirmation popup.
 * @name Controls/_popup/interface/IConfirmationOpener#open
 * @function
 * @param {PopupOptions} templateOptions Confirmation options.
 * @returns {Deferred} The deferral will end with the result when the user closes the popup.
 * @remark
 * If you want use custom layout in the dialog you need to open popup via {@link dialog opener} using the basic template {@link ConfirmationTemplate}.
 */

/**
 * Статический метод для открытия окна подтверждения. При использовании метода не требуется создавать popup:Confirmation в верстке.
 * {@link /doc/platform/developmentapl/interface-development/controls/openers/confirmation/#open-popup Подробнее}.
 * @name Controls/_popup/interface/IConfirmationOpener#openPopup
 * @function
 * @param {Controls/popup:IConfirmationOpener} IConfirmationOptions Конфигурация окна подтверждения
 * @return {Promise<boolean>} Результат будет возвращен после того, как пользователь закроет всплывающее окно.
 * @static
 * @see open
 * @example
 * <pre>
 *    import {Confirmation} from 'Controls/popup';
 *    ...
 *    openConfirmation() {
 *        Confirmation.openPopup({
 *          message: 'Choose yes or no'
 *        }).then(function(result) {
 *          if (result === true) {
 *              console.log('Пользователь выбрал "Да"');
 *          } else if (result === false) {
 *              console.log('Пользователь выбрал "Нет"');
 *          } else {
 *              console.log('Пользователь выбрал "Отмена"');
 *          }
 *        });
 *    }
 * </pre>
 */
