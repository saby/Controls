/**
 * Created by rn.kondakov on 18.10.2018.
 */
import template = require('Controls/_decorator/Markup/resources/template');
import linkDecorateUtils = require('Controls/_decorator/Markup/resources/linkDecorateUtils');
import objectMerge = require('Core/core-merge');
import { IoC } from 'Env/Env';

const hasAnyTagRegExp: RegExp = /<[a-zA-Z]+.*?>/;
/**
 * Преобразователь типов из JsonML в HTML и обратно с возможностью клонирования JsonML массива.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_decorator.less">переменные тем оформления</a>
 *
 * @class Controls/_decorator/Markup/Converter
 * @public
 * @author Кондаков Р.Н.
 */

   // Convert node to jsonML array.
   function nodeToJson(node) {
      // Text node, in jsonML it is just a string.
      if (node.nodeType === Node.TEXT_NODE) {
         return node.nodeValue;
      }

      // Element node, in jsonML it is an array.
      if (node.nodeType === Node.ELEMENT_NODE) {
         var json = [];

         // json[0] is a tag name.
         var tagName = node.nodeName.toLowerCase();
         json[0] = tagName;

         // If node has attributes, they are located in json[1].
         var nodeAttributes = node.attributes;
         if (nodeAttributes.length) {
            var jsonAttributes = {};
            for (var i = 0; i < nodeAttributes.length; ++i) {
               jsonAttributes[nodeAttributes[i].name] = nodeAttributes[i].value;
            }
            json[1] = jsonAttributes;
         }

         // After that convert child nodes and push them to array.
         var firstChild;
         if (node.hasChildNodes()) {
            var childNodes = node.childNodes,
               child;

            // Recursive converting of children.
            for (var i = 0; i < childNodes.length; ++i) {
               child = nodeToJson(childNodes[i]);
               if (!i) {
                  firstChild = child;
               }
               json.push(child);
            }
         }

         // By agreement, json shouldn't contain decorated link. Undecorate it if found.
         if (linkDecorateUtils.isDecoratedLink(tagName, firstChild)) {
            json = linkDecorateUtils.getUndecoratedLink(firstChild);
         }

         return json;
      }

      // Return empty array if node is neither text nor element.
      return [];
   }

   /**
    * Преобразует html-строки в допустимый JsonML. Используется только на стороне клиента.
    * @function Controls/_decorator/Markup/Converter#htmlToJson
    * @param html {String}
    * @returns {Array}
    */

   /*
    * Convert html string to valid JsonML. Is using on client-side only.
    * @function Controls/_decorator/Markup/Converter#htmlToJson
    * @param html {String}
    * @returns {Array}
    */
   var htmlToJson = function(html) {
      if (typeof document === 'undefined') {
         IoC.resolve('ILogger')
            .error('Controls/_decorator/Markup/Converter' ,'htmlToJson method doesn\'t work on server-side');
         return [];
      }

      if (html.trim() && !hasAnyTagRegExp.test(html)) {
         // Пришла строка без тега, значит, это текст, а не HTML.
         // TODO: во время рефактора написать функцию textToJson, и писать в консоль ошибку, если текст пришёл в
         // htmlToJson, а не в textToJson. https://online.sbis.ru/opendoc.html?guid=0ae06fe3-d773-4094-be9c-c365f4329d39
         return [[], html]
      }

      let div = document.createElement('div'),
         rootNode,
         rootNodeTagName,
         rootNodeAttributes,
         hasRootTag,
         result;
      div.innerHTML = html.trim();
      hasRootTag = div.innerHTML[0] === '<';
      result = nodeToJson(div).slice(1);
      if (!hasRootTag && div.innerHTML) {
         // In this case, array will begin with a string that is not tag name, what is incorrect.
         // Empty json in the beginning will fix it.
         result.unshift([]);
      }
      div = null;

      // Add version.
      rootNode = result[0];
      if (hasRootTag) {
         // TODO: replace this "magic" getting of attributes with a function from result of task to wrap JsonML.
         // https://online.sbis.ru/opendoc.html?guid=475ea157-8996-47e8-9842-6d4e6533bba5
         if (typeof rootNode[1] === 'object' && !Array.isArray(rootNode[1])) {
            rootNodeAttributes = rootNode[1];
         } else {
            rootNodeAttributes = {};
            rootNodeTagName = rootNode.shift();
            rootNode.unshift(rootNodeAttributes);
            rootNode.unshift(rootNodeTagName);
         }
         rootNodeAttributes.version = '2';
      }

      return result;
   };

   /**
    * Преобразует json-строки в строки формата html.
    * @function Controls/_decorator/Markup/Converter#jsonToHtml
    * @param json {Array} Json на основе JsonML.
    * @param tagResolver {Function} точно как в {@link Controls/_decorator/Markup#tagResolver}.
    * @param resolverParams {Object} точно как в {@link Controls/_decorator/Markup#resolverParams}.
    * @returns {String}
    */

   /*
    * Convert Json to html string.
    * @function Controls/_decorator/Markup/Converter#jsonToHtml
    * @param json {Array} Json based on JsonML.
    * @param tagResolver {Function} exactly like in {@link Controls/_decorator/Markup#tagResolver}.
    * @param resolverParams {Object} exactly like in {@link Controls/_decorator/Markup#resolverParams}.
    * @returns {String}
    */
   var jsonToHtml = function(json, tagResolver?, resolverParams?) {
      var result = template({
         _options: {
            value: json,
            tagResolver: tagResolver,
            resolverParams: resolverParams
         },
         _isMarkupConverter: true,
         _moduleName: 'Controls/decorator:Converter'
      }, {}, {}, false);
      return result;
   };

   /**
    * Преобразует json-массив в его копию по значению во всех узлах.
    * @function Controls/_decorator/Markup/Converter#deepCopyJson
    * @param json
    * @return {Array}
    */

   /*
    * Convert Json array to its copy  by value in all nodes.
    * @function Controls/_decorator/Markup/Converter#deepCopyJson
    * @param json
    * @return {Array}
    */
   var deepCopyJson = function(json) {
      return objectMerge([], json, { clone: true });
   };

   /**
    * @class Controls/_decorator/Markup/Converter
    * @author Кондаков Р.Н.
    * @public
    */

   var MarkupConverter = {
      htmlToJson: htmlToJson,
      jsonToHtml: jsonToHtml,
      deepCopyJson: deepCopyJson
   };

   export = MarkupConverter;

