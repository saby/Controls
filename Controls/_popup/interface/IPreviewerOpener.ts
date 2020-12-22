import { IOpener } from 'Controls/_popup/interface/IBaseOpener';
import { IStickyPopupOptions } from 'Controls/_popup/interface/ISticky';



export interface IPreviewerPopupOptions extends IStickyPopupOptions {
    id?: string;
    closingTimerId?: number;
    openingTimerId?: number;
    isCancelOpening?: boolean;
}

/**
 * Интерфейс для опций окна предпросмотра.
 *
 * @interface Controls/_popup/interface/IPreviewerOpener
 * @private
 * @author Красильников А.С.
 */
export interface IPreviewerOpener extends IOpener {
    readonly '[Controls/_popup/interface/IPreviewerOpener]': boolean;
}
