export interface ITextOptions {
    constraint?: string;
    maxLength?: number;
    convertPunycode: boolean;
    trim: number;
}

/**
 * Интерфейс текстового поля ввода.
 *
 * @interface Controls/_input/interface/IText
 * @public
 * @author Красильников А.С.
 */
export interface IText {
    readonly '[Controls/_input/interface/IText]': boolean;
}

/**
 * @name Controls/_input/interface/IText#constraint
 * @cfg {String} Фильтр вводимого значения в формате регулярного выражение {@link https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Regular_Expressions#special-character-set [xyz]}.
 * @remark
 * Каждый, введенный символ пользователем, фильтруется отдельно. Символ не прошедший фильтрацию в поле не добавляется.
 * Например, пользователь вставляет "1ab2cd" в поле с ограничением "[0-9]". Будет вставлено "12".
 * @demo Controls-demo/Input/Constraint/Index
 */
/**
 * @name Controls/_input/interface/IText#convertPunycode
 * @cfg {String} Нужно ли преобразовывать вводимое значения из Punycode в Unicode.
 * @remark
 * @demo Controls-demo/Input/ConvertPunycode/Index
 */
/**
 * @name Controls/_input/interface/IText#maxLength
 * @cfg {Number} Максимальное количество символов, которое может ввести пользователь вручную в поле.
 * @remark
 * Когда количество символов достигает максиму, тогда последующий символы в поле не добавляются.
 * @demo Controls-demo/Input/MaxLength/Index
 */
/**
 * @name Controls/_input/interface/IText#trim
 * @cfg {Boolean} Определяет наличие пробельных символов в начале и конце значения, после завершения ввода.
 * @remark
 * * false - Пробельные символы сохраняются.
 * * true - Пробельные символы удаляются.
 * @demo Controls-demo/Input/Trim/Index
 * @default true
 */
