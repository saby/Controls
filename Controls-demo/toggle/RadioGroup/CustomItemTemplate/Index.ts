import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from "Types/source";
import Template = require('wml!Controls-demo/toggle/RadioGroup/CustomItemTemplate/Template');
import itemTemplate = require('wml!Controls-demo/toggle/RadioGroup/CustomItemTemplate/resources/SingleItemTemplate');

class CustomItemTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _itemTemplate: TemplateFunction = itemTemplate;
    protected _selectedKey: string = '1';
    protected _selectedKey2: string = '1';
    protected _source: Memory;
    protected _source2: Memory;
    protected _displayProperty: string = 'caption';

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            displayProperty: 'caption',
            data: [{
                id: '1',
                title: 'State1',
                caption: 'Additional caption1'
            }, {
                id: '2',
                title: 'State2',
                caption: 'Additional caption2',
                templateTwo: 'wml!Controls-demo/toggle/RadioGroup/CustomItemTemplate/resources/SingleItemTemplate'
            }, {
                id: '3',
                title: 'State3',
                caption: 'Additional caption3'
            }]
        });
        this._source2 = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    title: 'Оплата по терминалу в точке продаж',
                    text: 'Заключите договор с банком о предоставлении в аренду эквайринговых терминалов. Настройте' +
                        ' их на рабочем месте и получайте оплату банковскими картами от Клиентов.'
                },
                {
                    id: '2',
                    title: 'Онлайн-оплата через интернет',
                    text: 'Включите возможность приема онлайн-оплат для выставленных счетов или для бронирования ' +
                        'столика в ресторане. После успешной оплаты СБИС сам позаботиться о печати кассового чека' +
                        ' на ККТ и отправит его покупателю.'
                },
                {
                    id: '3',
                    title: 'QR-код',
                    text: 'Подключите возможность оплаты по счету в ресторане с помощью графического кода. Для ' +
                        'оплаты клиенту достаточно открыть приложение банка и сканировать QR-код на счете.'
                }
            ]
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default CustomItemTemplate;
