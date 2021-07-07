import {IBasePopupOptions} from 'Controls/_popup/interface/IBasePopupOptions';

/**
 * Интерфейс опций окна-страницы.
 * @public
 * @extends Controls/_popup/interface/IBasePopupOptions
 * @author Красильников А.С.
 */
interface IPagePopupOptions extends IBasePopupOptions {
    pageId: string;
}

/**
 * @name Controls/_popup/interface/IPagePopupOptions#pageId
 * @cfg {String} Идентификатор страницы указанный в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/application-configuration/create-page/new-page/ конфигурации страницы}
 */
