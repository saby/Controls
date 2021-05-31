import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/StickyCallback/Index';
import {Memory} from 'Types/source';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this.getFewCategories()
        });
    }

    private getFewCategories(): Array<{
        key: number,
        title: string,
        description: string
    }> {
        return [
            {
                key: 1,
                title: 'Notebooks',
                description: 'Trusted Reviews ranks all your top laptop and notebook options, whether you want a ...'
            },
            {
                key: 2,
                title: 'Tablets',
                description: 'Tablets are great for playing games, reading, homework, keeping kids entertained in the back seat of the car'
            },
            {
                key: 3,
                title: 'Laptop computers 2',
                description: 'Explore PCs and laptops to discover the right device that powers all that you do'
            },
            {
                key: 4,
                title: 'Apple gadgets',
                description: 'Explore new Apple accessories for a range of Apple products'
            },
            {
                key: 5,
                title: 'Android gadgets 2',
                description: 'These 25 clever phone accessories and Android-compatible gadgets'
            },
            {
                key: 6,
                title: 'Notebooks',
                description: 'Trusted Reviews ranks all your top laptop and notebook options, whether you want a ...'
            },
            {
                key: 7,
                title: 'Tablets',
                description: 'Tablets are great for playing games, reading, homework, keeping kids entertained in the back seat of the car'
            },
            {
                key: 8,
                title: 'Laptop computers',
                description: 'Explore PCs and laptops to discover the right device that powers all that you do'
            },
            {
                key: 9,
                title: 'Apple gadgets',
                description: 'Explore new Apple accessories for a range of Apple products'
            },
            {
                key: 10,
                title: 'Android gadgets',
                description: 'These 25 clever phone accessories and Android-compatible gadgets'
            }
        ];
    }

    protected _stickyCallback(item: any): boolean {
        return item.get('title') === 'Laptop computers 2' || item.get('title') === 'Android gadgets 2';
    }
}
