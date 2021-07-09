/**
 * Интерфейс для окна уведомления.
 *
 * @interface Controls/_popupTemplate/Notification/interface/INotification
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_popupTemplate/Notification/interface/INotification#style
 * @cfg {String} Устанавливает стиль отображения окна уведомления.
 * @default secondary
 * @variant warning
 * @variant secondary
 * @variant success
 * @variant danger
 * @default secondary
 */

/**
 * @name Controls/_popupTemplate/Notification/interface/INotification#closeButtonVisibility
 * @cfg {Boolean} Устанавливает видимость кнопки, закрывающей окно.
 * @default true
 */

export interface INotificationOptions {
    style?: String;
    icon?: String;
    text?: String;
    closeButtonVisibility?: Boolean;
}

interface INotification {
    readonly '[Controls/_popupTemplate/Notification/interface/INotification]': boolean;
}

export default INotification;
