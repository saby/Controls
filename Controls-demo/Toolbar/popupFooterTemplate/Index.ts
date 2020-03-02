import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Toolbar/popupFooterTemplate/popupFooterTemplate');
import 'css!Controls-demo/Controls-demo';
import source = require('Types/source');

class FooterTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    static _theme: string[] = ['Controls/Classes'];
    protected _getMemorySource = (items) => {
        return new source.Memory({
            keyProperty: 'id',
            data: items
        });
    };
    protected _defaultItems = [
        {
            id: '1',
            icon: 'icon-Print',
            title: 'Распечатать',
            '@parent': false,
            parent: null
        },
        {
            id: '2',
            viewMode: 'icon',
            icon: 'icon-Link',
            title: 'Скопировать в буфер',
            '@parent': false,
            parent: null
        },
        {
            id: '3',
            showType: 0,
            title: 'Прикрепить к',
            '@parent': false,
            parent: null
        },
        {
            id: '4',
            showType: 0,
            title: 'Проекту',
            '@parent': false,
            parent: '3'
        },
        {
            id: '5',
            showType: 0,
            title: 'Этапу',
            '@parent': false,
            parent: '3'
        },
        {
            id: '6',
            icon: 'icon-EmptyMessage',
            fontColorStyle: 'secondary',
            showHeader: true,
            viewMode: 'link',
            iconStyle: 'secondary',
            contrastBackground: true,
            title: 'Обсудить',
            '@parent': true,
            parent: null,
            readOnly: true
        },
        {
            id: '7',
            showType: 0,
            title: 'Видеозвонок',
            '@parent': false,
            parent: '6'
        },
        {
            id: '8',
            showType: 0,
            title: 'Сообщение',
            '@parent': false,
            parent: '6'
        }
    ];
}
export default FooterTemplate;
