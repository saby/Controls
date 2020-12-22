import * as rk from 'i18n!Controls';

// https://online.sbis.ru/opendoc.html?guid=d0fab834-d9fc-4b93-b9c4-f7843343d968
const EMAIL: RegExp = /^.+@.+\..+$/;

interface IArgs {
   value: string;
}

export default function({value}: IArgs): boolean | string {
   /**
    * Пустое значение должно быть валидным
    */
   if (!value) {
      return true;
   }

   const lowerCaseValue = value.toLowerCase();
   return EMAIL.test(lowerCaseValue) ? true : rk('В поле требуется ввести адрес электронной почты');
}

/**
 * Функция проверяет e-mail на валидность.
 * @class Controls/_validate/Validators/IsEmail
 * @public
 * @author Красильников А.С.
 * @remark
 * Подробнее о работе с валидацией читайте {@link /doc/platform/developmentapl/interface-development/forms-and-validation/validation/ здесь}.
 *
 * Аргументы функции:
 *
 * * value — проверяемое значение.
 *
 * Типы возвращаемых значений:
 *
 * * true — значение прошло проверку на валидность.
 * * String — значение не прошло проверку на валидность, возвращается текст сообщения об ошибке.
 *
 * @example
 * <pre>
 * <Controls.validate:InputContainer name="InputValidate">
 *     <ws:validators>
 *         <ws:Function value="{{_valueEmail}}">Controls/validate:isEmail</ws:Function>
 *     </ws:validators>
 *     <ws:content>
 *         <Controls.input:Text bind:value="_valueEmail"/>
 *     </ws:content>
 * </Controls.validate:InputContainer>
 * </pre>
 *
 */
