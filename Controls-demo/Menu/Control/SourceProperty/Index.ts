import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/SourceProperty/Index');
import {Memory} from 'Types/source';

class Source extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            data: [
                {
                    key: 1,
                    title: 'Разработка',
                    node: true,
                    parent: null,
                    subMenuSource: new Memory({
                        data: [
                            {key: 3, title: 'Задача в разработку'},
                            {key: 4, title: 'Ошибка'},
                            {key: 5, title: 'Merge request'},
                            {key: 6, title: 'Работы на стендах'},
                            {key: 7, title: 'Работы по проектам'}],
                        keyProperty: 'key'
                    })
                },
                {
                    key: 2,
                    title: 'Продажи',
                    node: true,
                    parent: null,
                    subMenuSource: {
                        moduleName: 'Types/source:Memory',
                        options: {
                            data: [
                                {key: 8, title: 'Изменение прайса'},
                                {key: 9, title: 'Согласование участия в торгах'},
                                {key: 10, title: 'Настройка роуминга'},
                                {key: 11, title: 'Вебинар в филиале'},
                                {key: 12, title: 'Создание темы отношений'}],
                            keyProperty: 'key'
                        }
                    }
                }
            ],
            keyProperty: 'key'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Source;
