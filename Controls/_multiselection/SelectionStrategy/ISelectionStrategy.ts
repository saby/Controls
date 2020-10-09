import { ISelectionObject as ISelection} from 'Controls/interface';
import { Model } from 'Types/entity';
import { IFlatSelectionStrategyOptions, ISelectionItem, ITreeSelectionStrategyOptions } from '../interface';
import { CollectionItem } from 'Controls/display';
import { CrudEntityKey } from 'Types/source';

/**
 * Интерфейс базового класс стратегий выбора
 * @author Панихин К.А.
 * @public
 */
export default interface ISelectionStrategy {
   /**
    * Выбирает элементы с переданными ключам
    * @param {ISelection} selection текущее состояние выбранных ключей
    * @param {CrudEntityKey} key ключ элемента
    * @return {ISelection} новое состояние выбранных элементов
    */
   select(selection: ISelection, key: CrudEntityKey): ISelection;

   /**
    * Снимает выбор с элементов с переданными ключам
    * @param {ISelection} selection текущее состояние выбранных ключей
    * @param {CrudEntityKey} key ключ элемента
    * @return {ISelection} новое состояние выбранных элементов
    */
   unselect(selection: ISelection, key: CrudEntityKey): ISelection;

   /**
    * Выбирает все элементы в текущем корне
    *
    * В плоской стратегии всегда один и тот же корень null
    *
    * @param {ISelection} selection текущее состояние выбранных ключей
    * @return {ISelection} новое состояние выбранных элементов
    */
   selectAll(selection: ISelection): ISelection;

   /**
    * Переключает выбор всех элементов в текущем корне
    *
    * @remark В плоской стратегии всегда один и тот же корень - null
    *
    * @param {ISelection} selection текущее состояние выбранных ключей
    * @param {boolean} hasMoreData имеются ли в модели еще не загруженные элементы
    * @return {ISelection} новое состояние выбранных элементов
    */
   toggleAll(selection: ISelection, hasMoreData: boolean): ISelection;

   /**
    * Снимает выбор со всех элементов в текущем корне
    *
    * @remark В плоской стратегии всегда один и тот же корень - null
    *
    * @param {ISelection} selection текущее состояние выбранных ключей
    * @return {ISelection} новое состояние выбранных элементов
    */
   unselectAll(selection: ISelection): ISelection;

   /**
    * Возвращает состояние элементов для модели
    *
    * @param {ISelection} selection текущее состояние выбранных ключей
    * @param {number} limit ограничивает максимальное число выбранных элементов
    * @param {Array<CollectionItem<Model>>} items Список элементов для которых нужно определить состояние выбранности
    * @param {string} searchValue Значение поиска
    * @return {Map<boolean|null, Array<CollectionItem<Model>>>} мапа, в которой для каждого состояния хранится соответствующий список элементов
    */
   getSelectionForModel(selection: ISelection, limit?: number, items?: Array<CollectionItem<Model>>, searchValue?: string): Map<boolean|null, Array<CollectionItem<Model>>>;

   /**
    * Возвращает количество выбранных элементов
    *
    * @param selection текущее состояние выбранных ключей
    * @param hasMoreData имеются ли в модели еще не загруженные элементы
    * @param limit ограничивает максимальное число выбранных элементов
    * @return {number|null} Количество или null, если невозможно определить точное значение
    */
   getCount(selection: ISelection, hasMoreData: boolean, limit?: number): number|null;

   /**
    * Обновляет опции
    * @param {ITreeSelectionStrategyOptions|IFlatSelectionStrategyOptions} options Новые опции
    * @void
    */
   update(options: ITreeSelectionStrategyOptions | IFlatSelectionStrategyOptions): void;

   /**
    * Проверяет все ли выбраны элементы
    * @remark В деревянной стратегии проверяет, что выбрано все в текущем узле
    * @param selection текущее состояние выбранных ключей
    * @param hasMoreData имеются ли в модели еще не загруженные элементы
    * @param itemsCount количество элементов в модели
    * @param byEveryItem true - проверять выбранность каждого элемента по отдельности. Иначе проверка происходит по наличию единого признака выбранности всех элементов.
    * @return {boolean}
    */
   isAllSelected(selection: ISelection, hasMoreData: boolean, itemsCount: number, byEveryItem?: boolean): boolean;

   /**
    * Задает список элементов
    * @param {Array<CollectionItem<Model>>} items Новый список
    * @void
    */
   setItems(items: ISelectionItem[]): void;
}
