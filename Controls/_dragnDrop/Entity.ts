/**
 * Базовый класс, от которого наследуется объект перемещения.
 * Объект можно любым образом кастомизировать, записав туда любые необходимые данные.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/drag-n-drop/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dragnDrop.less переменные тем оформления}
 *
 * @class Controls/_dragnDrop/Entity
 * @public
 * @author Авраменко А.С.
 */

/*
    * The base class for the inheritors of the drag'n'drop entity.
    * You can customize an entity in any way by passing any data to the options.
    * More information you can read <a href="/doc/platform/developmentapl/interface-development/controls/drag-n-drop/">here</a>.
    * @class Controls/_dragnDrop/Entity
    * @public
    * @author Авраменко А.С.
*/

export default class Entity {
    protected _options: object;

    /**
     * Флаг на основании которого ScrollContainer понимает стоит ли для текущего
     * перетаскиваемого объекта включать механизм автоскролла при приближении курсора
     * к нижней или верхней границам ScrollContainer'а
     */
    readonly allowAutoscroll: boolean = false;

    constructor(options: object) {
        this._options = options;
    }

    getOptions(): object {
        return this._options;
    }
}
