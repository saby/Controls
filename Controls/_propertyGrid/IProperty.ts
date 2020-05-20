/**
 * Интерфейс свойств PropertyGrid.
 * @interface Controls/_propertyGrid/IProperty
 * @author Герасимов А.М.
 */

/*
 * Interface of PropertyGrid property.
 * @interface Controls/_propertyGrid/IProperty
 * @author Герасимов А.М.
 */

type TProperty = String | Boolean | Number | Date | number[] | string[];

export default interface IProperty {
    /**
     * @name Controls/_propertyGrid/IProperty#name
     * @cfg {String} Название свойства.
     */

    /*
     * @name Controls/_propertyGrid/IProperty#name
     * @cfg {String} property name
     */
    name: string;
    /**
     * @name Controls/_propertyGrid/IProperty#caption
     * @cfg {String} Заголовок отображается как метка для поля.
     */

    /*
     * @name Controls/_propertyGrid/IProperty#caption
     * @cfg {String} caption A custom caption to appear as label for this field.
     * If specified, the caption will be shown in the name column instead of the property name.
     */
    caption?: string;
    /**
     * @name Controls/_propertyGrid/IProperty#editorTemplateName
     * @cfg {String} Имя контрола, который будет использоваться в качестве редактора, если не используется редактор по умолчанию.
     */

    /*
     * @name Controls/_propertyGrid/IProperty#editorTemplateName
     * @cfg {String} Name of the control, the will be user as editor, if left unset the default editor will used
     */
    editorTemplateName?: string;
    /**
     * @name Controls/_propertyGrid/IProperty#editorOptions
     * @cfg {Object} Параметры редактора.
     */

    /*
     * @name Controls/_propertyGrid/IProperty#editorOptions
     * @cfg {Object} Options for the editor
     */
    editorOptions?: object;
    /**
     * @name Controls/_propertyGrid/IProperty#editorClass
     * @cfg {Object} Имя класса редактора.
     */

    /*
     * @name Controls/_propertyGrid/IProperty#editorClass
     * @cfg {Object} Class name for the editor
     */
    editorClass?: string;
    /**
     * @name Controls/_propertyGrid/IProperty#type
     * @cfg {String} Тип свойства. Опция принимает значения:
     * 'int', 'boolean', 'string', 'enum', 'date'. Если не задано, тип определяется по значению.
     */

    /*
     * @name Controls/_propertyGrid/IProperty#type
     * @cfg {String} type of property, the available values are:
     * ‘int’, ‘boolean’, ‘string’, ‘enum’, ‘date’,if left unset, type will detected by value.
     */
    type?: TProperty;
    /**
     * @name Controls/_propertyGrid/IProperty#group
     * @cfg {String} Поле, по которому будут сгруппированы редакторы.
     */

    /*
     * @name Controls/_propertyGrid/IProperty#group
     * @cfg {String} by this fieldeditors will grouped.
     */
    group?: string;

    propertyValue: any;
}
