import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_calendar/MonthSlider/Slider/Slider';
import * as coreMerge from 'Core/core-merge';
import {descriptor} from 'Types/entity';

// Компонент можно сделать публичным, но надо придумать более подходящее название. Данный компонент не листает
// переданные ему контейнеры как это делает класический слайдер, а анимирует смену данных используя один и тот же шаблон
// Приватные методы и константы, возможно, можно выделить в отдельный слой абстракции для анимаций и
// переиспользовать в других компонентах.

const ANIMATIONS_DATA = {
        slideRight: {
            preAnimationInClasses: 'controls-MonthSlider-Slider__slideLeftRight-left',
            preAnimationOutClasses: 'controls-MonthSlider-Slider__slideLeftRight-center',
            animationInClasses: 'controls-MonthSlider-Slider__slideLeftRight-animate controls-MonthSlider-Slider__slideLeftRight-center',
            animationOutClasses: 'controls-MonthSlider-Slider__slideLeftRight-animate controls-MonthSlider-Slider__slideLeftRight-right'
        },
        slideLeft: {
            preAnimationInClasses: 'controls-MonthSlider-Slider__slideLeftRight-right',
            preAnimationOutClasses: 'controls-MonthSlider-Slider__slideLeftRight-center',
            animationInClasses: 'controls-MonthSlider-Slider__slideLeftRight-animate controls-MonthSlider-Slider__slideLeftRight-center',
            animationOutClasses: 'controls-MonthSlider-Slider__slideLeftRight-animate controls-MonthSlider-Slider__slideLeftRight-left'
        }
    };
const ANIMATIONS = {
        slideRight: 'slideRight',
        slideLeft: 'slideLeft'
    };

/**
 * Slider. Renders the element by template. Redraws with animation when changing data.
 * For example, the previous element leaves to the left, and the next one floats to the right.
 *
 * @class Controls/_calendar/MonthSlider:Base
 * @extends UI/Base:Control
 *
 * @private
 * @author Красильников А.С.
 * @noShow
 */

export default class Slider extends Control<IControlOptions> {
    _template: TemplateFunction = template;
    _items: object[];
    _currentItem: number = 0;
    _inAnimation: string;
    _outAnimation: string;
    _animationState: number = 0;

    protected _beforeMount(options): void {
        this._items = [{
            data: options.data,
            transitionClasses: ''
        }, {
            data: options.data,
            transitionClasses: ''
        }];
    }

    protected _beforeUpdate(options): void {
        this._inAnimation = options.inAnimation || options.animation;
        this._outAnimation = options.outAnimation || options.animation;
        if (this._options.data !== options.data) {
            this._currentItem = (this._currentItem + 1) % 2;

            // Подготавливаем контролы к анимации. Vdom применит модель чуть позже.
            // Анимацию начнем после это в _afterUpdate.
            this._prepareAnimation(options.data);
            this._animationState = 1;
            this._forceUpdate();
        }
    }

    protected _afterUpdate(): void {
        // Запускаем анимацию после вызова _prepareAnimation.
        // При других обновлениях интерфейса анимацию запускать не надо.
        if (this._animationState === 1) {
            // Хак. Функция вызывается синхронно после того как vdom применил классы установленные в _prepareAnimation
            // Необходимо что бы браузер пересчитал верстку, что бы контейнеры переместились в нужные позиции.
            // В тестах нет dom и соответсвенно ссылок на контейнеры
            if (this._children.container0 && this._children.container1) {
                this._children.container0.offsetWidth;
                this._children.container1.offsetWidth;
            }

            this._animate();

            this._animationState = 2;
            this._forceUpdate();
        }
    }

    private _prepareAnimation(itemData): void {
        let item = this._getDisplayedItem();

        // Обновлем данные в новом представлении
        item.data = itemData;

        // Перед анимацией новое представление невидимо.
        // Устанавливаем классы подготавливающие его к анимации. Но класс анимации не устанавливаем.
        item.transitionClasses = ANIMATIONS_DATA[this._inAnimation].preAnimationInClasses;

        // У старого представления сбрасываем класс анимации, оставляем классы устанавливающие его текущее состояние.
        item = this._getNotDisplayedItem();
        item.transitionClasses = ANIMATIONS_DATA[this._outAnimation].preAnimationOutClasses;
    }

    private _animate(): void {
        let month;

        // Применим класс анимации к новому представлению что бы оно плавно появилось.
        month = this._getDisplayedItem();
        month.transitionClasses = ANIMATIONS_DATA[this._inAnimation].animationInClasses;

        // Применим класс анимации и нового состояния к старому представлению что бы оно плавно исчезло.
        month = this._getNotDisplayedItem();
        month.transitionClasses = ANIMATIONS_DATA[this._outAnimation].animationOutClasses;
    }

    private _getDisplayedItem(): object {
        return this._items[this._currentItem];
    }

    private _getNotDisplayedItem(): object {
        return this._items[(this._currentItem + 1) % 2];
    }

    static ANIMATIONS: object = ANIMATIONS;
    static _theme: string[] = ['Controls/calendar'];

    static getOptionTypes(): object {
        return coreMerge({}, {

            /**
             * @name Controls/_calendar/MonthSlider/Slider#animation
             * @cfg {AnimationType} The type of animation used to turn the items.
             * @see inAnimation
             * @see outAnimation
             */
            animation: descriptor(String).required(),

            /**
             * @name Controls/_calendar/MonthSlider/Slider#inAnimation
             * @cfg {AnimationType} The type of animation used when the item appears.
             * @see animation
             * @see outAnimation
             */
            inAnimation: descriptor(String),

            /**
             * @name Controls/_calendar/MonthSlider/Slider#outAnimation
             * @cfg {AnimationType} The type of animation used when the item disappears.
             * @see animation
             * @see inAnimation
             */
            outAnimation: descriptor(String),

            /**
             * @name Controls/_calendar/MonthSlider/Slider#data
             * @cfg {Object} When this option changes, the content disappears smoothly, and in its place the new content drawn with this data smoothly appears.
             * @see animation
             * @see inAnimation
             * @see outAnimation
             */
            data: descriptor(Object)

            /**
             * @name Controls/_calendar/MonthSlider/Slider#content
             * @cfg {Content} Template of displayed content.
             */
        });
    }

    static getDefaultOptions(): object {
        return coreMerge({}, {
            animation: ANIMATIONS.slideRight,
            inAnimation: undefined,
            outAnimation: undefined,
            data: undefined
        });
    }
}

Object.defineProperty(Slider, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Slider.getDefaultOptions();
    }
});

/**
 * @typedef {String} AnimationType
 * @variant 'slideRight' Move the animated element to the right.
 * @variant 'slideLeft' Move the animated element to the left.
 */
