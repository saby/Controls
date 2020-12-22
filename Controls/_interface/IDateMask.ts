export type DateMaskType = 'DD.MM.YYYY' | 'DD.MM.YY' | 'MM.YYYY';

export interface IDateMaskOptions {
   mask: DateMaskType;
}

/**
 * Интерфейс масок полей ввода позволяющих вводить даты.
 * @public
 * @author Красильников А.С.
 */

export default interface IDateMask {
   readonly '[Controls/_interface/IDateMask]': boolean;
}

/**
 * @name Controls/_interface/IDateMask#mask
 * @cfg {String} Маска.
 * @variant 'DD.MM.YYYY'
 * @variant 'DD.MM.YY'
 * @variant 'MM.YYYY'
 * @remark
 * Allowed mask chars:
 * <ol>
 *    <li>D - день.</li>
 *    <li>M - месяц.</li>
 *    <li>Y - год.</li>
 *    <li>"." - разделитель.</li>
 * </ol>
 * Если дата была установлена с помощью опции value, то при вводе будут сохраняться те части даты,
 * которые отсутствуют в маске. Иначе в качестве базовой будет использоваться дата 01.01.1900 00: 00.000.
 * @example
 * В этом примере маска позволяет вводить только дату. После того как пользователь ввел “01:01:2018”,
 * в атребуте _inputValue будет значение равное 01.01:2018 00:00.000
 * 
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input.Date bind:value="_inputValue" mask="DD.MM.YYYY"/>
 * </pre>
 * 
 * <pre class="brush: js">
 * Control.extend({
 *    _inputValue: null
 * });
 * </pre>
 * 
 * В следующем примере значение в поле ввода инициализировано датой со временем. После того как пользователь ввел
 * "01:01:2018", в атребуте _inputValue будет значение равное "01.01.2018 14:15.000".
 * 
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input.Date bind:value="_inputValue" mask=”DD.MM.YYYY”/>
 * </pre>
 * 
 * <pre class="brush: js">
 * // JavaScript
 * Control.extend({
 *    _inputValue: new Date(2001, 2, 10, 14, 15 )
 * });
 * </pre>
 */

/*
 * @name Controls/_interface/IDateMask#mask
 * @cfg {String} Date format.
 *
 * @variant 'DD.MM.YYYY'
 * @variant 'DD.MM.YY'
 * @variant 'MM.YYYY'
 * @remark
 * Allowed mask chars:
 * <ol>
 *    <li>D - day.</li>
 *    <li>M - month.</li>
 *    <li>Y - year.</li>
 *    <li>"." - delimiters.</li>
 * </ol>
 * If some part of the date is missing, it will be saved from the previously established value of the value option.
 * If the previous value of the control was null, then the following date are used 01.01.1900 00: 00.000
 * @example
 * In this example, the mask is set so that only the time can be entered in the input field.
 * After a user has entered a “01:01:2018”, the value of the _inputValue will be equal 01.01:2018 00:00.000
 * <pre>
 *    <Controls.input.Date bind:value="_inputValue" mask=”DD.MM.YYYY”/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       _inputValue: null
 *    });
 * </pre>
 * In next example after a user has entered a “01:01:2018”, the value of the _inputValue will be equal “01.01.2018 14:15.000.
 * <pre>
 *    <Controls.input.Date bind:value="_inputValue" mask=”DD.MM.YYYY”/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       _inputValue: ew Date(2001, 2, 10, 14, 15 )
 *    });
 * </pre>
 */
