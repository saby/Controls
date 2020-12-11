import {ISearchResolver, ISearchResolverOptions} from './interface';

/**
 * Контроллер, используемый для принятия решения, совершать ли поиск или производить его сброс по заданным параметрам в опциях.
 * Используется в {@link Controls/suggest:_InputController} как звено в логической цепочке поиска.
 * С помощью этого контроллера производится настройка: временная задержка между вводом символа и началом поиска; количество символов, с которых начинается поиск.
 * @remark
 * <ul>
 *    <li>Если переданное значение поиска проходит по установленным в опциях параметрам,
 *    то вызывается с установленной задержкой callback-функция, которая также задается опциями контроллера.</li>
 *    <li>Если поиск был начат прежде, но пришло новое значенние для поиска, то будет вызван другой callback для сброса, который задается опциями контроллера - опция searchResetCallback.</li>
 *    <li>Если новое переданное значение будет иметь длину больше 0 символов, то будет произведена задержка, перед вызовом searchResetCallback, при условии что она задана.</li>
 *    <li>Новые опции, переданные в метод updateOptions полностью заменяют собой старые опции.</li>
 * </ul>
 * @example
 * Стандартная инициализация контроллера, где будут вызываться сообщения при сбросе или запуске поиска.
 * <pre>
 *    const searchResolver = new SearchResolver({
 *       searchCallback: (value) => console.log('Search func called!'),
 *       searchResetCallback: () => console.log('Search reset func called!'),
 *       searchDelay: 400,
 *       minSearchLength: 3
 *    });
 *
 *    searchResolver.resolve('te'); // Ничего не произойдет, т.к поиск не был начат прежде, а длина значения меньше, чем минимально необходимая длина для начала поиска
 * </pre>
 *
 * Обновим опции и дважды вызовем resolve для того, чтобы сработал колбэк searchResetCallback.
 * После вызова метода второй раз, результат из первого не будет передан в searchCallback, т.к не успеет пройти промежуток в 2 секунды, установленый опцией delayTime.
 * По истечению двух секунд, будет вызван searchResetCallback
 * <pre>
 *    searchResolver.updateOptions({
 *       searchCallback: (value) => console.log('Search func called!'),
 *       searchResetCallback: () => console.log('Search reset func called!'),
 *       searchDelay: 2000,
 *       minSearchLength: 3
 *    }); // Обновим опции созданного прежде контроллера, чтобы задержка перед вызовом колбэка была 2 секунды
 *    searchResolver.resolve('test');
 *    searchResolver.resolve('test_2');
 * </pre>
 *
 * @class Controls/_search/SearchResolver
 * @implements Controls/_search/interface/ISearchResolver
 * @author Крюков Н.Ю.
 *
 * @public
 */

export default class SearchResolver implements ISearchResolver {

   /**
    * Таймер для запуска поиска после паузы, заданной в опции delayTime
    * @protected
    */
   protected _delayTimer: NodeJS.Timeout = null;

   /**
    * Опции контроллера
    * @protected
    */
   protected _options: ISearchResolverOptions = null;

   /**
    * Начат ли поиск прежде
    * @protected
    */
   protected _searchStarted: boolean = false;

   constructor(options: ISearchResolverOptions) {
      this._options = options;
   }

   /**
    * Обновляет опции контроллера
    * @param options Новые опции контроллера
    */
   updateOptions(options: ISearchResolverOptions): void {
      this._options = options;
   }

   private _resolveCallback(callback: Function, value: string, searchStarted: boolean): void {
      if (this._options.searchDelay) {
         this._callAfterDelay(callback, value).then(() => {
            this._searchStarted = searchStarted;
         });
      } else {
         callback(value);
         this._searchStarted = searchStarted;
      }
   }

   /**
    * Очищает таймер реализующий задержку перед поиском
    */
   clearTimer(): void {
      if (this._delayTimer) {
         clearTimeout(this._delayTimer);
         this._delayTimer = null;
      }
   }

   private _callAfterDelay(callback: Function, value: string): Promise<void> {
      this.clearTimer();

      return new Promise((resolve) => {
         this._delayTimer = setTimeout(() => {
            this._delayTimer = null;
            callback(value);
            resolve();
         }, this._options.searchDelay);
      });
   }

   /**
    * Инициировать проверку, какое действие предпринять по полученному в аргументе значению
    * @param value Значение, по которому должен произзводиться поиск
    */
   resolve(value: string | null): void {
      const valueLength = value ? value.length : 0;
      const minSearchLength = this._options.minSearchLength !== null;

      if (minSearchLength && valueLength >= this._options.minSearchLength) {
         this._resolveCallback(this._options.searchCallback, value, true);
      } else if (minSearchLength || !valueLength) {
         if (this._options.searchDelay) {
            this.clearTimer();
         }
         if (this._searchStarted) {
            if (valueLength) {
               this._resolveCallback(this._options.searchResetCallback, value, false);
            } else {
               this._options.searchResetCallback();
               this._searchStarted = false;
            }
         }
      }
   }

   /**
    * Устанавливает флаг начала поиска на переданное в аргументе значение
    * @param value Начат ли поиск
    */
   setSearchStarted(value: boolean): void {
      this._searchStarted = value;
   }
}
