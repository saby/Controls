import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/StickyHeader/StickedOnCondition/Index');
import {Memory} from 'Types/source';
import 'css!Controls-demo/Controls-demo';

export default class ListHeaderDemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this.getFewCategories()
        });
    }

    private getFewCategories(): Array<{
        id: number,
        title: string,
        description: string,
        sticked?: boolean
    }> {
        return [
            {
                id: 1,
                title: 'Notebooks',
                description: 'Trusted Reviews ranks all your top laptop and notebook options, whether you want a ...'
            },
            {
                id: 2,
                title: 'Tablets',
                description: 'Tablets are great for playing games, reading, homework, keeping kids entertained in the back seat of the car',
                sticked: true
            },
            {
                id: 3,
                title: 'Laptop computers',
                description: 'Explore PCs and laptops to discover the right device that powers all that you do'
            },
            {
                id: 4,
                title: 'Apple gadgets',
                description: 'Explore new Apple accessories for a range of Apple products'
            },
            {
                id: 5,
                title: 'Android gadgets',
                description: 'These 25 clever phone accessories and Android-compatible gadgets'
            },
            {
                id: 6,
                title: 'Notebooks',
                description: 'Trusted Reviews ranks all your top laptop and notebook options, whether you want a ...',
                sticked: true
            },
            {
                id: 7,
                title: 'Tablets',
                description: 'Tablets are great for playing games, reading, homework, keeping kids entertained in the back seat of the car'
            },
            {
                id: 8,
                title: 'Laptop computers',
                description: 'Explore PCs and laptops to discover the right device that powers all that you do'
            },
            {
                id: 9,
                title: 'Apple gadgets',
                description: 'Explore new Apple accessories for a range of Apple products'
            },
            {
                id: 10,
                title: 'Android gadgets',
                description: 'These 25 clever phone accessories and Android-compatible gadgets'
            }
        ];
    }

    static _theme: string[] = ['Controls/Classes'];
}
