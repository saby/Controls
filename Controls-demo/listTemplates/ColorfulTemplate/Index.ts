import {Memory} from 'Types/source';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Images from 'Controls-demo/resources/Images';
import * as template from 'wml!Controls-demo/listTemplates/ColorfulTemplate/ColorfulTemplate';

class ColorfulTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _roundBorder: object = {
        tr: 'l',
        tl: 'l',
        br: 'l',
        bl: 'l'
    };
    protected _source: Memory = new Memory({
        data: [
            {
                title: 'Заголовок №1',
                description: 'Описание №1',
                photoUrl: Images.tile.tile1,
                dominant: '33, 49, 65',
                complementary: '202, 216, 119',
                dominantTheme: 'dark'
            },
            {
                title: 'Заголовок №2',
                description: 'Описание №2',
                photoUrl: Images.tile.tile2,
                dominant: '73, 73, 73',
                complementary: '119, 195, 216',
                dominantTheme: 'dark'
            },
            {
                title: 'Заголовок №3',
                description: 'Описание №3',
                photoUrl: Images.tile.tile3,
                dominant: '231, 227, 231',
                complementary: '154, 28, 154',
                dominantTheme: 'light'
            },
            {
                title: 'Заголовок №4',
                description: 'Описание №4',
                photoUrl: Images.tile.tile4,
                dominant: '239, 183, 155',
                complementary: '162, 54, 0',
                dominantTheme: 'light'
            }
        ]
    });

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default ColorfulTemplate;
