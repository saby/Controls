export interface ISliderOptions {
    borderVisible?: boolean;
    tooltipVisible?: boolean;
    scaleStep?: number;
    precision: number;
    tooltipFormatter?: Function;
    size?: string;
    minValue: number;
    maxValue: number;
    scaleLabelFormatter?: Function;
}
/**
 * Интерфейс для контрола Слайдер.
 *
 * @interface Controls/_slider/interface/ISlider
 * @public
 * @author Бондарь А.В.
 */

/*
 * Interface for the "Slider" control.
 *
 * @interface Controls/_slider/interface/ISlider
 * @public
 * @author Бондарь А.В.
 */

export interface ISlider {
    readonly '[Controls/_slider/interface/ISlider]': boolean;
}

/**
 * @name Controls/_slider/interface/ISlider#borderVisible
 * @cfg {Boolean} Устанавливает границу вокруг контрола.
 * @example
 * Слайдер с границей:
 * <pre class="brush:html">
 *   <Controls.slider:Base borderVisible="{{true}}"/>
 * </pre>
 */

/**
 * @name Controls/_slider/interface/ISlider#tooltipVisible
 * @cfg {Boolean} Устанавливает подсказку при наведении на шкалу.
 * @default true
 * @example
 * Слайдер с тултипом:
 * <pre class="brush:html">
 *   <Controls.slider:Base tooltipVisible="{{true}}"/>
 * </pre>
 */

/*
 * @name Controls/_slider/interface/ISlider#borderVisible
 * @cfg {Boolean} sets the stroke around control
 * @example
 * Slider with border
 * <pre class="brush:html">
 *   <Controls.slider:Base borderVisible="{{true}}"/>
 * </pre>
 */

/**
 * @name Controls/_slider/interface/ISlider#scaleStep
 * @cfg {Number} Параметр scaleStep определяет шаг шкалы, расположенной под слайдером.
 * @remark Шкала отображается, когда опция {@link borderVisible} установлена в значения false, а параметр scaleStep положительный.
 * @example
 * Слайдер со шкалой с шагом 20:
 * <pre class="brush:html">
 *   <Controls.slider:Base scaleStep="{{20}}"/>
 * </pre>
 */

/*
 * @name Controls/_slider/interface/ISlider#scaleStep
 * @cfg {Number} The scaleStep option determines the step in the scale grid under the slider
 * @remark Scale displayed only if borderVisible is false and scaleStep is positive.
 * @example
 * Slider with scale step of 20
 * <pre class="brush:html">
 *   <Controls.slider:Base scaleStep="{{20}}"/>
 * </pre>
 */

/**
 * @name Controls/_slider/interface/ISlider#precision
 * @cfg {Number} Количество символов в десятичной части.
 * @remark Должно быть неотрицательным.
 * @example
 * Слайдер с целыми значениями:
 * <pre class="brush:html">
 *   <Controls.slider:Base precision="{{0}}"/>
 * </pre>
 */

/*
 * @name Controls/_slider/interface/ISlider#precision
 * @cfg {Number} Number of characters in decimal part.
 * @remark Must be non-negative
 * @example
 * Slider with integer values;
 * <pre class="brush:html">
 *   <Controls.slider:Base precision="{{0}}"/>
 * </pre>
 */

/**
 * @name Controls/_slider/interface/ISlider#tooltipFormatter
 * @cfg {Function} Функция форматирования подсказки.
 * @remark
 * Аргументы функции:
 * <ul>
 *    <li>value - текущее положение слайдера</li>
 * </ul>
 */

/*
 * @name Controls/_slider/interface/ISlider#tooltipFormatter
 * @cfg {Function} Tooltip formatter function.
 * @remark
 * Function Arguments:
 * <ul>
 *    <li>value - slider current position</li>
 * </ul>
 */

/**
 * @name Controls/_slider/interface/ISlider#size
 * @cfg {String} Устанавливает размер ползунка слайдера.
 * @variant s
 * @variant m
 * @default m
 * @example
 * Слайдер с диаметром ползунка = 12px
 * <pre class="brush:html">
 *   <Controls.slider:Base size="s"/>
 * </pre>
 */

/*
 * @name Controls/_slider/interface/ISlider#size
 * @cfg {String} sets the size of slider point
 * @example
 * Slider with diameter of point = 12px
 * <pre class="brush:html">
 *   <Controls.slider:Base size="s"/>
 * </pre>
 */

/**
 * @name Controls/_slider/interface/ISlider#minValue
 * @cfg {Number} Устанавливает минимальное значение слайдера.
 * @remark Должно быть меньше, чем {@link maxValue}.
 * @example
 * Слайдер с границей:
 * <pre class="brush:html">
 *   <Controls.slider:Base minValue="{{10}}"/>
 * </pre>
 * @see maxValue
 */

/*
 * @name Controls/_slider/interface/ISlider#minValue
 * @cfg {Number} sets the minimum value of slider
 * @remark must be less than maxValue
 * @example
 * Slider with border
 * <pre class="brush:html">
 *   <Controls.slider:Base minValue="{{10}}"/>
 * </pre>
 * @see maxValue
 */

/**
 * @name Controls/_slider/interface/ISlider#maxValue
 * @cfg {Number} Устанавливает максимальное значение слайдера.
 * @remark Должно быть больше, чем {@link minValue}.
 * @example
 * Слайдер с границей:
 * <pre class="brush:html">
 *   <Controls.slider:Base maxValue="{{100}}"/>
 * </pre>
 * @see minValue
 */

/*
 * @name Controls/_slider/interface/ISlider#maxValue
 * @cfg {Number} sets the maximum value of slider
 * @remark must be greater than minValue
 * @example
 * Slider with border
 * <pre class="brush:html">
 *   <Controls.slider:Base maxValue="{{100}}"/>
 * </pre>
 * @see minValue
 */

/**
 * @name Controls/_slider/interface/ISlider#scaleLabelFormatter
 * @cfg {Function} Функция форматирования метки шкалы.
 * @remark
 * Аргументы функции:
 * <ul>
 *    <li>value - текущее положение слайдера</li>
 * </ul>
 */

/*
 * @name Controls/_slider/interface/ISlider#scaleLabelFormatter
 * @cfg {Function} Scale label formatter function.
 * @remark
 * Function Arguments:
 * <ul>
 *    <li>value - slider current position</li>
 * </ul>
 */
