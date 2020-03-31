import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/IconSize/Index');
import {Memory} from 'Types/source';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Menu/Menu';

class IconSize extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {

        this._source = new Memory({
            data: [
                { key: 1, title: 'Work phone', icon: 'icon-PhoneWork' },
                { key: 2, title: 'Mobile phone', icon: 'icon-PhoneCell' },
                { key: 3, title: 'Home phone', icon: 'icon-Home' },
                { key: 4, title: 'Telegram', icon: 'icon-Telegram' },
                { key: 5, title: 'e-mail', icon: 'icon-Email' },
                { key: 6, title: 'Skype', icon: 'icon-Skype' },
                { key: 7, title: 'ICQ', icon: 'icon-Icq' }
            ],
            keyProperty: 'key'
        });
    }
}
export default IconSize;