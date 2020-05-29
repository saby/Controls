/**
 * Шаблон, который по умолчанию используется для отображения фильтра в области значений {@link Controls/filter:View Объединенного фильтра}.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filter.less">переменные тем оформления</a>
 * 
 * @class Controls/filter:ItemTemplate
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
   /**
    * @name Controls/filter:ItemTemplate#contentTemplate
    * @cfg {String|function|undefined} Пользовательский шаблон, описывающий содержимое элемента.
    * @remark
    * В области видимости шаблона доступны две переменные — item и text.
    * @example
    * <pre class="brush: html">
    * <Controls.filter:View>
    *    <ws:itemTemplate>
    *       <ws:partial template="Controls/filter:ViewItemTemplate" scope="{{itemTemplate}}">
    *          <ws:contentTemplate>
    *          {{contentTemplate.itemData.item.title}}
    *          {{contentTemplate.itemData.text}}
    *          </ws:contentTemplate>
    *       </ws:partial>
    *    </ws:itemTemplate>
    * </Controls.filter:View>
    * </pre>
    */
   contentTemplate?: string;
   /**
    * @name Controls/filter:ItemTemplate#text
    * @cfg {String} Текст, отображаемый в области значений.
    * @default undefined
    */
   text?: string;
}
