import {TemplateFunction} from 'UI/Base';
import {
    default as CollectionItem,
    IOptions as CollectionItemOptions
} from 'Controls/_display/CollectionItem';

const DEFAULT_FOOTER_TEMPLATE = 'Controls/list:FooterTemplate';

/**
 * Интерфейс, представляющий структуру объекта конфигурации {@link Footer класса модели футера}
 */
export interface IOptions extends CollectionItemOptions {
    /**
     * true - если футер должен прилипать к низу списка
     */
    sticky?: boolean;
    /**
     * Шаблон содержимого футера
     */
    contentTemplate?: TemplateFunction | string;
}

/**
 * Класс модели, содержащий всю необходимую информация для рендера футера списка
 */
export class Footer extends CollectionItem {
    //region options fields
    protected _$sticky: boolean;
    protected _$contentTemplate: TemplateFunction;
    //endregion

    constructor(options: IOptions) {
        super(options);
    }

    /**
     * Возвращает true если футер должен прилипать к низу списка
     */
    isStickedToBottom(): boolean {
        return this._$sticky;
    }

    /**
     * Задает должен ли футер прилипать к низу списка
     */
    setStickedToBottom(sticky: boolean): void {
        if (this._$sticky === sticky) {
            return;
        }

        this._$sticky = sticky;
        this._nextVersion();
    }

    /**
     * Возвращает основной шаблон футера, который реализует базовую логику рендера
     */
    getTemplate(): TemplateFunction | string {
        return DEFAULT_FOOTER_TEMPLATE;
    }

    /**
     * Возвращает шаблон содержимого футера, который встраивается в базовую логику рендера
     */
    getContentTemplate(): TemplateFunction | string {
        return this._$contentTemplate;
    }

    /**
     * Задает новый шаблон для содержимого футера
     */
    setContentTemplate(template: TemplateFunction | string): void {
        if (this._$contentTemplate === template) {
            return;
        }

        this._$contentTemplate = template;
        this._nextVersion();
    }
}

Object.assign(Footer.prototype, {
    '[Controls/_display/Footer]': true,
    _moduleName: 'Controls/display:Footer',
    _instancePrefix: 'collection-footer-',
    _$sticky: false,
    _$contentTemplate: null
});
