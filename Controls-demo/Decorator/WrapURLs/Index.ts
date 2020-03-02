import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/WrapURLs/WrapURLs');
import 'css!Controls-demo/Controls-demo';

class WrapURLs extends Control<IControlOptions> {
    protected _value = 'Гиперссылки (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a), или просто ссылки, являются фундаментальной основой Web приложения.' +
        'Причина этого в том, что они обеспечивают доступ к документам. Например к web страницам с различными протоколами:\n' +
        '1. ftp - https://en.wikipedia.org/wiki/File_Transfer_Protocol\n' +
        '2. http - https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol\n' +
        '3. https - https://en.wikipedia.org/wiki/HTTPS\n' +
        'или доступ через 3 волшебные буквы WWW www.google.com, к локальным файлам file:///C:/Users/, или email tensor@tensor.ru.';

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}

export default WrapURLs;
