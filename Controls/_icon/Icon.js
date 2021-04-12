define('Controls/_icon/Icon', ['UI/Executor', 'Controls/Utils/Icon', 'css!Controls/CommonClasses'], function(Executor, Icon) {
   var filename = 'Controls/_icon/Icon';
   var thelpers = Executor.TClosure;
   var templateFunction = function Module_template(data, attr, context, isVdom, sets, forceCompatible, generatorConfig
   ) {
      var key = thelpers.validateNodeKey(attr && attr.key);
      var isSvgIcon = Icon.isSVGIcon(data.icon);
      var icon = Icon.getIcon(data.icon);
      var classes = Icon.getClasses(data.iconSize, data.iconStyle, isSvgIcon, icon);
      var defCollection = {
         id: [],
         def: undefined
      };
      var viewController = thelpers.calcParent(this, typeof currentPropertyName === 'undefined' ? undefined : currentPropertyName, data);
      if (typeof forceCompatible === 'undefined') {
         forceCompatible = false;
      }
      var markupGenerator = thelpers.createGenerator(isVdom, forceCompatible, generatorConfig);
      try {
         var out = markupGenerator.joinElements([(isSvgIcon ? ([markupGenerator.createTag('svg', {
            'attributes': {
               'fill-rule': 'evenodd',
               'class': classes
            },
            'events': typeof window === 'undefined' ? {} : {},
            'key': key + '0_0_'
         }, [markupGenerator.createTag('use', {
            'attributes': { 'xlink:href': icon },
            'events': typeof window === 'undefined' ? {} : {},
            'key': key + '0_0_0_'
         }, [], attr ? {
            context: attr.context,
            key: key + '0_0_0_'
         } : {}, defCollection, viewController),], attr, defCollection, viewController),]) : ([markupGenerator.createTag('div', {
            'attributes': { 'class': classes},
            'events': typeof window === 'undefined' ? {} : {},
            'key': key + '1_0_'
         }, [], attr, defCollection, viewController),])),], key, defCollection);
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
