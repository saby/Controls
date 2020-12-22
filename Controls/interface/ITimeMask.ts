/**
 * Интерфейс для поля ввода времени с маской.
 *
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for time inputs mask.
 *
 * @public
 * @author Красильников А.С.
 */ 
interface ITimeMask {
   readonly _options: {
      /**
       * @cfg {String} Формат ввода даты.
       * @remark
       *
       * Необходимо выбрать одну из перечисленных масок. Разрешенные символы маски:
       * 
       * * H — час.
       * * I — минута.
       * * S — секунда.
       * * U — миллисекунда.
       * * ".", "-", ":", "/" — разделитель.
       * @variant 'HH:II:SS.UUU'
       * @variant 'HH:II:SS'
       * @variant 'HH:II'
       */

      /*
       * @cfg {String} Data format.
       *
       * One of the listed mask must be choosen. Allowed mask chars:
       * 
       * * H — hour.
       * * I — minute.
       * * S — second.
       * * U — millisecond.
       * * ".", "-", ":", "/" — delimiters.
       * 
       * @variant 'HH:II:SS.UUU'
       * @variant 'HH:II:SS'
       * @variant 'HH:II'
       */       
      mask: 'HH:II:SS.UUU' | 'HH:II:SS' | 'HH:II';
   };
}

export default ITimeMask;
