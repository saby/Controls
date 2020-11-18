/**
 * Шаблон, который по умолчанию используется в {@link Controls/dropdown:Input} для отображения элемента, выбранного из выпадающего списка.
 * @class Controls/_dropdown/interface/inputDefaultContentTemplate
 * @public
 * @author Герасимов А.М.
 * @see Controls/dropdown:ItemTemplate
 */

/**
 * @name Controls/_dropdown/interface/inputDefaultContentTemplate#contentTemplate
 * @cfg {String|Function|undefined} Устанавливает пользовательский шаблон, описывающий содержимое элемента.
 * @default undefined
 * @remark
 * В области видимости шаблона доступны следующие переменные:
 * 
 * * **item** — это объект, который содержит {@link Controls/_dropdown/interface/IDropdownSource/Item.typedef данные выбранного элемента}.
 * * **icon** — иконка выбранного элемента.
 */
