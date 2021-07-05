import {IContrastBackgroundOptions} from 'Controls/interface';
import { IBorderVisibilityOptions } from 'Controls/_input/interface/IBorderVisibility';
export type TextAlign = 'left' | 'right' | 'center';

export type AutoComplete =
    'on'
    | 'off'
    | 'username'
    | 'current-password'
    | 'name'
    | 'given-name'
    | 'additional-name'
    | 'family-name'
    | 'email'
    | 'new-password'
    | 'one-time-code'
    | 'organization-title'
    | 'organization'
    | 'street-address'
    | 'country'
    | 'country-name'
    | 'postal-code'
    | 'cc-name'
    | 'cc-given-name'
    | 'cc-additional-name'
    | 'cc-family-name'
    | 'cc-number'
    | 'cc-exp'
    | 'language'
    | 'bday'
    | 'sex'
    | 'tel'
    | 'url'
    | string;

export interface IBaseOptions extends IContrastBackgroundOptions, IBorderVisibilityOptions {
    autoComplete?: AutoComplete;
    textAlign?: TextAlign;
    selectOnClick?: boolean;
    spellCheck?: boolean;
    tooltip?: string;
    name?: string;
    inlineHeight?: string;
    fontSize?: string;
    fontWeight?: string;
    fontColorStyle?: string;
    paste?: (value: string) => void;
}

/**
 * Интерфейс базового поля ввода.
 *
 * @interface Controls/_input/interface/IBase
 * @implements Controls/interface:IContrastBackground
 * @public
 * @author Красильников А.С.
 */
export interface IBase {
    readonly '[Controls/_input/interface/IBase]': boolean;
}

/**
 * @typedef {String} TextAlign
 * @variant left Текст выравнивается по левой стороне.
 * @variant right Текст выравнивается по правой стороне.
 * @variant center Текст выравнивается по центру.
 */
/**
 * @typedef {String} AutoComplete
 * @variant off Отключить автозаполнение.
 * @variant on Включить автозаполнение ранее введенными значениями.
 * @variant username Включить автозаполнение сохраненными именами пользователей.
 * @variant current-password Включить автозаполнение текущими паролями для учетной записи, указанной в поле для имени пользователя.
 * @variant name Включить автозаполнение сохраненными полными именами пользователя.
 * @variant given-name Включить автозаполнение сохраненными именами пользователя.
 * @variant additional-name Включить автозаполнение сохраненными отчествами пользователя.
 * @variant family-name Включить автозаполнение сохраненными фамилиями пользователя.
 * @variant email Включить автозаполнение сохраненными адресами электронной почты пользователя.
 * @variant new-password Включить автозаполнение текущими паролями для новой учетной записи или изменении паролей пользователя.
 * @variant one-time-code Включить автозаполнение сохраненными одноразовыми кодами, используемыми для проверки личности пользователя.
 * @variant organization-title Включить автозаполнение сохраненными должностями, которую пользователь имеет в организации.
 * @variant organization Включить автозаполнение сохраненными названиями организаций или компаний
 * @variant street-address Включить автозаполнение сохраненными адресами улиц пользователя.
 * @variant country Включить автозаполнение сохраненными кодами страны или территории.
 * @variant country-name Включить автозаполнение сохраненными названиями стран или территорий.
 * @variant postal-code Включить автозаполнение сохраненными почтовыми кодами.
 * @variant cc-name Включить автозаполнение сохраненными полными именами, напечатанными на платежных средствах.
 * @variant cc-given-name Включить автозаполнение сохраненными именами, указанными на платежных средствах или кредитных картах.
 * @variant cc-additional-name Включить автозаполнение сохраненными отчествами, указанными на платежных средствах или кредитных картах.
 * @variant cc-family-name Включить автозаполнение сохраненными фамилиями, указанными на платежных средствах или кредитных картах.
 * @variant cc-number Включить автозаполнение сохраненными номерами кредитных карт или других номеров, идентифицирующих способ оплаты.
 * @variant cc-exp Включить автозаполнение сохраненными датами истечения срока действия платежных методов.
 * @variant language Включить автозаполнение сохраненными предпочтительными языками.
 * @variant bday Включить автозаполнение сохраненными полными датами рождения.
 * @variant sex Включить автозаполнение сохраненными гендерными идентичностями.
 * @variant tel Включить автозаполнение сохраненными полными номерами телефона, включая код страны.
 * @variant url Включить автозаполнение сохраненными url-адресами.
 * @description Управление браузерным автозаполнением в поле. Список всех доступных значений смотрите {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete тут}
 */
/**
 * @name Controls/_input/interface/IBase#autoComplete
 * @cfg {AutoComplete} Управление браузерным автозаполнением в поле. Список всех доступных значений смотрите {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete тут}
 * Значения для автозаполнения берутся браузером из его хранилища.
 * Имя поля используется для доступа к ним. Поэтому, чтобы значения, хранящиеся в одном поле, не применялись к другому, поля должны иметь разные имена.
 * Для этого мы проксируем имя контрола на нативное поле.
 * Поэтому, если вы включили автозаполнение и не хотите пересечения значений автозаполнения, то укажите имя контрола.
 * Выбирать имя следует на основе области использования поля. Например, для формы регистрации логина и пароля предпочтительно использовать имена login и password.
 * @example
 * В этом примере при щелчке по полю появляется меню браузера с ранее введенными значениями в этом поле.
 * <pre>
 *    <Controls.input:Text autoComplete="on"/>
 * </pre>
 */
/**
 * @name Controls/_input/interface/IBase#textAlign
 * @cfg {TextAlign} Выравнивание текста по горизонтали в поле.
 * @demo Controls-demo/Input/TextAlignments/Index
 */
/**
 * @name Controls/_input/interface/IBase#selectOnClick
 * @cfg {Boolean} Определяет выделение текста после клика по полю.
 * @remark
 * * false - Текст не выделяется.
 * * true - Текст выделяется.
 * @demo Controls-demo/Input/SelectOnClick/Index
 */
/**
 * @name Controls/_input/interface/IBase#spellCheck
 * @cfg {Boolean} Определяет наличие браузерной проверки правописания и грамматики в тексте.
 * @remark
 * * false - Отсутствует проверка правописания и грамматики.
 * * true - Браузер проверяет правописание и грамматику в тексте.
 * @demo Controls-demo/Input/SpellCheck/Index
 */
/**
 * @name Controls/_input/interface/IBase#tooltip
 * @cfg {String} Текст всплывающей подсказки, отображаемой при наведении указателя мыши на элемент.
 * @remark
 * Подсказка отображает указанный текст, только если введенное значение полностью помещается в поле ввода. Когда значение не помещается полностью, подсказка отображает значение из поля ввода.
 * @demo Controls-demo/Input/Tooltip/Index
 */
/**
 * @name Controls/_input/interface/IBase#paste
 * @function
 * @description Установить выделенное значение равным указанному значению.
 * @param {String} value Значение для замены.
 * @remark
 * Метод используется, когда выделенное значение не известно, а вам требуется заменить его на другое.
 * @demo Controls-demo/Input/Paste/Index
 */

/**
 * @name Controls/_input/interface/IBase#contrastBackground
 * @demo Controls-demo/Input/ContrastBackground/Index
 * @default false
 */
