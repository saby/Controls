/**
 * Интерфейс поля ввода даты с маской.
 *
 * @interface Controls/interface/IDateMask
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for date inputs mask.
 *
 * @interface Controls/interface/IDateMask
 * @public
 * @author Красильников А.С.
 */
interface IDateMask {
    readonly _options: {
        /**
         * @name Controls/interface/IDateMask#mask
         * @cfg {String} Маска для ввода даты.
         *
         * @variant DD.MM.YYYY
         * @variant DD.MM.YY
         * @remark
         * Допустимые символы маски:
         * <ol>
         *    <li>D — день.</li>
         *    <li>M — месяц.</li>
         *    <li>Y — год.</li>
         *    <li>"." — разделитель.</li>
         * </ol>
         * Если какая-то часть даты отсутствует, она будет сохранена из ранее установленного значения параметра "value".
         * Если предыдущее значение контрола — "null", то используются следующие данные — "01.01.1900 00: 00.000".
         * @example
         * В данном примере маска установлена так, что в поле можно ввести только время.
         * После того, как пользователь ввел "01:01:2018", значениe _inputValue будет равно "01.01:2018 00:00.000".
         * <pre>
         *    <Controls.input:Date bind:value="_inputValue" mask="DD.MM.YYYY"/>
         * </pre>
         * <pre>
         *    Base.Control.extend({
         *       _inputValue: null
         *    });
         * </pre>
         * В следующем примере после того, как пользователь ввел "01:01:2018", значение _inputValue будет равно "01.01.2018 14:15.000".
         * <pre>
         *    <Controls.input:Date bind:value="_inputValue" mask="DD.MM.YYYY"/>
         * </pre>
         * <pre>
         *    Base.Control.extend({
         *       _inputValue: new Date(2001, 2, 10, 14, 15 )
         *    });
         * </pre>
         */

        /*
         * @name Controls/interface/IDateMask#mask
         * @cfg {String} Date format.
         *
         * @variant DD.MM.YYYY
         * @variant DD.MM.YY
         * @remark
         * Allowed mask chars:
         * <ol>
         *    <li>D — day.</li>
         *    <li>M — month.</li>
         *    <li>Y — year.</li>
         *    <li>"." — delimiters.</li>
         * </ol>
         * If some part of the date is missing, it will be saved from the previously established value of the value option.
         * If the previous value of the control was null, then the following date are used 01.01.1900 00: 00.000
         * @example
         * In this example, the mask is set so that only the time can be entered in the input field.
         * After a user has entered a “01:01:2018”, the value of the _inputValue will be equal 01.01:2018 00:00.000
         * <pre>
         *    <Controls.input:Date bind:value="_inputValue" mask="DD.MM.YYYY"/>
         * </pre>
         * <pre>
         *    Base.Control.extend({
         *       _inputValue: null
         *    });
         * </pre>
         * In next example after a user has entered a “01:01:2018”, the value of the _inputValue will be equal “01.01.2018 14:15.000.
         * <pre>
         *    <Controls.input:Date bind:value="_inputValue" mask="DD.MM.YYYY"/>
         * </pre>
         * <pre>
         *    Base.Control.extend({
         *       _inputValue: new Date(2001, 2, 10, 14, 15 )
         *    });
         * </pre>
         */
        mask: 'DD.MM.YYYY' | 'DD.MM.YY';
    }
}

export default IDateMask;
