import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// @ts-ignore
import Template = require('wml!Controls-demo/BreadCrumbs/ContainerWidth/ContainerWidth');
import {Model, Record} from 'Types/entity';
import {UnregisterUtil, RegisterUtil} from 'Controls/event';

class ContainerWidth extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected items0: Record[];
    protected items1: Record[];
    protected items2: Record[];
    protected _containerWidth: number = 500;
    protected _containerWidthHeadingPath: number = 300;

    protected _beforeMount(): void {
        this.items0 = [
            {
                id: 0,
                title: 'Главный офис Ярославль',
                secondTitle: 'тест1',
                parent: null
            },
            {
                id: 1,
                title: 'Разработка',
                secondTitle: 'тест1',
                parent: null
            },
            {
                id: 2,
                title: 'Платформа',
                secondTitle: 'тест2',
                parent: 1
            },
            {
                id: 3,
                title: 'Интерфейсный фреймворк',
                secondTitle: 'тест3',
                parent: 2
            },
            {
                id: 4,
                title: 'Контролы',
                secondTitle: 'тест4',
                parent: 3
            },
            {
                id: 5,
                title: 'Контролы ядра',
                secondTitle: 'тест5',
                parent: 4
            }
        ].map((item) => {
            return new Model({
                rawData: item,
                keyProperty: 'id'
            });
        });
        this.items1 = [{
            id: 1,
            title: 'Интерфейсный фреймворк Интерфейсный фреймворк Интерфейсный фреймворк Интерфейсный фреймворк Интерфейсный фреймворк',
            secondTitle: 'тест1'
        }].map((item) => {
            return new Model({
                rawData: item,
                keyProperty: 'id'
            });
        });
        this.items2 = [{
            id: 1,
            title: '1',
            secondTitle: 'тест1'
        }, {
            id: 6,
            title: 'Интерфейсный фреймворк Интерфейсный фреймворк Интерфейсный фреймворк Интерфейсный фреймворк Интерфейсный фреймворк',
            secondTitle: 'тест6'
        }].map((item) => {
            return new Model({
                rawData: item,
                keyProperty: 'id'
            });
        });
    }

    protected _afterMount(): void {
        RegisterUtil(this, 'controlResize', this._onResize.bind(this));
    }
    protected _beforeUnmount(): void {
        UnregisterUtil(this, 'controlResize');
    }

    private _onResize(): void {
        if (this._container.clientWidth !== this._containerWidth) {
            this._containerWidth = this._container.clientWidth;
        }
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default ContainerWidth;
