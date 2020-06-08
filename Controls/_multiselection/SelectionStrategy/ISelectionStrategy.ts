import { TKeysSelection as TKeys, ISelectionObject as ISelection} from 'Controls/interface';
import { Model } from 'Types/entity';
import { CollectionItem } from 'Controls/display';
import { IFlatSelectionStrategyOptions, ITreeSelectionStrategyOptions } from '../interface';
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
    * @return {Map<boolean|null, Array<CollectionItem<Model>>>} мапа, в которой для каждого состояния хранится соответствующий список элементов
    */
   getSelectionForModel(selection: ISelection): Map<boolean|null, Array<CollectionItem<Model>>>;

   /**
    * Получить количество выбранных элементов
    *
    * @param selection текущее состояние выбранных ключей
    * @param hasMoreData имеются ли в модели еще не загруженные элементы
    * @return {number|null} число или null, если невозможно определить точное значение
    */
   getCount(selection: ISelection, hasMoreData: boolean): number|null;

   /**
    * Обновить опции
    * @param options
    */
   update(options: ITreeSelectionStrategyOptions | IFlatSelectionStrategyOptions): void;

   /**
    * Проверяет все ли выбраны в текущем узле
    */
   isAllSelected(selection: ISelection): boolean;
}
