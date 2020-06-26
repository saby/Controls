/**
 * Интерфейс интервала шкалы, закрашенного цветом.
 *
 * @interface Controls/_slider/interface/IInterval
 * @public
 */

/*
 * Interface for colored interval of the scale.
 *
 * @interface Controls/_slider/interface/IInterval
 * @public
 */

export interface IInterval {
    color: string;
    start: number;
    end: number;
}

/**
 * @name Controls/_slider/interface/IInterval#color
 * @cfg {String} Цвет интервала. Может принимать одно из предопределенных значений: primary,
 * secondary, success, warning, danger, unaccented или другое значение, стили для
 * которого должны быть описаны по шаблону controls-Slider__interval_[string]-@{themeName}
 */

/*
 * @name Controls/_slider/interface/IInterval#color
 * @cfg {String} Interval color. Can be one of defaults values: primary,
 * secondary, success, warning, danger, unaccented or other which styles must be described by template
 * controls-Slider__interval_[string]-@{themeName}
 */

/**
 * @name Controls/_slider/interface/IInterval#start
 * @cfg {Number} Начало интервала
 * @remark Должно находиться в диапазоне [minValue..maxValue] и быть меньше, чем [end]
 */

/*
 * @name Controls/_slider/interface/IInterval#start
 * @cfg {Number} Start of the interval
 * @remark Must be in range of [minValue..maxValue] and lower then [end]
 */

/**
 * @name Controls/_slider/interface/IInterval#end
 * @cfg {Number} Конец интервала
 * @remark Должно находиться в диапазоне [minValue..maxValue] и быть больше, чем [start]
 */

/*
 * @name Controls/_slider/interface/IInterval#end
 * @cfg {Number} End of the interval
 * @remark Must be in range of [minValue..maxValue] and more then [start]
 */
