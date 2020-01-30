/**
 * Created by rn.kondakov on 15.02.2019.
 */
import base64 = require('Core/base64');
import { constants } from 'Env/Env';
import * as objectMerge from 'Core/core-merge';
import {Set} from 'Types/shim';

const hrefMaxLength = 1499;
const onlySpacesRegExp = /^\s+$/;
const startsWIthNewlineRegExp = /^\s*\n/;
const paragraphTagNameRegExp = /^(p(re)?|div)$/;
const charsToScreenRegExp = /([\\"])/g;
const classes = {
   wrap: 'LinkDecorator__wrap',
   link: 'LinkDecorator__linkWrap',
   image: 'LinkDecorator__image'
};
const fakeNeedDecorateAttribute = '__needDecorate';

const protocolNames = [
    'http:(?://|\\\\\\\\)',
    'https:(?://|\\\\\\\\)',
    'ftp:(?://|\\\\\\\\)',
    'file:(?://|\\\\\\\\)',
    'smb:(?://|\\\\\\\\)',
];
const correctTopLevelDomainNames = [
    'ru',
    'com',
    'edu',
    'org',
    'net',
    'int',
    'info',
    'рф',
    'рус'
];
const protocolLinkPrefixPattern = `(?:${protocolNames.join('|')})`.replace(/[a-z]/g, (m) => `[${m + m.toUpperCase()}]`);
const simpleLinkPrefixPattern = '([\\w\\-]+(?:\\.[a-zA-Z]+)*\\.([a-zA-Z]+)(?::[0-9]+)?)';
const linkPrefixPattern = `(?:${protocolLinkPrefixPattern}|${simpleLinkPrefixPattern})`;
const linkPattern = `(${linkPrefixPattern}(?:[^\\s()\\uD800-\\uDFFF]*))`;
const emailPattern = '([\\wа-яёА-ЯЁ!#$%&\'*+\\-/=?^`{|}~.]+@[^\\s@()]+\\.([\\wа-яёА-ЯЁ]+))';
const endingPattern = '([^.,:\\s()\\uD800-\\uDFFF])';
const characterRegExp = /[\wа-яёА-ЯЁ]/;
const linkParseRegExp = new RegExp(`(?:(?:${emailPattern}|${linkPattern})${endingPattern})|(.|\\s)`, 'g');

const needDecorateParentNodeSet: Set<Array<any[]|string>> = new Set();
let stringReplacersArray: Array<any[]|string> = [];

function isAttributes(value) {
   return typeof value === 'object' && !Array.isArray(value);
}

function isElementNode(jsonNode) {
   return Array.isArray(jsonNode) && typeof jsonNode[0] === 'string';
}

function isTextNode(jsonNode) {
   return typeof jsonNode === 'string';
}

function getAttributes(jsonNode) {
   let result;
   if (isElementNode(jsonNode) && isAttributes(jsonNode[1])) {
      result = jsonNode[1];
   } else {
      result = {};
   }
   return result;
}

function getTagName(jsonNode) {
   let result;
   if (isElementNode(jsonNode)) {
      result = jsonNode[0];
   } else {
      result = '';
   }
   return result;
}

function getFirstChild(jsonNode) {
   let result;
   if (isElementNode(jsonNode)) {
      if (isAttributes(jsonNode[1])) {
         result = jsonNode[2];
      } else {
         result = jsonNode[1];
      }
   }
   if (!result) {
      result = '';
   }
   return result;
}

function createLinkNode(href: string, text: string = href, isEmail: boolean = false): Array<any> {
    const tagName = 'a';
    const attributes = {
        href: isEmail ? 'mailto:' + href : href
    };
    if (!isEmail) {
        attributes.class = 'asLink';
        attributes.target = '_blank';
        attributes.rel = 'noreferrer noopener';
    }
    return [tagName, attributes, text];
}

function isLinkGoodForDecorating(linkNode) {
   const attributes = getAttributes(linkNode);
   const firstChild = getFirstChild(linkNode);
   const linkHref = attributes.href && attributes.href.toLowerCase();
   const linkText = typeof firstChild === 'string' && firstChild.toLowerCase();

   // Decorate link only with text == href, and href length shouldn't be more than given maximum.
   // And decorate link that starts with "http://" or "https://".
   return !!linkHref && linkHref.length <= getHrefMaxLength() &&
      isTextNode(firstChild) && linkHref === linkText && linkHref.indexOf('http') === 0;
}

/**
 *
 * Модуль с утилитами для работы с декорированной ссылкой.
 *
 * @class Controls/_decorator/Markup/resources/linkDecorateUtils
 * @private
 * @author Кондаков Р.Н.
 */

/**
 * Получает имена классов для декорирования ссылки.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getClasses
 * @returns {Object}
 */

/*
 * Get class names for decorating link.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getClasses
 * @returns {Object}
 */
export function getClasses() {
   return classes;
}

/**
 * Получает имя сервиса декорирования ссылок.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getService
 * @returns {String|undefined}
 */

/*
 * Get name of decorated link service.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getService
 * @returns {String|undefined}
 */
export function getService() {
   return constants.decoratedLinkService;
}

/**
 * Получает максимальную длину ссылки, которую можно задекорировать.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getHrefMaxLength
 * @returns {number}
 */

/*
 * Get name of decorated link service.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getHrefMaxLength
 * @returns {number}
 */
export function getHrefMaxLength() {
   // TODO: In this moment links with length 1500 or more are not being decorated.
   // Have to take this constant from the correct source. Problem link:
   // https://online.sbis.ru/opendoc.html?guid=ff5532f0-d4aa-4907-9f2e-f34394a511e9
   return hrefMaxLength;
}

/**
 * Проверяет, является ли json-нода с данным именем тега и нодой первого ребёнка декорированной ссылкой.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#isDecoratedLink
 * @param tagName {string}
 * @param firstChildNode {JsonML}
 * @returns {boolean}
 */

/*
 * Check if json node with given tag name and the first child node is a decorated link
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#isDecoratedLink
 * @param tagName {string}
 * @param firstChildNode {JsonML}
 * @returns {boolean}
 */
export function isDecoratedLink(tagName, firstChildNode) {
   let result;
   if (tagName === 'span') {
      const firstChildTagName = getTagName(firstChildNode);
      const firstChildAttributes = getAttributes(firstChildNode);

      result = firstChildTagName === 'a' && !!firstChildAttributes.href && !!firstChildAttributes.class &&
         firstChildAttributes.class.split(' ').indexOf(getClasses().link) !== -1;
   } else {
      result = false;
   }
   return result;
}

/**
 * Превращает декорированную ссылку в обычную. Вызывается после функции "isDecoratedLink", linkNode здесь - это firstChildNode там.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getUndecoratedLink
 * @param linkNode {jsonML}
 * @returns {jsonML}
 */

/*
 * Undecorate decorated link. Calls after "isDecoratedLink" function, link node here is the first child there.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getUndecoratedLink
 * @param linkNode {jsonML}
 * @returns {jsonML}
 */
export function getUndecoratedLink(linkNode) {
   const linkAttributes = getAttributes(linkNode);
   const newLinkAttributes = objectMerge({}, linkAttributes, { clone: true });

   // Save all link attributes, replace only special class name on usual.
   newLinkAttributes.class = linkAttributes.class.replace(getClasses().link, 'asLink');
   return ['a', newLinkAttributes, newLinkAttributes.href];
}

/**
 * Проверяет, является ли json-нода ссылкой, которая должна быть задекорирована.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#needDecorate
 * @param jsonNode {jsonML}
 * @param parentNode {jsonML}
 * @returns {boolean}
 */

/*
 * Check if json node is a link, that should be decorated.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#needDecorate
 * @param jsonNode {jsonML}
 * @param parentNode {jsonML}
 * @returns {boolean}
 */
export function needDecorate(jsonNode, parentNode) {
   // Can't decorate without decoratedLink service address.
   if (!getService()) {
      return false;
   }

   // Decorate link right inside paragraph.
   if (!paragraphTagNameRegExp.test(getTagName(parentNode))) {
      if (isTextNode(jsonNode)) {
          stringReplacersArray.unshift(wrapLinksInString(jsonNode, parentNode));
          return true;
      }
      return false;
   }

    // такая проверка, потому что первым ребёнком может оказаться строка, и проверка на === может ошибиться.
    const isFirstChild = !needDecorateParentNodeSet.has(parentNode);
    needDecorateParentNodeSet.add(parentNode);

   if (isFirstChild) {
      // Check all links in parentNode from the end to current, set attribute '__needDecorate' for all of them.
      // Set it true if two conditions are met:
      // 1. Link is good for decorating.
      // 2. Between link and the end of paragraph there are only spaces and other good for decorating links.
      let canBeDecorated = true;
      const firstChildIndex = isAttributes(parentNode[1]) ? 2 : 1;
      const localStringReplacersArray: Array<any[] | string> = [];
      for (let i = parentNode.length - 1; i >= firstChildIndex; --i) {
         const nodeToCheck = parentNode[i];
         if (isTextNode(nodeToCheck)) {
            let stringReplacer: any[] | string = wrapLinksInString(nodeToCheck, parentNode);
            localStringReplacersArray.unshift(stringReplacer);
            if (Array.isArray(stringReplacer) && canBeDecorated) {
               for (let j = stringReplacer.length - 1; j > 0; --j) {
                  let subNode = stringReplacer[j];
                  if (isTextNode(subNode)) {
                     canBeDecorated = (canBeDecorated && onlySpacesRegExp.test(subNode)) ||
                        startsWIthNewlineRegExp.test(subNode);
                  } else {
                     canBeDecorated = canBeDecorated && isLinkGoodForDecorating(subNode);
                     if (canBeDecorated) {
                        stringReplacer[j] = getDecoratedLink(subNode);
                     }
                  }
               }
            } else {
               canBeDecorated = (canBeDecorated && onlySpacesRegExp.test(nodeToCheck)) ||
                  startsWIthNewlineRegExp.test(nodeToCheck);
            }
            continue;
         }
         const tagName = getTagName(nodeToCheck);
         if (tagName === 'a') {
            const attributes = getAttributes(nodeToCheck);
            canBeDecorated = canBeDecorated && isLinkGoodForDecorating(nodeToCheck);
            attributes[fakeNeedDecorateAttribute] = canBeDecorated;
         } else {
            // Tag br is the end of paragraph.
            canBeDecorated = tagName === 'br';
         }
      }
      stringReplacersArray = localStringReplacersArray.concat(stringReplacersArray);
   }

   if (isTextNode(jsonNode)) {
      return true;
   }

   const attributes = getAttributes(jsonNode);
   if (attributes.hasOwnProperty(fakeNeedDecorateAttribute)) {
      const result = attributes[fakeNeedDecorateAttribute];
      delete attributes[fakeNeedDecorateAttribute];
      return result;
   }

   return false;
}

/**
 * Получает json-ноду деворированной ссылки. Вызывается после функции "needDecorate".
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getDecoratedLink
 * @param linkNode {JsonML}
 * @returns {JsonML}
 */

/*
 * Get json node of decorated link. Calls after "needDecorate" function.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getDecoratedLink
 * @param linkNode {JsonML}
 * @returns {JsonML}
 */
export function getDecoratedLink(jsonNode): any[]|string {
   if (isTextNode(jsonNode)) {
      return stringReplacersArray.shift();
   }

   const linkAttributes = getAttributes(jsonNode);
   const newLinkAttributes = objectMerge({}, linkAttributes, { clone: true });
   const decoratedLinkClasses = getClasses();

   newLinkAttributes.class = ((newLinkAttributes.class ? newLinkAttributes.class.replace('asLink', '') + ' ' : '') +
      decoratedLinkClasses.link).trim();
   newLinkAttributes.target = '_blank';

   const image = (typeof location === 'object' ? location.protocol + '//' + location.host : '') +
      getService() + '?method=LinkDecorator.DecorateAsSvg&params=' + encodeURIComponent(
         base64.encode('{"SourceLink":"' + newLinkAttributes.href.replace(charsToScreenRegExp, '\\$1') + '"}')
      ) + '&id=0&srv=1';

   return ['span',
      { 'class': decoratedLinkClasses.wrap },
      ['a',
         newLinkAttributes,
         ['img',
            { 'class': decoratedLinkClasses.image, alt: newLinkAttributes.href, src: image }
         ]
      ]
   ];
}

/**
 *
 * @param {string} stringNode
 * @param {any[]} parentNode
 * @return {any[] | string}
 */
export function wrapLinksInString(stringNode: string, parentNode: any[]): any[]|string {
    let result: any[]|string = [];
    let hasAnyLink: boolean = false;
    result.push([]);
    if (getTagName(parentNode) === 'a') {
        // Не нужно оборачивать ссылки внутри тега "a".
        result = stringNode;
    } else {
        let linkParseExec = linkParseRegExp.exec(stringNode);
        while (linkParseExec !== null) {
            let [match, email, emailDomain, link, simpleLinkPrefix, simpleLinkDomain, ending, noLink] = linkParseExec;
            linkParseExec = linkParseRegExp.exec(stringNode);

            let nodeToPush: any[]|string;
            if (link) {
                if (link === simpleLinkPrefix) {
                    simpleLinkDomain += ending;
                }
                const wrongDomain = simpleLinkDomain && correctTopLevelDomainNames.indexOf(simpleLinkDomain) === -1;
                hasAnyLink = hasAnyLink || !wrongDomain;
                link = link + ending;
                nodeToPush = wrongDomain ? match : createLinkNode(
                    (simpleLinkPrefix ? 'http://' : '') + link,
                    link
                );
            } else if(email) {
                const isEndingPartOfEmail = characterRegExp.test(ending);
                if (isEndingPartOfEmail) {
                    emailDomain += ending;
                    email += ending;
                }
                const wrongDomain = correctTopLevelDomainNames.indexOf(emailDomain) === -1;
                hasAnyLink = hasAnyLink || !wrongDomain;
                nodeToPush = wrongDomain ? match : createLinkNode(
                    email,
                    undefined,
                    true
                );
            } else {
                nodeToPush = noLink;
            }
            if (typeof nodeToPush === 'string' && typeof result[result.length - 1] === 'string') {
                result[result.length - 1] += nodeToPush;
            } else {
                result.push(nodeToPush);
            }
        }
    }
    return hasAnyLink ? result : stringNode;
}

export function clearNeedDecorateGlobals() {
    needDecorateParentNodeSet.clear();
    stringReplacersArray = [];
}
