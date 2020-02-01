/**
 * Created by rn.kondakov on 18.10.2018.
 */
import thelpers = require('View/Executor/TClosure');
import validHtml = require('Core/validHtml');
import {Logger} from 'UI/Utils';
import 'css!theme?Controls/decorator';

   var markupGenerator,
      defCollection,
      control,
      resolver,
      resolverParams,
      resolverMode,
      currentValidHtml,
      linkAttributesMap = {
         'action': true,
         'background': true,
         'cite': true,
         'codebase': true,
         'formaction': true,
         'href': true,
         'icon': true,
         'longdesc': true,
         'manifest': true,
         'poster': true,
         'profile': true,
         'src': true,
         'usemap': true
      },
      startOfGoodLinks = [
         'http:(//|\\\\)',
         'https:(//|\\\\)',
         'ftp:(//|\\\\)',
         'file:(//|\\\\)',
         'smb:(//|\\\\)',
         'mailto:',
         '#',
         './',
         '/'
      ],
      goodLinkAttributeRegExp = new RegExp(`^(${startOfGoodLinks.join('|')})`
         .replace(/[a-z]/g, (m) => `[${m + m.toUpperCase()}]`)),
      dataAttributeRegExp = /^data-(?!(component|bind)$)([\w-]*[\w])+$/,
      escapeVdomRegExp = /&([a-zA-Z0-9#]+;)/g,
      additionalNotVdomEscapeRegExp = /(\u00a0)|(&#)/g;

   function isString(value) {
      return typeof value === 'string' || value instanceof String;
   }

   function logError(text: string, node?: any[]|string|object) {
       let strNode: string;
       try {
           strNode = JSON.stringify(node);
       } catch (e) {
           strNode = '"Невалидный Json узел"';
       }

       Logger.error('View/Executor/TClosure' + `Ошибка разбора JsonML: ${text}. Ошибочный узел: ${strNode}`);
       // Logger.error(`Ошибка разбора JsonML: ${text}. Ошибочный узел: ${strNode}\n`, control, {});
   }

   function generateEventSubscribeObject(handlerName) {
      return {
         name: 'event',
         args: [],
         value: handlerName,
         fn: (function(self) {
            const f = (function() {
               const event = arguments[0];
               event.result = thelpers.getter(this, [handlerName]).apply(this, arguments);
            }).bind(self);
            f.control = self;
            f.isControlEvent = false;
            return f;
         })(control)
      };
   }

   function addEventListener(events, eventName, handlerName) {
      if (!events[eventName]) {
         events[eventName] = [];
      }
      events[eventName].push(generateEventSubscribeObject(handlerName));
   }

   function isBadLinkAttribute(attributeName, attributeValue) {
      return linkAttributesMap[attributeName] && !goodLinkAttributeRegExp.test(attributeValue);
   }

   function validAttributesInsertion(targetAttributes: object,
                                     sourceAttributes: object,
                                     additionalValidAttributes?: object
   ) {
      const validAttributes: Object = currentValidHtml.validAttributes;
      for (let attributeName in sourceAttributes) {
         if (!sourceAttributes.hasOwnProperty(attributeName)) {
            continue;
         }
         const sourceAttributeValue = sourceAttributes[attributeName];
         if (!isString(sourceAttributeValue)) {
            logError(`Невалидное значение атрибута ${attributeName}, ожидается строковое значение`, sourceAttributes);
            continue;
         }
         const isStrictValid = validAttributes[attributeName];
         const isAdditionalValid = additionalValidAttributes && additionalValidAttributes[attributeName];
         if (!isStrictValid && !isAdditionalValid && !dataAttributeRegExp.test(attributeName)) {
            continue;
         }

         // Разрешаем только ссылочные атрибуты с безопасным началом, чтобы избежать XSS.
         if (isBadLinkAttribute(attributeName, sourceAttributeValue)) {
            continue;
         }
         targetAttributes[attributeName] = markupGenerator.escape(sourceAttributeValue);
      }
   }

   function recursiveMarkup(value, attrsToDecorate, key, parent?) {
      var valueToBuild = resolverMode && resolver ? resolver(value, parent, resolverParams) : value,
         wasResolved,
         i;
      if (isString(valueToBuild)) {
         if (!resolver || !resolver.__noNeedEscapeString) {
            valueToBuild = markupGenerator.escape(valueToBuild);
         }
         return markupGenerator.createText(valueToBuild, key);
      }
      if (!valueToBuild) {
         return [];
      }
      if (!Array.isArray(valueToBuild)) {
         logError(`Узел в JsonML должен быть строкой или массивом`, valueToBuild);
         return [];
      }
      wasResolved = value !== valueToBuild;
      resolverMode ^= wasResolved;
      var children = [];
      if (Array.isArray(valueToBuild[0])) {
         for (i = 0; i < valueToBuild.length; ++i) {
            children.push(recursiveMarkup(valueToBuild[i], attrsToDecorate, key + i + '_', valueToBuild));
         }
         resolverMode ^= wasResolved;
         return children;
      }
      let firstChildIndex = 1;
      const tagName = valueToBuild[0];
      const attrs = {
            attributes: {},
            events: {},
            key: key
         };
      const validNodesValue = currentValidHtml.validNodes[tagName];
      let additionalValidAttributes;
      if (!validNodesValue) {
         resolverMode ^= wasResolved;
         return [];
      }
      if (typeof validNodesValue === 'object') {
         additionalValidAttributes = validNodesValue;
      }
      if (valueToBuild[1] && !isString(valueToBuild[1]) && !Array.isArray(valueToBuild[1])) {
         firstChildIndex = 2;
         validAttributesInsertion(attrs.attributes, valueToBuild[1], additionalValidAttributes);
      }
      for (i = firstChildIndex; i < valueToBuild.length; ++i) {
         children.push(recursiveMarkup(valueToBuild[i], {}, key + i + '_', valueToBuild));
      }
      resolverMode ^= wasResolved;
      return [markupGenerator.createTag(tagName, attrs, children, attrsToDecorate, defCollection, control, key)];
   }

   var template = function(data, attr, context, isVdom, sets?) {
      markupGenerator = thelpers.getMarkupGenerator(isVdom);
      defCollection = {
         id: [],
         def: undefined
      };
      control = data;
      resolver = control._options.tagResolver;
      resolverParams = control._options.resolverParams || {};
      resolverMode = 1;
      currentValidHtml = control._options.validHtml || validHtml;

      const events = attr.events || {};
      if (typeof window !== 'undefined') {
         addEventListener(events, 'on:contextmenu', '_contextMenuHandler');
         addEventListener(events, 'on:copy', '_copyHandler');
      }
      var elements = [],
         key = (attr && attr.key) || '_',
         attrsToDecorate = {
            attributes: attr.attributes,
            events: events,
            context: attr.context
         },
         oldEscape,
         value = control._options.value;
      if (value && value.length) {
         // Need just one root node.

         // Mobile can't work with tags yet, so can be value like ["text"].
         // TODO: cancel this merge in https://online.sbis.ru/opendoc.html?guid=a8a904f8-6c0d-4754-9e02-d53da7d32c99
         if (value.length === 1 && isString(value[0])) {
            value = ['div', value[0].split('\n').map(function(str, index) {
               // Newline symbol does not shown in the middle of tag.
               return index ? ['p', '\n' + str] : ['p', str];
            })];
         } else {
            value = ['div', value];
         }
      }
      if (isVdom) {
         // Protect view of text from needless unescape in inferno.
         oldEscape = markupGenerator.escape;
         markupGenerator.escape = function(str) {
            return str.replace(escapeVdomRegExp, function(match, entity) {
               return '&amp;' + entity;
            });
         };
      } else {
         // Markup Converter should escape long space characters too.
         oldEscape = markupGenerator.escape;
         markupGenerator.escape = function(str) {
            return oldEscape(str).replace(additionalNotVdomEscapeRegExp,
               (match) => match[0] === '&' ? '&amp;#' : '&nbsp;');
         };
      }
      try {
         elements = recursiveMarkup(value, attrsToDecorate, key + '0_');
      } catch (e) {
          Logger.error('View/Executor/TClosure: ' + e.message, undefined, e);
      } finally {
         markupGenerator.escape = oldEscape;
      }

      if (!elements.length) {
         elements = [isVdom ? markupGenerator.createTag('div', { key: key + '0_' }, [], attrsToDecorate,
            defCollection, control, key + '0_') : ''];
      }

      // Избежим утечки из-за глобальных переменных.
      control = null;
      resolver = null;
      resolverParams = null;
      resolverMode = null;
      currentValidHtml = null;

      return markupGenerator.joinElements(elements, key, defCollection);
   };

   // Template functions should have true "stable" flag to send error on using, for example, some control instead it.
   template.stable = true;


   export = template;

