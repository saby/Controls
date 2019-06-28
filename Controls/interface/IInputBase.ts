import IPaste from "./IPaste";
import IInputTag from "./IInputTag";
import IInputPlaceholder from "./IInputPlaceholder";
import ISelectableInput from "./ISelectableInput";
import IInputTooltip from "./IInputTooltip";
import IInputStyle from "./IInputStyle";
import IInputField from "./IInputField";

/**
 * Interface for Input.Base.
 *
 * @interface Controls/interface/IInputBase
 *
 * @mixes Controls/interface/IPaste
 * @mixes Controls/interface/IInputTag
 * @mixes Controls/interface/IInputField
 * @mixes Controls/interface/IInputPlaceholder
 *
 * @mixes Controls/interface/ISelectableInput
 * @mixes Controls/interface/IInputTooltip
 * @mixes Controls/interface/IInputStyle
 *
 * @mixes Controls/_input/Base/Styles
 * @mixes Controls/_input/Render/Styles
 *
 * @mixes Controls/interface/ICallback
 *
 * @public
 * @author Красильников А.С.
 */
type IInputBase =
    IPaste
    & IInputTag
    & IInputField
    & IInputPlaceholder
    & ISelectableInput
    & IInputTooltip
    & IInputStyle
    & {
    readonly _options: {
        /**
         * @name Controls/interface/IInputBase#size
         * @cfg {Enum} Field size.
         * @variant s - The size of a small field.
         * @variant m - The size of a medium field.
         * @variant l - The size of a large field.
         * @variant default - The size of a standard field.
         * @default default
         * @remark
         * The size is selected depending on the context of the value in the field.
         */
        size: 's' | 'm' | 'l' | 'default';
        /**
         * @name Controls/interface/IInputBase#fontStyle
         * @cfg {Enum} Fonts of the text in field.
         * @variant default - Font style in standard field.
         * @variant primary - Font style to attract attention.
         * @variant secondary - Font style in secondary field.
         * @default default
         * @remark
         * The font style is selected depending on the context of the value in the field.
         * @example
         * In this example, we create a form for input passport data. Fields for entering your name have accent font.
         * <pre>
         *    <div class="form">
         *       <div class="fio">
         *          <Controls.input:Text name="firstName" fontStyle="primary"/>
         *          <Controls.input:Text name="lastName" fontStyle="primary"/>
         *       </div>
         *       <div class="residence">
         *          <Controls.input:Text name="street"/>
         *       </div>
         *    </div>
         * </pre>
         */
        fontStyle: 'default' | 'primary' | 'secondary';
        /**
         * @name Controls/interface/IInputBase#textAlign
         * @cfg {Enum} Horizontal alignment of the text in field.
         * @variant left - The text are aligned to the left edge of the line box.
         * @variant right - The text are aligned to the right edge of the line box.
         * @default left
         * @example
         * In this example, we align the text to the left.
         * <pre>
         *    <Controls.input:Text textAlign="left"/>
         * </pre>
         */
        textAlign: 'left' | 'right';
        /**
         * @name Controls/interface/IInputBase#autoComplete
         * @cfg {Enum} Управление браузерным автозаполнением в полях.
         * @default off
         * @variant off - Отключить автозаполнение.
         * @variant on - Включить автозаполнение ранее введенными значениями.
         * @variant username - Включить автозаполнение сохраненными именами пользователей.
         * @variant current-password - Включить автозаполнение текущими паролями для учетной записи, указанной в поле для имени пользователя.
         * @remark
         * Значения для автозаполнения берутся браузером из его хранилища.
         * Имя поля используется для доступа к ним. Поэтому, чтобы значения, хранящиеся в одном поле,
         * не применялись к другому, поля должны иметь разные имена. Для этого мы проксируем имя контрола на нативное поле.
         * Поэтому, если вы включили автозаполнение и не хотите пересечения значений автозаполнения, то укажите имя контрола.
         * Выберать имя следует на основе области использования поля. Например, для формы регистрации логина и пароля предпочтительно использовать имена login и password.
         * @example
         * В этом примере при щелчке по полю появляется меню браузера с ранее введенными значениями в этом поле.
         * <pre>
         *    <Controls.input:Text autoComplete="on"/>
         * </pre>
         */
        /*
         /*
         @name Controls/interface/IInputBase#autoComplete
         @cfg {Enum} Determines whether to use browser-based auto-complete field.
         @default off
         @variant on - The browser is allowed to automatically complete the input.
         @variant off - The browser is not permitted to automatically enter or select a value for this field.
         @variant username - The browser is allowed to automatically complete the input using a username.
         @variant current-password - The browser is allowed to automatically complete the input using the current password for the account identified by the username field.
         @remark
         Values for auto-complete are taken by the browser from its storage.
         The field name is used to access them. Therefore, to prevent values stored in one field from being applied to another,
         the fields must have different names. To do this, we proxy the name of the control to the name of the native field.
         Therefore, if you use true as the value of the option and do not want to cross the auto-completion values, specify the name of the control.
         Choose a name based on the scope of the field. For example, for a login and password registration form, it is preferable to use the login and password names.
         @example
         In this example, when the field is clicked, a browser menu appears with the previously entered values in this field.
         <pre>
         <Controls.input:Text autoComplete="on"/>
         </pre>
          */
        autoComplete: 'on' | 'off' | 'username' | 'current-password';
    }
};


export default IInputBase;
