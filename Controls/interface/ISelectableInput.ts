/**
 * Интерфейс для выделения введенных в поля ввода значений.
 * @public
 * @author Красильников А.С.
 */
/*
 * Interface for input selection
 * @public
 * @author Красильников А.С.
 */
interface ISelectableInput {
    readonly _options: {
        /**
         * @cfg {Boolean} Определяет, будет ли выделен текст при клике по полю ввода.
         * @default false
         * @remark
         * Этот параметр можно использовать, если известно, что клик пользователем по полю для ввода нового значения, является более частым сценарием, чем клик пользователем по полю для измениния текущего значения. 
         * В этом случае они нажмут на поле, текст будет выбран, и они смогут начать вводить новое значение немедленно.
         * @example
         * В этом примере при клике по полю будет выделен весь текст.
         * <pre class="brush: html">
         * <!-- WML -->
         * <Controls.input:Text selectOnClick="{{true}}"/>
         * </pre>
         */
        /*
         * @cfg {Boolean} Determines whether text is selected when input is clicked.
         * @default false
         * @remark
         * This option can be used if you know that user clicking the field to enter a new value is a more frequent scenario
         * than user wanting to edit the current value. In that case, they will click on the field, text will get selected, a
         * nd they will be able to start entering new value immediately.
         * @example
         * In this example, when the field is clicked, all text in it will be selected.
         * <pre class="brush: html">
         * <!-- WML -->
         * <Controls.input:Text selectOnClick="{{true}}"/>
         * </pre>
         */
        selectOnClick: boolean;
    };
}

export default ISelectableInput;
