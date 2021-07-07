import { TKeysSelection as TKeys, ISelectionObject as ISelection} from 'Controls/interface';
import { Model } from 'Types/entity';
import { IFlatSelectionStrategyOptions, ITreeSelectionStrategyOptions } from '../interface';
import { RecordSet } from 'Types/collection';

/**
 * Интерфейс базового класс стратегий выбора
 */
export default interface ISelectionStrategy {
   /**
    * Выбрать элементы по переданными ключам
    * @param selection текущее состояние выбранных ключей
    * @param keys ключи ээлементов, которые нужно выбрать
    * @return {ISelection} новое состояние выбранных элементов
    */
   select(selection: ISelection, keys: TKeys): ISelection;

   /**
    * Снять выбор с элементов по переданными ключам
    * @param selection текущее состояние выбранных ключей
    * @param keys ключи ээлементов, с которых нужно снять выбор
    * @return {ISelection} новое состояние выбранных элементов
    */
   unselect(selection: ISelection, keys: TKeys): ISelection;

   /**
    * Выбрать все элементы в текущем корне
    *
    * В плоской стратегии всегда один и тот же корень null
    *
    * @param selection текущее состояние выбранных ключей
    * @return {ISelection} новое состояние выбранных элементов
    */
   selectAll(selection: ISelection): ISelection;

   /**
    * Переключить выбор в текущем корне
    *
    * В плоской стратегии всегда один и тот же корень null
    *
    * @param selection текущее состояние выбранных ключей
    * @param hasMoreData имеются ли в модели еще не загруженные элементы
    * @return {ISelection} новое состояние выбранных элементов
    */
   toggleAll(selection: ISelection, hasMoreData: boolean): ISelection;

   /**
    * Снять выбор в текущем корне
    *
    * В плоской стратегии всегда один и тот же корень null
    *
    * @param selection текущее состояние выбранных ключей
    * @return {ISelection} новое состояние выбранных элементов
    */
   unselectAll(selection: ISelection): ISelection;

   /**
    * Получить состояние элементов в модели
    *
    * @param selection текущее состояние выбранных ключей
    * @param limit ограничивает максимальное число выбранных элементов
    * @param items Список элементов для которых нужно определить состояние выбранности
    * @return {Map<boolean|null, Model[]>} мапа, в которой для каждого состояния хранится соответствующий список элементов
    */
   getSelectionForModel(selection: ISelection, limit?: number, items?: Model[], searchValue?: string): Map<boolean|null, Model[]>;

   /**
    * Получить количество выбранных элементов
    *
    * @param selection текущее состояние выбранных ключей
    * @param hasMoreData имеются ли в модели еще не загруженные элементы
    * @param limit ограничивает максимальное число выбранных элементов
    * @return {number|null} число или null, если невозможно определить точное значение
    */
   getCount(selection: ISelection, hasMoreData: boolean, limit?: number): number|null;

   /**
    * Обновить опции
    * @param options
    */
   update(options: ITreeSelectionStrategyOptions | IFlatSelectionStrategyOptions): void;

   /**
    * Проверяет все ли выбраны элементы
    * @remark В деревянной стратегии проверяет, что выбрано все в текущем узле
    * @param selection текущее состояние выбранных ключей
    * @param hasMoreData имеются ли в модели еще не загруженные элементы
    * @param itemsCount количество элементов в модели
    * @param byEveryItem true - проверять выбранность каждого элемента по отдельности. Иначе проверка происходит по наличию единого признака выбранности всех элементов.
    */
   isAllSelected(selection: ISelection, hasMoreData: boolean, itemsCount: number, byEveryItem?: boolean): boolean;

   /**
    * Задать список элементов
    * @param items
    */
   setItems(items: RecordSet): void;
}
