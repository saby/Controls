export interface IConfirmationFooterOptions {
    type?: string;
    yesCaption?: string;
    noCaption?: string;
    cancelCaption?: string;
    primaryAction?: string;
    okCaption?: string;
    buttons?: IConfirmationButton[];
}
interface IConfirmationButton {
    caption: string;
    value: boolean | string;
    viewMode?: string;
    buttonStyle?: string;
    primary?: boolean;
}

/**
 * Интерфейс для опций футера диалога подтверждения.
 *
 * @interface Controls/_popup/interface/IConfirmationFooter
 * @public
 * @author Красильников А.С.
 */
export interface IConfirmationFooter {
    readonly '[Controls/_popup/interface/IConfirmationFooter]': boolean;
}

/**
 * @name Controls/_popup/interface/IConfirmationFooter#type
 * @cfg {String} Тип диалогового окна. Определяет с каким результатом будет закрыто окно диалога.
 * @variant ok (Результат: undefined)
 * @variant yesno (Результат: true/false)
 * @variant yesnocancel (Результат: true/false/undefined)
 * @default yesno
 */

/**
 * @name Controls/_popup/interface/IConfirmationFooter#yesCaption
 * @cfg {String} Текст кнопки подтверждения.
 * @default Да
 */

/**
 * @name Controls/_popup/interface/IConfirmationFooter#noCaption
 * @cfg {String} Текст кнопки отрицания
 * @default Нет
 */

/**
 * @name Controls/_popup/interface/IConfirmationFooter#cancelCaption
 * @cfg {String} Текст кнопки отмены
 * @default Отмена
 */

/**
 * @name Controls/_popup/interface/IConfirmationFooter#primaryAction
 * @cfg {String} Определяет, какая кнопка будет активирована по нажатию ctrl+enter
 * @variant yes
 * @variant no
 * @variant cancel
 * @default yes
 */

/**
 * @name Controls/_popup/interface/IConfirmationFooter#okCaption
 * @cfg {String} Текст кнопки "принять"
 * @default ОК
 */

/**
 * @typedef {Boolean|undefined} Result
 * @remark
 * true - Нажата кнопка "Да"
 * false - Нажата кнопка "Нет"
 * undefined - Нажата кнопка "ОК" или "Отмена"
 */

/**
 * @event Происходит при клике по кнопке футера.
 * @name Controls/_popup/interface/IConfirmationFooter#result
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события
 * @param {Result} Результат
 */

/**
 * @name Controls/_popup/interface/IConfirmationFooter#buttons
 * @cfg {Array.<Controls/_popup/interface/IConfirmationFooter/buttons.typedef>} Описывает набор кнопок с результатами,
 * позиционирующихся в нижней части окна подтверждения.
 * @example
 * <pre>
 * <Controls.popupTemplate:ConfirmationDialog
 *                         name="Confirm"
 *                         message="Сохранить изменения?"
 *                         buttons="{{_buttons}}"/>
 * </pre>
 * <pre>
 *     this._buttons = [{
 *      caption: 'Да',
 *      primary: true,
 *      buttonStyle: primary,
 *      value: true
 *     },
 *     {
 *      caption: 'Собрать без конвертацией',
 *      viewMode: 'link',
 *      value: false
 *     }];
 * </pre>
 * @demo Controls-demo/PopupTemplate/Confirmation/Buttons/Index
 */

/**
 * @typedef {Array} Controls/_popup/interface/IConfirmationFooter/buttons
 * @property {String} [buttons.caption] Подпись к кнопке.
 * @property {Boolean|String} [buttons.value] Значение результата, которое вернет кнопка при нажатии.
 * @property {String} [buttons.viewMode] Режим отображения кнопки.
 * @property {String} [buttons.buttonStyle] Стиль отображения кнопки.
 * @property {boolean} [buttons.primary] Определяет будет ли у кнопки стиль primary.
 */
