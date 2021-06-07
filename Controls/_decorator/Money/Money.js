define('Controls/_decorator/Money/Money', ['UI/Executor', 'Controls/_decorator/resources/Money'], function(Executor, Money) {
   var filename = 'Controls/_decorator/Money/Money';
   var thelpers = Executor.TClosure;
   var templateFunction = function Money_Template(data, attr, context, isVdom, sets, forceCompatible, generatorConfig) {
      var key = thelpers.validateNodeKey(attr && attr.key);
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
               'class': Money.calculateMainClass(thelpers.getter(data, ['_options', 'underline']), thelpers.getter(data, ['_options', 'style'])),
               'title': (thelpers.wrapUndef(markupGenerator.escape(thelpers.getter(data, ['_tooltip']))))
            },
            'events': {},
            'key': key + '0_'
         }, [((thelpers.getter(data, ['_options', 'currency']) && thelpers.getter(data, ['_options', 'currencyPosition']) === 'left') ? ([markupGenerator.createTag('span', {
            'attributes': {
               'class': Money.calculateCurrencyClass(thelpers.getter(data, ['_options', 'currencySize']), thelpers.getter(data, ['_options', 'fontColorStyle']), thelpers.getter(data, ['_options', 'fontWeight']))
            },
            'events': {},
            'key': key + '0_0_0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(thelpers.getter(data, ['_currencies', thelpers.getter(data, ['_options', 'currency'])])))) + '', key + '0_0_0_0_')], attr ? {
            context: attr.context,
            key: key + '0_0_0_'
         } : {}, defCollection, viewController)]) : markupGenerator.createText('')), markupGenerator.createTag('span', {
            'attributes': {
               'class': Money.calculateStrokedClass(thelpers.getter(data, ['_options', 'stroked']))
            },
            'events': {},
            'key': key + '0_1_'
         }, [markupGenerator.createTag('span', {
            'attributes': {
               'class': Money.calculateIntegerClass(thelpers.getter(data, ['_options', 'fontSize']), thelpers.getter(data, ['_fontColorStyle']), thelpers.getter(data, ['_options', 'fontWeight']), thelpers.getter(data, ['_options', 'currency']), thelpers.getter(data, ['_options', 'currencyPosition']), thelpers.getter(data, ['_isDisplayFractionPath']))
            },
            'events': {},
            'key': key + '0_1_0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(thelpers.getter(data, ['_formattedNumber', 'integer'])))) + '', key + '0_1_0_0_')], attr ? {
            context: attr.context,
            key: key + '0_1_0_'
         } : {}, defCollection, viewController), ((thelpers.getter(data, ['_isDisplayFractionPath']).apply(funcContext, [thelpers.getter(data, ['_formattedNumber', 'fraction']), thelpers.getter(data, ['_options', 'showEmptyDecimals'])]) && thelpers.getter(data, ['_options', 'abbreviationType']) !== 'long') ? ([markupGenerator.createTag('span', {
            'attributes': {
               'class': Money.calculateFractionClass(thelpers.getter(data, ['_formattedNumber', 'fraction']), thelpers.getter(data, ['_fontColorStyle']), thelpers.getter(data, ['_fractionFontSize']), thelpers.getter(data, ['_options', 'currency']), thelpers.getter(data, ['_options', 'currencyPosition']))
            },
            'events': {},
            'key': key + '0_1_1_0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(thelpers.getter(data, ['_formattedNumber', 'fraction'])))) + '', key + '0_1_1_0_0_')], attr ? {
            context: attr.context,
            key: key + '0_1_1_0_'
         } : {}, defCollection, viewController)]) : markupGenerator.createText(''))], attr ? {
            context: attr.context,
            key: key + '0_1_'
         } : {}, defCollection, viewController), ((thelpers.getter(data, ['_options', 'currency']) && thelpers.getter(data, ['_options', 'currencyPosition']) === 'right') ? ([markupGenerator.createTag('span', {
            'attributes': {
               'class': Money.calculateCurrencyClass(thelpers.getter(data, ['_options', 'currencySize']), thelpers.getter(data, ['_options', 'fontColorStyle']), thelpers.getter(data, ['_options', 'fontWeight']))
            },
            'events': {},
            'key': key + '0_2_0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(thelpers.getter(data, ['_currencies', thelpers.getter(data, ['_options', 'currency'])])))) + '', key + '0_2_0_0_')], attr ? {
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
   templateFunction.reactiveProps = ['_currencies', '_formattedNumber', '_fontColorStyle', '_isDisplayFractionPath', '_fractionFontSize', '_tooltip'];
   templateFunction.isWasabyTemplate = true;
   return templateFunction;
});
