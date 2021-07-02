import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/OpenUrl/Pages/Template';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _text: string =  'Страница, открытая кликом средней кнопкой по ТРЕТЬЕЙ записи списка.';
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
