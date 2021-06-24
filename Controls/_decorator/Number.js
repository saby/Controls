define('Controls/_decorator/Number', ['UI/Executor', 'Controls/_decorator/resources/Number'], function (Executor, Number) {
   var filename = 'Controls/_decorator/Number';
   var thelpers = Executor.TClosure;
   var templateFunction = function Controls__decorator_Number_Number(data, attr, context, isVdom, sets, forceCompatible, generatorConfig) {
      var key = thelpers.validateNodeKey(attr && attr.key);

      var useGrouping = data.useGrouping !== false;
      var roundMode = data.roundMode || 'trunc';
      var showEmptyDecimals = data.showEmptyDecimals || false;
      var abbreviationType = data.abbreviationType || 'none';
      var stroked = data.stroked || false;
      var underline = data.underline || 'none';
      var fontColorStyle = Number.calculateFontColorStyle(stroked, data) || 'default';
      var formattedNumber = Number.calculateFormattedNumber(
         data.value, useGrouping, roundMode, data.fractionSize, abbreviationType, showEmptyDecimals, data
      );
      var tooltip = data.tooltip || formattedNumber;

      var mainClass = Number.calculateMainClass(data.fontSize, fontColorStyle, stroked, underline, data.fontWeight);

      var defCollection = {
         id: [],
         def: undefined
      };
      var viewController = thelpers.calcParent(this, typeof currentPropertyName === 'undefined' ? undefined : currentPropertyName, data);
      if (typeof forceCompatible === 'undefined') {
         forceCompatible = false;
      }
      var markupGenerator = thelpers.createGenerator(isVdom, forceCompatible, generatorConfig);
      var funcContext = thelpers.getContext(this);
      try {
         var out = markupGenerator.joinElements([markupGenerator.createTag('span', {
            'attributes': {
               'class': mainClass,
               'title': tooltip || formattedNumber
            },
            'events': typeof window === 'undefined' ? {} : {},
            'key': key + '0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(formattedNumber))) + '', key + '0_0_')], attr, defCollection, viewController)], key, defCollection);
         if (defCollection && defCollection.def) {
            out = markupGenerator.chain(out, defCollection, this);
         }
      } catch (e) {
         thelpers.templateError(filename, e, data);
      }
      return out || markupGenerator.createText('');
   };
   templateFunction.stable = true;
   templateFunction.reactiveProps = [];
   templateFunction.isWasabyTemplate = true;
   return templateFunction;
});

/**
 * Графический контрол, декорирующий число таким образом, что оно приводится к форматируемому виду.
 * Форматом является число разбитое на триады с ограниченной дробной частью.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_decorator.less переменные тем оформления}
 *
 * @class Controls/_decorator/Number
 * @extends UI/Base:Control
 * @mixes Controls/decorator:INumber
 * @public
 * @demo Controls-demo/Decorator/Number/Index
 *
 * @author Красильников А.С.
 */

/**
 * Интерфейс для опций контрола {@link Controls/decorator:Number}.
 * @interface Controls/_decorator/INumber
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_decorator/INumber#value
 * @cfg {Controls/_decorator/INumber/TValue.typedef} Декорируемое число.
 * @demo Controls-demo/Decorator/Number/Value/Index
 */

/**
 * @name Controls/_decorator/INumber#fractionSize
 * @cfg {Number} Количество знаков после запятой. Диапазон от 0 до 20.
 * @demo Controls-demo/Decorator/Number/FractionSize/Index
 * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена. Используйте опцию {@link Controls/_decorator/INumber#precision}.
 */

/**
 * @name Controls/_decorator/INumber#precision
 * @cfg {Number} Количество знаков после запятой. Диапазон от 0 до 20.
 * @demo Controls-demo/Decorator/Number/Precision/Index
 */

/**
 * @name Controls/_decorator/INumber#roundMode
 * @cfg {Controls/_decorator/INumber/RoundMode.typedef} Режим форматирования дробной части числа.
 * @default trunc
 * @demo Controls-demo/Decorator/Number/RoundMode/Index
 */

/**
 * @name Controls/_decorator/INumber#abbreviationType
 * @cfg {Controls/_decorator/INumber/TAbbreviationType.typedef} Тип аббревиатуры.
 * @default 'none'
 * @demo Controls-demo/Decorator/Number/Abbreviation/Index
 */

/**
 * Тип данных для форматируемого значения
 * @typedef {string|number|null} Controls/_decorator/INumber/TValue
 */

/**
 * Тип данных для аббревиатуры
 * @typedef {string} Controls/_decorator/INumber/TAbbreviationType
 * @variant short
 * @variant long
 * @variant none
 */

/**
 * @typedef Controls/_decorator/INumber/RoundMode
 * @variant round При необходимости число округляется, а дробная часть дополняется нулями, чтобы она имела заданную длину.
 * @variant trunc Усекает (отсекает) цифры справа от точки так, чтобы дробная часть имела заданную длину, независимо от того, является ли аргумент положительным или отрицательным числом.
 */