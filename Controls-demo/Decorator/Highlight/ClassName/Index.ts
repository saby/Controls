import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Highlight/ClassName/ClassName');

class ClassName extends Control<IControlOptions> {
    protected _value = 'Наша мама мыла раму.\n' +
        'Кто бы вымыл нашу маму?\n' +
        'Вся она в песке и пенке,\n' +
        'Поцарапаны коленки.\n' +
        'Если я вдруг магом стану,\n' +
        'Сможет рама вымыть маму.';
    protected _highlightedValue = 'мама маму рама';
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Decorator/Highlight/ClassName/ClassName'];

    static _theme: string[] = ['Controls/Classes'];
}

export default ClassName;
