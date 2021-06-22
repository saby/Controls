define('Controls/_decorator/Money', ['UI/Executor', 'Controls/_decorator/resources/Money'], function(Executor, Money) {
   var filename = 'Controls/_decorator/Money';
   var thelpers = Executor.TClosure;
   var templateFunction = function Money_Template(data, attr, context, isVdom, sets, forceCompatible, generatorConfig) {
      var key = thelpers.validateNodeKey(attr && attr.key);

      var value = data.value || null;
      var useGrouping = data.useGrouping === false ? false : true;
      var abbreviationType = data.abbreviationType || 'none';
      var precision = data.precision === 0 ? 0 : 2;
      var formattedNumber = Money.calculateFormattedNumber(value, useGrouping, abbreviationType, precision);
      var stroked = data.stroked || false;
      var fontColorStyle = Money.calculateFontColorStyle(stroked, data) || 'default';
      var fontSize = data.fontSize || 'm';
      var fontWeight = data.fontWeight || 'default';
      var showEmptyDecimals = data.showEmptyDecimals === false ? false : true;
      var currencySize = data.currencySize || 's';
      var currencyPosition = data.currencyPosition || 'right';
      var underline = data.underline || 'none';
      var currency = Money.calculateCurrency(data.currency);
      var fractionFontSize = Money.calculateFractionFontSize(fontSize);
      var isDisplayFractionPath = Money.isDisplayFractionPath(formattedNumber.fraction, showEmptyDecimals, precision);
      var tooltip = Money.calculateTooltip(formattedNumber, data);

      var mainClass = Money.calculateMainClass(underline, data.style);
      var calculateCurrencyClass = Money.calculateCurrencyClass(currencySize, fontColorStyle, fontWeight);
      var strokedClass = Money.calculateStrokedClass(stroked);
      var integerClass = Money.calculateIntegerClass(fontSize, fontColorStyle, fontWeight, data.currency, currencyPosition, isDisplayFractionPath);
      var fractionClass = Money.calculateFractionClass(formattedNumber.fraction, fontColorStyle, fractionFontSize, data.currency, currencyPosition);

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
               'title': tooltip
            },
            'events': {},
            'key': key + '0_'
         }, [((data.currency && currencyPosition === 'left') ? ([markupGenerator.createTag('span', {
            'attributes': {
               'class': calculateCurrencyClass
            },
            'events': {},
            'key': key + '0_0_0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(currency))) + '', key + '0_0_0_0_')], attr ? {
            context: attr.context,
            key: key + '0_0_0_'
         } : {}, defCollection, viewController)]) : markupGenerator.createText('')), markupGenerator.createTag('span', {
            'attributes': {
               'class': strokedClass
            },
            'events': {},
            'key': key + '0_1_'
         }, [markupGenerator.createTag('span', {
            'attributes': {
               'class': integerClass
            },
            'events': {},
            'key': key + '0_1_0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(formattedNumber.integer))) + '', key + '0_1_0_0_')], attr ? {
            context: attr.context,
            key: key + '0_1_0_'
         } : {}, defCollection, viewController), ((isDisplayFractionPath && abbreviationType !== 'long') ? ([markupGenerator.createTag('span', {
            'attributes': {
               'class': fractionClass
            },
            'events': {},
            'key': key + '0_1_1_0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(formattedNumber.fraction))) + '', key + '0_1_1_0_0_')], attr ? {
            context: attr.context,
            key: key + '0_1_1_0_'
         } : {}, defCollection, viewController)]) : markupGenerator.createText(''))], attr ? {
            context: attr.context,
            key: key + '0_1_'
         } : {}, defCollection, viewController), ((data.currency && currencyPosition === 'right') ? ([markupGenerator.createTag('span', {
            'attributes': {
               'class': calculateCurrencyClass
            },
            'events': {},
            'key': key + '0_2_0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(currency))) + '', key + '0_2_0_0_')], attr ? {
            context: attr.context,
            key: key + '0_2_0_'
         } : {}, defCollection, viewController)]) : markupGenerator.createText(''))], attr, defCollection, viewController)], key, defCollection);
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
 * Графический контрол, декорирующий число таким образом, что оно приводится к денежному формату.
 * Денежным форматом является число с неограниченной целой частью, и двумя знаками в дробной части.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_decorator.less переменные тем оформления}
 *
 * @class Controls/_decorator/Money
 * @extends UI/Base:Control
 *
 * @mixes Controls/interface:ITooltip
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/interface:IFontWeightOptions
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:INumberFormat
 * @mixes Controls/decorator:IMoney
 *
 * @public
 * @demo Controls-demo/Decorator/Money/Index
 *
 * @author Красильников А.С.
 */

/**
 * @name Controls/_decorator/IMoney#value
 * @cfg {Controls/_decorator/IMoney/TValue.typedef} Декорируемое число.
 * @default null
 * @demo Controls-demo/Decorator/Money/Value/Index
 */

/**
 * @name Controls/_decorator/IMoney#abbreviationType
 * @cfg {Controls/_decorator/IMoney/TAbbreviationType.typedef} Тип аббревиатуры.
 * @default none
 * @demo Controls-demo/Decorator/Money/Abbreviation/Index
 */

/**
 * @name Controls/_decorator/IMoney#currency
 * @cfg {Controls/_decorator/IMoney/TCurrency.typedef} Отображаемая валюта.
 * @demo Controls-demo/Decorator/Money/Currency/Index
 */

/**
 * @name Controls/_decorator/IMoney#currencySize
 * @cfg {Controls/_decorator/IMoney/TCurrencySize.typedef} Размер отображаемой валюты.
 * @default s
 * @demo Controls-demo/Decorator/Money/CurrencySize/Index
 */

/**
 * @name Controls/_decorator/IMoney#currencyPosition
 * @cfg {Controls/_decorator/IMoney/TCurrencyPosition.typedef} Позиция отображаемой валюты относительно суммы.
 * @default right
 * @demo Controls-demo/Decorator/Money/Currency/Index
 */

/**
 * Тип данных для форматируемого значения
 * @typedef {string|number|null} Controls/_decorator/IMoney/TValue
 */

/**
 * Тип данных для аббревиатуры
 * @typedef {string} Controls/_decorator/IMoney/TAbbreviationType
 * @variant long
 * @variant none
 */

/**
 * Тип данных для отображаемой валюты
 * @typedef {string} Controls/_decorator/IMoney/TCurrency
 * @variant Ruble
 * @variant Euro
 * @variant Dollar
 */

/**
 * Тип данных для позиции отображаемой валюты
 * @typedef {string} Controls/_decorator/IMoney/TCurrencyPosition
 * @variant right
 * @variant left
 */

/**
 * Тип данных для размера отображаемой валюты
 * @typedef {string} Controls/_decorator/IMoney/TCurrencySize
 * @variant 2xs
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 */