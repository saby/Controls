import { TemplateFunction } from 'UI/Base';

/**
 * Данные для отображения парковочного шаблона.
 * @interface Controls/_dataSource/_parking/ViewConfig
 * @public
 * @author Северьянов А.А.
 */
export interface ViewConfig<TOptions = object> { // tslint:disable-line:interface-name
    /**
     * @name Controls/_dataSource/_parking/ViewConfig#template
     * @cfg {Function | String} Шаблон для отображения ошибки.
     */
    template: TemplateFunction | string;
    /**
     * @name Controls/_dataSource/_parking/ViewConfig#options
     * @cfg {Object} Параметры построяния шаблона ошибки.
     */
    options?: Partial<TOptions>;
}

/**
 * Обработчик ошибки.
 * Анализирует ошибку и определяет, какой парковочный шаблон нужно отобразить.
 * Принимает объект с параметрами ошибки и возвращет {Controls/_dataSource/_parking/ViewConfig}, если ошибка распознана.
 * @interface Controls/_dataSource/_parking/Handler
 * @public
 * @author Северьянов А.А.
 */
export type Handler<TOptions = object> = (config: any) => ViewConfig<TOptions> | void;

/**
 * Обработчик парковочной
 * @function
 * @name Controls/_dataSource/_parking/Handler#function
 * @param {*} объект с параметрами
 * @return {void | Controls/_dataSource/_parking/ViewConfig}
 */
