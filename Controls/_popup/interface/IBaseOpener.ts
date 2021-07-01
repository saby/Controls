import {IBasePopupOptions} from 'Controls/_popup/interface/IBasePopupOptions';

export {
    IBasePopupOptions
};

export interface IOpener {
    open(popupOptions: IBasePopupOptions, controller: string): Promise<string | undefined>;
    close(): void;
    isOpened(): boolean;
}

/**
 * Интерфейс базовых опций опенеров.
 * @extends Controls/_popup/interface/IBasePopupOptions
 * @public
 * @author Красильников А.С.
 */
export interface IBaseOpener {
    readonly '[Controls/_popup/interface/IBaseOpener]': boolean;
}

/*  https://online.sbis.ru/opendoc.html?guid=f654ff87-5fa9-4c80-a16e-fee7f1d89d0f
 * Открывает всплывающее окно.
 * @function Controls/_popup/interface/IBaseOpener#open
 * @param popupOptions Конфигурация всплывающего окна
 * @param controller Контрол-контроллер для всплывающего окна.
 */

/*
 * Opens a popup
 * @function Controls/_popup/interface/IBaseOpener#open
 * @param popupOptions Popup configuration
 * @param controller Popup Controller
 */

/* https://online.sbis.ru/opendoc.html?guid=f654ff87-5fa9-4c80-a16e-fee7f1d89d0f
 * @name Controls/_popup/interface/IBaseOpener#close
 * @description Метод вызова закрытия всплывающего окна
 * @function
 * @example
 * wml
 * <pre>
 *    <Controls.popup:Sticky name="sticky" template="Controls-demo/Popup/TestDialog">
 *          <ws:direction vertical="bottom" horizontal="left"/>
 *          <ws:targetPoint vertical="bottom" horizontal="left"/>
 *    </Controls.popup:Sticky>
 *
 *    <div name="target">{{_text}}</div>
 *
 *    <Controls.buttons:Button name="openStickyButton" caption="open sticky" on:click="_open()"/>
 *    <Controls.buttons:Button name="closeStickyButton" caption="close sticky" on:click="_close()"/>
 * </pre>
 * js
 * <pre>
 *   class MyControl extends Control<IControlOptions>{
 *      ...
 *
 *      _open() {
 *          var popupOptions = {
 *              target: this._children.target,
 *              opener: this._children.openStickyButton,
 *              templateOptions: {
 *                  record: this._record
 *              }
 *          }
 *          this._children.sticky.open(popupOptions);
 *      }
 *
 *      _close() {
 *          this._children.sticky.close()
 *      }
 *      ...
 *  }
 *  </pre>
 *  @see open
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#isOpened
 * @description Возвращает информацию о том, открыто ли всплывающее окно.
 * @function
 */

/*
 * @name Controls/_popup/interface/IBaseOpener#isOpened
 * @description Popup opened status.
 * @function
 */

/**
 * @event Происходит, когда дочерний контрол всплывающего окна инициирует событие 'sendResult'.
 * @name Controls/_popup/interface/IBaseOpener#result
 * @example
 * В этом примере мы подписываемся на событие 'result' и в его обработчике сохраняем данные с шаблона.
 * <pre>
 *    // MainControl.wml
 *    <Controls.popup:Stack on:result="_popupResultHandler()" />
 * </pre>
 *
 * <pre>
 *    // MainControl.js
 *    class MainControl extends Control<IControlOptions>{
 *       ...
 *       _popupResultHandler(event, userData) {
 *          this._saveUserData(userData);
 *       }
 *       ...
 *    };
 * </pre>
 *
 * <pre>
 *    // popupTemplate.js
 *   class PopupTemplate extends Control<IControlOptions>{
 *       ...
 *       _sendDataToMainControl(userData) {
 *          this._notify('sendResult', [userData], { bubbling: true});
 *       }
 *       ...
 *    });
 * </pre>
 */

/*
 * @event Occurs when child control of popup notify "sendResult" event.
 * @name Controls/_popup/interface/IBaseOpener#result
 * @example
 * In this example, we subscribe to result event and save user data.
 * <pre>
 *    // MainControl.wml
 *    <Controls.popup:Stack on:result="_popupResultHandler()" />
 * </pre>
 *
 * <pre>
 *    // MainControl.js
 *    class MainControl extends Control<IControlOptions>{
 *       ...
 *       _popupResultHandler(event, userData) {
 *          this._saveUserData(userData);
 *       }
 *       ...
 *    });
 * </pre>
 *
 * <pre>
 *    // popupTemplate.js
 *    class PopupTemplate extends Control<IControlOptions>{
 *       ...
 *       _sendDataToMainControl(userData) {
 *          this._notify('sendResult', [userData], { bubbling: true});
 *       }
 *       ...
 *    });
 * </pre>
 */

/**
 * @event Происходит при открытии всплывающего окна.
 * @name Controls/_popup/interface/IBaseOpener#open
 * @param {Controls/_popup/interface/IBasePopupOptions} popupOptions Конфигурация окна.
 * @example
 * В этом примере мы подписываемся на событие 'open' и в его обработчике меняем состояние '_popupOpened'
 * <pre>
 *    <Controls.popup:Stack on:open="_popupOpenHandler()" />
 * </pre>
 *
 * <pre>
 *    class MyControl extends Control<IControlOptions>{
 *       ...
 *       _popupOpenHandler() {
 *          this._popupOpened = true;
 *          this._changeStatus(this._popupOpened);
 *       }
 *       ...
 *    }
 * </pre>
 */

/*
 * @event Occurs when popup is opened.
 * @name Controls/_popup/interface/IBaseOpener#open
 * @example
 * In this example, we subscribe to open event and change text at input control
 * <pre>
 *    <Controls.popup:Stack on:open="_popupOpenHandler()" />
 * </pre>
 *
 * <pre>
 *    class MyControl extends Control<IControlOptions>{
 *       ...
 *       _popupOpenHandler() {
 *          this._popupOpened = true;
 *          this._changeStatus(this._popupOpened);
 *       }
 *       ...
 *    };
 * </pre>
 */

/**
 * @event Происходит при закрытии всплывающего окна.
 * @name Controls/_popup/interface/IBaseOpener#close
 * @example
 * В этом примере мы подписываемся на событие 'close' и в его обработчике удаляем элемент из списка.
 * <pre>
 *    <Controls.popup:Stack on:close="_popupCloseHandler()" />
 * </pre>
 *
 * <pre>
 *    class MyControl extends Control<IControlOptions>{
 *       ...
 *       _popupCloseHandler() {
 *          this._removeItem(this._currentItem);
 *       }
 *       ...
 *    };
 * </pre>
 */

/*
 * @event Occurs when popup is closed.
 * @name Controls/_popup/interface/IBaseOpener#close
 * @example
 * In this example, we subscribe to close event and remove item at list
 * <pre>
 *    <Controls.popup:Stack on:close="_popupCloseHandler()" />
 * </pre>
 *
 * <pre>
 *    class MyControl extends Control<IControlOptions>{
 *       ...
 *       _popupCloseHandler() {
 *          this._removeItem(this._currentItem);
 *       }
 *       ...
 *    };
 * </pre>
 */

export interface IDataLoader {
    key?: string;
    module: string;
    params?: Record<string, unknown>;
    dependencies?: string[];
    await?: boolean;
}
