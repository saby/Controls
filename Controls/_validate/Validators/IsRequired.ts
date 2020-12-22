import rk = require('i18n!Controls');
import cInstance = require('Core/core-instance');
/**
 *
 * Функция проверяет наличие значения в контейнере.
 * @class Controls/_validate/Validators/IsRequired
 * @public
 * @author Красильников А.С.
 * @remark
 * Подробнее о работе с валидацией читайте {@link /doc/platform/developmentapl/interface-development/forms-and-validation/validation/ здесь}.
 * 
 * Аргументы функции:
 *
 * * value — проверяемое значение.
 * * doNotValidate:Boolean — требуется ли валидация.
 *
 * Типы возвращаемых значений:
 *
 * * true — значение прошло проверку на валидность.
 * * string — значение не прошло проверку на валидность, возвращается текст сообщения об ошибке.
 *
 * @example
 * <pre>
 * <Controls.validate:InputContainer name="InputValidate">
 *     <ws:validators>
 *         <ws:Function value="{{_valueIsRequired}}">Controls/validate:isRequired</ws:Function>
 *      </ws:validators>
 *      <ws:content>
 *         <Controls.input:Text bind:value="_valueIsRequired"/>
 *      </ws:content>
 * </Controls.validate:InputContainer>
 * </pre>
 *
 */
export = function (args) {
   //Если передали в аргументах doNotValidate, значит возвращаем true (параметр нужен для опционального включения/отключения валидатора)
   if (args.doNotValidate) {
      return true;
   }

   var isEmpty = false;

   switch (typeof args.value) {
      case 'string':
         isEmpty = !Boolean(args.value);
         break;
      case 'number':
         isEmpty = isNaN(args.value);
         break;
      case 'object':
         if (cInstance.instanceOfModule(args.value, 'Types/collection:List')) {
            isEmpty = !Boolean(args.value.getCount());
         } else if (args.value instanceof Array) {
            isEmpty = !Boolean(args.value.length) || (args.value.length === 1 && args.value[0] === null);
         } else if (args.value instanceof Date) {
            isEmpty = false;
         } else if (args.value instanceof Object) {
            isEmpty = !(Object.keys(args.value).length);
         } else if (args.value === null) {
            isEmpty = true;
         }
         break;
      case 'undefined':
         isEmpty = true;
         break;
   }

   return isEmpty ?
      rk('Поле обязательно для заполнения') :
      true;
};