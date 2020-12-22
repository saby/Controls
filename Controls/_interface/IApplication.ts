import {IHTMLOptions, IHTML} from 'UI/Base';

/**
 * Интерефейс для контролов, поддерживающих конфигурацию метатегов html-документа.
 * @public
 * @author Санников К.А.
 */
export default interface IApplication extends IHTML {
    readonly '[Controls/_interface/IApplication]': boolean
};

/**
 * @name Controls/_interface/IApplication#scripts
 * @cfg {Content} Описание скриптов, которые будут вставлены в тег head.
 * @example
 * <pre class="brush: html">
 * <ws:scripts>
 *     <ws:Array>
 *         <ws:Object type="text/javascript" src="/cdn/Maintenance/1.0.1/js/checkSoftware.js" data-pack-name="skip" async="" />
 *     </ws:Array>
 * </ws:scripts>
 * </pre>
 */

/** 
 * @name Controls/_interface/IApplication#links
 * @cfg {Content} Позволяет описывать ссылки на дополнительные ресурсы, которые необходимы при загрузке страницы.
 * @example
 * <pre class="brush: html">
 * <ws:links>
 *     <ws:Array>
 *         <ws:Object rel="shortcut icon" href="{{_options.wsRoot}}img/themes/wi_scheme/favicon.ico?v=2" type="image/x-icon"/>
 *     </ws:Array>
 * </ws:links>
 * </pre>
 */

/** 
 * @name Controls/_interface/IApplication#headJson
 * @deprecated Используйте одну из опций: {@link scripts} или {@link links}.
 * @cfg {object} Разметка, которая будет встроена в содержимое тега head.
 * Используйте эту опцию, чтобы подключить на страницу внешние библиотеки (скрипты), стили или шрифты.
 * @remark
 * Список разрешённых тегов: link, script, meta, title.
 * Список разрешённых атрибутов: rel, as, name, sizes, crossorigin, type, href, property, http-equiv, content, id, class.
 * @example
 * <pre class="brush: html">
 * <ws:headJson>
 *     <ws:Array>
 *         <ws:Array>
 *             <ws:String>link</ws:String>
 *             <ws:Object
 *                 rel="preload"
 *                 as="font"
 *                 href="/cdn/TensorFont/1.0.3/TensorFont/TensorFont.woff2"
 *                 type="font/woff2"
 *                 crossorigin="crossorigin"/>
 *         </ws:Array>
 *         <ws:Array>
 *             <ws:String>meta</ws:String>
 *             <ws:Object name="apple-itunes-app" content="app-id=12345"/>
 *         </ws:Array>
 *     </ws:Array>
 * </ws:headJson>
 * </pre>
 */

/**
 * @name Controls/_interface/IApplication#title
 * @cfg {String} Значение опции встраивается в содержимое тега title, который определяет заголовок веб-страницы и подпись на вкладке веб-браузера.
 */

/**
 * @name Controls/_interface/IApplication#title
 * @cfg {String} title of the tab
 */

export interface IAttributes {
    [index: string]: string | undefined
}

export type HeadJson = [string, Record<string, string>][];

export interface IApplicationOptions extends IHTMLOptions {
    scripts?: Array<IAttributes>;
    links?: Array<IAttributes>;
    headJson?: HeadJson;
    title?: string;
}
