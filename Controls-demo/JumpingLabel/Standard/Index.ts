import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import controlTemplate = require('wml!Controls-demo/JumpingLabel/Standard/Standard');

import 'Controls/input';

class Standard extends Control<IControlOptions> {
    private _source: Memory = new Memory({
        data: [
            {id: 1, title: 'Sasha', text: 'test'},
            {id: 2, title: 'Dmitry', text: 'test'},
            {id: 3, title: 'Andrey', text: 'test'},
            {id: 4, title: 'Aleksey', text: 'test'},
            {id: 5, title: 'Sasha', text: 'test'},
            {id: 6, title: 'Ivan', text: 'test'},
            {id: 7, title: 'Petr', text: 'test'},
            {id: 8, title: 'Roman', text: 'test'},
            {id: 9, title: 'Maxim', text: 'test'}
        ],
        keyProperty: 'id'
    });

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Standard;
