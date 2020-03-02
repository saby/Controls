/**
 * Шаблон, который по умолчанию используется для отображения фильтра в области значений {@link Controls:filter/View Объединенного фильтра}.
 * @class Controls/filter:ItemTemplate
 * @mixes Controls/list:IContentTemplate
 * @author Герасимов А.М.
 * @public
 */
export default interface IItemTemplateOptions {
   /**
    * @name Controls/filter:ItemTemplate#beforeContentTemplate
    * @cfg {String} Шаблон, который отображается перед фильтром.
    * @default undefined
    * @remark
    * По умолчанию шаблон отображает треугольник.
    * Чтобы скрыть этот треугольник, в опцию beforeContentTemplate передайте значение null.
    */
   beforeContentTemplate?: string;
   contentTemplate?: string;
   /**
    * @name Controls/filter:ItemTemplate#text
    * @cfg {String} Текст, отображаемый в области значений.
    * @default undefined
    */
   text?: string;
}
