import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as template from 'wml!Controls/_decorator/WrapURLs/WrapURLs';

/**
 * @interface Controls/_decorator/WrapURLs/IWrapURLsOptions
 * @public
 * @author Красильников А.С.
 */
export interface IWrapURLsOptions extends IControlOptions {
    /**
     * Декорируемый текст.
     * @demo Controls-demo/Decorator/WrapURLs/Index
     */
    value: string;
    /**
     * Определяет, следует ли переходить в новую вкладку при клике на ссылку.
     * @default true
     * @demo Controls-demo/Decorator/WrapURLs/NewTab/Index
     * @remark
     * true - Переход в новой вкладке.
     * false - Переход в текущей вкладке.
     */
    newTab?: boolean;
}

interface IMap {
    result: number;
    openDelimiter: number;
    linkHref: number;
    schemeHref: number;
    emailAddress: number;
    plainValue: number;
    closeDelimiter: number;
}

interface ILink {
    type: 'link';
    href: string;
    scheme: string;
}

interface IEmail {
    type: 'email';
    address: string;
}

interface IPlain {
    type: 'plain';
    value: string;
}

type Path = ILink | IEmail | IPlain;

/**
 * Графический контрол, декорирующий текст таким образом, что все ссылки в нем становятся активными и меняют свой внешний вид.
 * Активная ссылка - это элемент страницы, при клике на который происходит переход на внешний ресурс.
 * @remark
 * Поддерживаемые ссылки:
 * * Ссылка на web-страницу ({@link https://en.wikipedia.org/wiki/File_Transfer_Protocol ftp}, www, http, https).
 * * Ссылка на email адрес ([текст]@[текст].[текст от 2 до 6 знаков]).
 * * Ссылка на локальный файл ({@link https://en.wikipedia.org/wiki/File_URI_scheme file}).
 *
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_decorator.less">переменные тем оформления</a>
 *
 * @class Controls/_decorator/WrapURLs
 * @extends UI/Base:Control
 * @mixes Controls/_decorator/WrapURLs/IWrapURLsOptions
 * @public
 * @demo Controls-demo/Decorator/WrapURLs/Index
 *
 * @author Красильников А.С.
 */
class WrapURLs extends Control<IWrapURLsOptions, void> {
    protected _parsedText: Path[] = null;

    protected _template: TemplateFunction = template;

    protected _beforeMount(options: IWrapURLsOptions): void {
        this._parsedText = WrapURLs.parseText(options.value);
    }

    protected _beforeUpdate(newOptions: IWrapURLsOptions): void {
        const oldValue = this._options.value;
        const newValue = newOptions.value;

        if (oldValue !== newValue) {
            this._parsedText = WrapURLs.parseText(newValue);
        }
    }

    /**
     * $1 - Opening delimiter.
     * $2 - Web link.
     * $3 - Scheme to access the web resource.
     * $4 - Email address.
     * $5 - Plain text.
     * $6 - Closing delimiter.
     * @private
     */
    private static parseRegExp: RegExp = /([({\[⟨<«„‘'"]?)(?:(((?:https?|ftp|file):\/\/|www\.)\S+?)|(\S+@\S+(?:\.\S{2,6}?))|(\S*?))([)}\]⟩>»”’'".,:]?(?:\s|$))/g;

    private static mapExec: IMap = {
        result: 0,
        openDelimiter: 1,
        linkHref: 2,
        schemeHref: 3,
        emailAddress: 4,
        plainValue: 5,
        closeDelimiter: 6
    };

    private static pushLink(original: Path[], href: string, scheme: string): Path[] {
        if (!(href || scheme)) {
            return original;
        }

        original.push({
            href, scheme,
            type: 'link'
        });

        return original;
    }

    private static pushEmail(original: Path[], address: string): Path[] {
        if (!address) {
            return original;
        }

        original.push({
            address,
            type: 'email'
        });

        return original;
    }

    private static pushPlain(original: Path[], value: string): Path[] {
        if (!value) {
            return original;
        }

        const type = 'plain';
        const last: Path = original[original.length - 1];

        if (last && last.type === type) {
            last.value += value;
        } else {
            original.push({value, type});
        }

        return original;
    }

    private static parseText(text: string): Path[] {
        let iteration: number = 1;
        const maxIterations = 10000;
        const parsedText: Path[] = [];
        let exec: RegExpExecArray = WrapURLs.parseRegExp.exec(text);

        while (exec) {
            if (text.length === WrapURLs.parseRegExp.lastIndex && !exec[WrapURLs.mapExec.result]) {
                WrapURLs.parseRegExp.lastIndex = 0;
                break;
            }

            WrapURLs.pushPlain(parsedText, exec[WrapURLs.mapExec.openDelimiter]);
            WrapURLs.pushLink(parsedText, exec[WrapURLs.mapExec.linkHref], exec[WrapURLs.mapExec.schemeHref]);
            WrapURLs.pushEmail(parsedText, exec[WrapURLs.mapExec.emailAddress]);
            WrapURLs.pushPlain(parsedText, exec[WrapURLs.mapExec.plainValue]);
            WrapURLs.pushPlain(parsedText, exec[WrapURLs.mapExec.closeDelimiter]);

            /**
             * Protection against looping.
             */
            if (iteration >= maxIterations) {
                break;
            }
            iteration++;
            exec = WrapURLs.parseRegExp.exec(text);
        }

        return parsedText;
    }

    static getOptionTypes() {
        return {
            newTab: descriptor(Boolean),
            value: descriptor(String).required()
        };
    }

    static getDefaultOptions() {
        return {
            newTab: true
        };
    }
}

export default WrapURLs;
