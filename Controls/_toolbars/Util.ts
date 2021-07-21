import {IControlOptions, TemplateFunction} from 'UI/Base';
import {ButtonTemplate, IButtonOptions, defaultHeight, defaultFontColorStyle, getDefaultOptions} from 'Controls/buttons';
import {Abstract as ChainAbstract, factory} from 'Types/chain';
import {ICrudPlus} from "Types/source";
import {Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {CrudWrapper} from 'Controls/dataSource';
import {showType} from './interfaces/IShowType';
import {getIcon, isSVGIcon} from 'Controls/Utils/Icon';

type TItem = Record;
type TItems = RecordSet<TItem>;

export function getButtonTemplate(): TemplateFunction {
    return ButtonTemplate;
}

export function loadItems(source: ICrudPlus): Promise<TItems> {
    const crudWrapper = new CrudWrapper({source});
    return crudWrapper.query({});
}

export function hasSourceChanged(newSource?: ICrudPlus, oldSource?: ICrudPlus): boolean {
    const currentSource = oldSource;
    return newSource && currentSource !== newSource;
}

export function getSimpleButtonTemplateOptionsByItem(item: TItem, toolbarOptions: IControlOptions = {}): IButtonOptions {
    const cfg: IButtonOptions = {};
    const defaultOptions = getDefaultOptions();
    const icon = getIcon(item.get('icon'));
    const isSVG = isSVGIcon(item.get('icon'));
    const readOnly = item.get('readOnly') || toolbarOptions.readOnly;
    const buttonStyle = item.get('buttonStyle') || defaultOptions.buttonStyle;
    const isVerticalDirection = toolbarOptions.direction === 'vertical';
    const iconStyle = isVerticalDirection ? 'm' :
        (item.get('iconStyle') || toolbarOptions.iconStyle || defaultOptions.iconStyle);

    let viewMode = item.get('viewMode');
    let caption = '';
    if (viewMode && viewMode !== 'toolButton') {
        caption = item.get('caption');
    } else if (item.get('title') && !viewMode) {
        viewMode = 'link';
        caption = item.get('title');
    }

    // todo: https://online.sbis.ru/opendoc.html?guid=244a5058-47c1-4896-a494-318ba2422497
    const inlineHeight = isVerticalDirection ? 'l' :
        (item.get('inlineHeight') || (viewMode === 'functionalButton' ? 'default' : defaultHeight(viewMode)));
    const iconSize = item.get('iconSize') || (viewMode === 'functionalButton' ? 's' : toolbarOptions.iconSize || 'm');

    cfg._hoverIcon = true;
    cfg._buttonStyle = readOnly ? 'readonly' : buttonStyle;
    cfg._contrastBackground = item.get('contrastBackground');
    cfg._viewMode = viewMode;
    cfg._height = inlineHeight;
    cfg._fontColorStyle = item.get('fontColorStyle') || toolbarOptions.fontColorStyle || defaultFontColorStyle(viewMode);
    cfg._fontSize = item.get('fontSize') || defaultOptions.fontSize;
    cfg._hasIcon = !!icon;
    cfg._caption = caption;
    cfg._stringCaption = typeof caption === 'string';
    cfg._captionPosition = item.get('captionPosition') || defaultOptions.captionPosition;
    cfg._icon = icon;
    cfg._isSVGIcon = isSVG;
    cfg._iconSize = iconSize;
    cfg._iconStyle = readOnly ? 'readonly' : iconStyle;
    cfg.readOnly = readOnly;

    return cfg;
}

export function getTemplateByItem(item: TItem, options): TemplateFunction {
    const selfItemTemplate: TemplateFunction = item.get(options.itemTemplateProperty);

    if (selfItemTemplate) {
        return selfItemTemplate;
    }

    return options.itemTemplate;
}

export function getMenuItems<T extends Record>(items: RecordSet<T> | T[]): ChainAbstract<T> {
   return factory(items).filter((item) => {
      return item.get('showType') !== showType.TOOLBAR;
   });
}

export function needShowMenu(items: RecordSet): boolean {
    const enumerator = items.getEnumerator();
    while (enumerator.moveNext()) {
        if (enumerator.getCurrent().get('showType') !== showType.TOOLBAR) {
            return true;
        }
    }

    return false;
}
