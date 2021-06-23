define('Controls/_decorator/Money', ['UI/Executor', 'Controls/_decorator/resources/Money'], function(Executor, Money) {
   var filename = 'Controls/_decorator/Money';
   var thelpers = Executor.TClosure;
   var templateFunction = function Money_Template(data, attr, context, isVdom, sets, forceCompatible, generatorConfig) {
      var key = thelpers.validateNodeKey(attr && attr.key);

      var value = data.value || null;
      var useGrouping = data.useGrouping === false ? false : true;
      var abbreviationType = data.abbreviationType || 'none';
      var precision = data.precision === 0 ? 0 : 2;
      var formattedNumber = Money.calculateFormattedNumber(value, useGrouping, abbreviationType, precision, data.onlyPositive);
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
