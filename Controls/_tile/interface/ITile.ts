/**
 * Интерфейс для списков, в которых элементы отображаются в виде {@link /doc/platform/developmentapl/interface-development/controls/list/tile/ плитки}.
 *
 * @interface Controls/_tile/interface/ITile
 * @public
 * @author Авраменко А.С.
 */

/*
 * Interface for lists in which items are displayed as tiles.
 *
 * @interface Controls/_tile/interface/ITile
 * @public
 * @author Авраменко А.С.
 */

/**
 * @name Controls/_tile/interface/ITile#tileHeight
 * @cfg {Number} Высота элементов, отображаемых в виде плитки.
 * @default 150
 * @remark
 * Эта опция необходима для расчета размеров элементов при отрисовке на сервере.
 * Если установить высоту с помощью css, компонент не будет отображен корректно.
 * Если опция {@link Controls/tile:ItemTemplate#staticHeight staticHeight} не установлена в значение "true", опция tileHeight задает минимальную высоту, а дальше плитка пропорционально растягивается от ширины (см. {@link Controls/tile:ItemTemplate#tileWidth tileWidth} и {@link Controls/tile:ItemTemplate#folderWidth folderWidth}).
 *
 * @example
 * В следующем примере показано, как установить высоту элементов - 200 пикселей.
 * <pre class="brush: html; highlight: [3]">
 * <!-- WML -->
 * <Controls.tile:View
 *    tileHeight="{{200}}"
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    nodeProperty="Раздел@"/>
 * </pre>
 */

/**
 * @cfg {Controls/_list/interface/IList/ItemPadding.typedef} Конфигурация внешних отступов плитки.
 * @name Controls/_tile/interface/ITile#itemsContainerPadding
 * @demo Controls-demo/tileNew/ItemsContainerPadding/Index
 * @example
 * <pre class="brush: html; highlight: [4-8]">
 * <!-- WML -->
 * <Controls.tile:View source="{{_viewSource}}" imageProperty="image">
 *    <ws:itemsContainerPadding
 *       top="l"
 *       bottom="l"
 *       left="l"
 *       right="l"/>
 * </Controls.tile:View>
 * </pre>
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tile/paddings/#item-container-padding руководство разработчика}
 */

/**
 * @typedef {String} TileItemPaddingEnum
 * @description Допустимые значения для свойств {@link Controls/tile:ITile.ItemPadding ItemPadding}.
 * @variant null Нулевой отступ.
 * @variant 3xs Минимальный отступ.
 * @variant 2xs Почти минимальный отступ.
 * @variant xs Очень маленький отступ.
 * @variant s Маленький отступ.
 * @variant m Средний отступ.
 * @variant l Большой отступ.
 * @variant xl Очень большой оступ.
 * @variant 2xl Максимальный отступ.
 */

/**
 * @typedef {String} TileItemPadding
 * @property {TileItemPaddingEnum} [top=m] Отступ сверху от плитки. Если свойство принимает значение null, то отступ отсутствует.
 * @property {TileItemPaddingEnum} [bottom=m] Отступ снизу от плитки. Если свойство принимает значение null, то отступ отсутствует.
 * @property {TileItemPaddingEnum} [left=m] Отступ слева от плитки. Если свойство принимает значение null, то отступ отсутствует.
 * @property {TileItemPaddingEnum} [right=m] Отступ справа от плитки. Если свойство принимает значение null, то отступ отсутствует.
 */

/**
 * @cfg {TileItemPadding}  Конфигурация отступов между элементами плитки.
 * @name Controls/_tile/interface/ITile#itemPadding
 * @demo Controls-demo/tileNew/ItemPadding/Index
 * @example
 * <pre class="brush: html; highlight: [4-8]">
 * <!-- WML -->
 * <Controls.tile:View source="{{_viewSource}}" imageProperty="image">
 *    <ws:itemPadding
 *       top="l"
 *       bottom="l"
 *       left="l"
 *       right="l"/>
 * </Controls.tile:View>
 * </pre>
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tile/paddings/#item-padding руководство разработчика}
 */

/**
 * @name Controls/_tile/interface/ITile#tileWidth
 * @cfg {Number} Минимальная ширина элементов, отображаемых в виде плитки.
 * @default 250
 * @remark Эта опция необходима для расчета размеров элементов при отрисовке на сервере.
 * Если установить высоту с помощью css, компонент не будет отображен корректно.
 * @example
 * В следующем примере показано, как установить минимальную ширину элементов - 300 пикселей.
 * <pre class="brush: html; highlight: [3]">
 * <!-- WML -->
 * <Controls.tile:View
 *    tileWidth="{{300}}"
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    nodeProperty="Раздел@"/>
 * </pre>
 */

/**
 * @name Controls/_tile/interface/ITile#tileWidthProperty
 * @cfg {String} Название свойства на элементе, которое содержит минимальную ширину элемента, отображаемого в виде плитки.
 * @demo Controls-demo/tileNew/TileWidthProperty/Index
 * @remark Эта опция необходима для расчета размеров элементов при отрисовке на сервере.
 * Если установить высоту с помощью css, компонент не будет отображен корректно.
 * @example
 * <pre class="brush: html; highlight: [3]">
 * <!-- WML -->
 * <Controls.tile:View
 *    tileWidthProperty="itemWidth"
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    nodeProperty="Раздел@"/>
 * </pre>
 */
/*
 * @name Controls/_tile/interface/ITile#tileHeight
 * @cfg {Number} The height of the tile items.
 * @default 150
 * @remark This option is required to calculate element sizes when rendering on the server.
 * If you set the height using css, the component cannot be displayed immediately in the correct state.
 * @example
 * The following example shows how to set the height of items to 200 pixels.
 * <pre class="brush: html; highlight: [3]">
 * <!-- WML -->
 * <Controls.tile:View
 *    tileWidthProperty="itemWidth"
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    nodeProperty="Раздел@"/>
 * </pre>
 */

/**
 * @typedef {String} TileScalingMode
 * @variant none При наведении курсора размер элементов не изменяется.
 * @variant outside При наведении курсора размер элементов увеличивается. Увеличенный элемент находится в окне браузера.
 * @variant inside При наведении курсора размер элементов увеличивается. Увеличенный элемент находится в контроле-контейнере.
 */

/**
 * @name Controls/_tile/interface/ITile#tileScalingMode
 * @cfg {TileScalingMode} Режим отображения плитки при наведении курсора.
 * @default none
 * @remark Увеличенный элемент расположен в центре относительно исходного положения.
 * Если увеличенный элемент не помещается в указанный контейнер, увеличение не происходит.
 * @example
 * В следующем примере показано, как установить режим наведения 'outside'.
 * <pre class="brush: html; highlight: [4]">
 * <!-- WML -->
 * <Controls.tile:View
 *    itemsHeight="{{200}}"
 *    tileScalingMode="outside"
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    nodeProperty="Раздел@"/>
 * </pre>
 * @demo Controls-demo/tileNew/TileMode/Index
 */

/*
 * @name Controls/_tile/interface/ITile#tileScalingMode
 * @cfg {String} Scale mode for items when you hover over them.
 * @variant none On hover the size of the items is not changed.
 * @variant outside On hover the size of the items increases. The increased item is located within the browser window.
 * @variant inside On hover the size of the items increases. The increased item is located within the control container.
 * @default none
 * @remark The increased item is positioned in the center relative to the initial position.
 * If the increased item does not fit in the specified container, the increase does not occur.
 * @example
 * The following example shows how to set the hover mode to 'outside'.
 * <pre class="brush: html; highlight: [4]">
 * <!-- WML -->
 * <Controls.tile:View
 *    itemsHeight="{{200}}"
 *    tileScalingMode="outside"
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    nodeProperty="Раздел@"/>
 * </pre>
 */

/**
 * @name Controls/_tile/interface/ITile#imageProperty
 * @cfg {String} Имя свойства, содержащего ссылку на изображение для плитки.
 * @default image
 * @example
 * В следующем примере показано, как задать поле с изображением 'img'.
 * <pre class="brush: html; highlight: [8]">
 * <!-- WML -->
 * <Controls.tile:View
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    nodeProperty="Раздел@">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:ItemTemplate" imageProperty="img" >
 *    </ws:itemTemplate>
 *    </Controls.tile:View>
 * </pre>
 */

/**
 * @name Controls/_tile/interface/ITile#imageHeightProperty
 * @cfg {String} Имя свойства, содержащего высоту оригинального изображения.
 * @default undefined
 * @demo Controls-demo/tileNew/ImageFit/Index
 * @example
 * В следующем примере показано, как задать поле с высотой'.
 * <pre class="brush: html; highlight: [6]">
 * <!-- WML -->
 * <Controls.tile:View
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    imageHeightProperty='imageHeight'
 *    nodeProperty="Раздел@">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:ItemTemplate">
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 */

/**
 * @name Controls/_tile/interface/ITile#imageWidthProperty
 * @cfg {String} Имя свойства, содержащего ширину оригинального изображения.
 * @default undefined
 * @demo Controls-demo/tileNew/ImageFit/Index
 * @example
 * В следующем примере показано, как задать поле с шириной'.
 * <pre class="brush: html; highlight: [6]">
 * <!-- WML -->
 * <Controls.tile:View
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    imageWidthProperty='imageWidth'
 *    nodeProperty="Раздел@">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:ItemTemplate">
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 */

/*
 * @name Controls/_tile/interface/ITile#imageProperty
 * @cfg {String} Name of the item property that contains the link to the image.
 * @default image
 * @example
 * The following example shows how to set the field with the image 'img'.
 * <pre class="brush: html; highlight: [6]">
 * <!-- WML -->
 * <Controls.tile:View
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    imageWidthProperty='imageWidth'
 *    nodeProperty="Раздел@">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:ItemTemplate">
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 */

 /**
 * @name Controls/_tile/interface/ITile#tileMode
 * @cfg {String} Режим отображения плитки с динамической/фиксированной шириной.
 * @variant static Отображается плитка с фиксированной шириной.
 * @variant dynamic Отображается плитка с динамической шириной.
 * @see imageHeightProperty
 * @see imageWidthProperty
 * @remark Для автоматического расчета ширины элемента нужно указать оригинальные размеры изображения.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tile/view/width/ руководство разработчика}
 * @example
 * В следующем примере показано, как отобразить плитку с динамической шириной.
 * <pre class="brush: html; highlight: [9]">
 * <!-- WML -->
 * <Controls.tile:View
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    imageWidthProperty="imageWidth"
 *    imageHeightProperty="imageHeight"
 *    nodeProperty="Раздел@"
 *    tileMode="dynamic">
 *    <ws:itemTemplate>
 *       ...
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @demo Controls-demo/tileNew/TileMode/Dynamic/Index
 */

/**
 * @name Controls/_tile/interface/ITile#tileSize
 * @cfg {String} Минимальный размер плитки с статическим видом отображения.
 * @variant s
 * @variant m
 * @variant l
 * @example
 * <pre class="brush: html; highlight: [6]">
 * <!-- WML -->
 * <Controls.tile:View
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    tileSize="s"
 *    nodeProperty="Раздел@"
 *    tileMode="static">
 *    <ws:itemTemplate>
 *       ...
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 */

/**
 * @typedef {String} ActionMode
 * @variant showType Опции над записью показываются согласно showType.
 * @variant adaptive Опции над записью будут расчитаны динамически. Количество отображенных команд зависит от ширины плитки.
 */
/**
 * @name Controls/_tile/interface/ITile#actionMode
 * @cfg {ActionMode} Вид отображения опций над записью.
 * @default showType
 * @remark Динамический расчет применяется только к плиткам.
 * @example
 * <pre class="brush: html; highlight: [5]">
 * <!-- WML -->
 * <Controls.tile:View
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    actionMode="adaptive"
 *    nodeProperty="Раздел@"
 *    tileMode="static">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:PreviewTemplate" scope="{{itemTemplate}}"/>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @demo Controls-demo/tileNew/DifferentItemTemplates/PreviewTemplate/Index
 */

/**
 * @typedef {String} ActionMenuViewMode
 * @variant menu Контекстное меню в виде выпадающего списка.
 * @variant preview Контекстное меню будет отображено в виде превью.
 */

/**
 * @name Controls/_tile/interface/ITile#actionMenuViewMode
 * @cfg {ActionMenuViewMode} Вид отображения меню опций записи.
 * @demo Controls-demo/tileNew/DifferentItemTemplates/PreviewTemplate/Index
 */

/**
 * @name Controls/_tile/interface/ITile#imageUrlResolver
 * @cfg {Function} Функция обратного вызова для получения url изображения для плитки. Используется, если по каким-то причинам сервис previewer не подходит.
 * @see ImageFit.wml
 * @see imageProperty
 * @remark Особенно актуально при использовании imageFit в режиме cover.
 * @fuction
 * @param {number} width - ширина изображения.
 * @param {number} height - высота изображения.
 * @param {string} baseUrl - url, полученный с записи через imageProperty.
 * @param {Types/entity:Model} - элемент списка, для которого нужно изображение.
 * @example
 * <pre class="brush: html; highlight: [6]">
 * <!-- WML -->
 * <Controls.tile:View
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    imageFit="cover"
 *    imageUrlResolver="{{_imageUrlResolver}}"
 *    nodeProperty="Раздел@"
 *    tileMode="static">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:PreviewTemplate" scope={{itemTemplate}}/>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @demo Controls-demo/tileNew/ImageFit/Cover/Index
 */

/**
 * @typedef {String} ImageFit
 * @variant none Изображение вставляется в центр плитки и отображается "как есть"
 * @variant cover Изображение будет подстраиваться под размеры плитки так, чтобы заполнить всю область плитки.
 * @variant contain Изображение полностью помещается в контейнер плитки без обрезания и масштабирования.
 */

/**
 * @name Controls/_tile/interface/ITile#imageFit
 * @cfg {ImageFit} Режим отображения изображения в плитке
 * @see imageUrlResolver
 * @see imageProperty
 * @see imageHeightProperty
 * @see imageWidthProperty
 * @example
 * <pre class="brush: html; highlight: [5]">
 * <!-- WML -->
 * <Controls.tile:View
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    imageFit="cover"
 *    imageUrlResolver={{_imageUrlResolver}}
 *    nodeProperty="Раздел@"
 *    tileMode="static">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:PreviewTemplate" scope="{{itemTemplate}}" />
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @demo Controls-demo/tileNew/ImageFit/Index
 */

/**
 * @typedef {String} Controls/_tile/interface/ITile/TRoundBorderSize
 * @variant null Без скругления.
 * @variant XS Минимальный радиус скругления.
 * @variant S Малый радиус скругления.
 * @variant M Средний радиус скругления.
 * @variant L Большой радиус скругления.
 * @variant XL Максимальный радиус скругления.
 */

/**
 * @typedef {Object} Controls/_tile/interface/ITile/TRoundBorder
 * @property {Controls/_tile/interface/ITile/TRoundBorderSize.typedef} tr Правый верхний угол.
 * @property {Controls/_tile/interface/ITile/TRoundBorderSize.typedef} tl Левый верхний угол.
 * @property {Controls/_tile/interface/ITile/TRoundBorderSize.typedef} br Правый нижний угол.
 * @property {Controls/_tile/interface/ITile/TRoundBorderSize.typedef} bl Левый нижний угол.
 */

/**
 * @name Controls/_tile/interface/ITile#roundBorder
 * @cfg {Controls/_tile/interface/ITile/TRoundBorder.typedef} Cкругление углов элемента плитки.
 */

/**
 * @name Controls/_tile/interface/ITile#itemWidth
 * @cfg {Number} Ширина плитки. Значение задаётся в px.
 * @remark Ширина папки настраивается в опции {@link folderWidth}.
 * @see staticHeight
 * @see folderWidth
 */
