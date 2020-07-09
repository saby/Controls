import {Memory} from 'Types/source';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Tabs/Accordion/Default/Template');

export default class ContainerBaseDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    protected _selectedKey: number = null;
    protected _items: [] = [{
            id: 1,
            title: 'title1',
            color: '#E7EFFB',
            borderColor: '#357DE1',
            hoverColor: '#D5E4F9',
            content: 'content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content'
        }, {
            id: 2,
            title: 'title2',
            color: '#E7FBEA',
            borderColor: '#158B2A',
            hoverColor: '#D5F9DB',
            content: 'content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content'
        }, {
            id: 3,
            title: 'title3',
            color: '#FBF5E7',
            borderColor: '#E1AD35',
            hoverColor: '#F9EED5',
            content: 'content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content'
        }, {
            id: 4,
            title: 'title4',
            color: '#FBE9E7',
            borderColor: '#E14C35',
            hoverColor: '#F9DAD5',
            content: 'content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content'
        }, {
            id: 5,
            title: 'title5',
            color: '#E7EFFB',
            borderColor: '#357DE1',
            hoverColor: '#D5E4F9',
            content: 'content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content content content content content content ' +
                'content content content content content content content content'
        }];

    _beforeMount() {
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
