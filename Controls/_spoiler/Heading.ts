import {Logger} from 'UI/Utils';
import {isEqual} from 'Types/object';
import {descriptor} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IExpandable, IExpandableOptions, IFontSize, IFontSizeOptions} from 'Controls/interface';

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_spoiler/Heading/Heading';

type TCaptions = string | string[];
type TView = 'expanded' | 'collapsed';
type TIcon = 'ExpandLight' | 'CollapseLight';

/**
 * Интерфейс опций контрола {@link Controls/spoiler:Heading}.
 * @interface Controls/_spoiler/IHeadingOptions
 * @public
 * @author Красильников А.С.
 */
export interface IHeadingOptions extends IControlOptions, IExpandableOptions, IFontSizeOptions {
    /**
     * Заголовок.
     * @type string | string[]
     * @default
     * @remark
     * Изменяемый заголовок в зависимости от {@link Controls/_spoiler/Heading#expanded состояния развернутости}
     * настраивается через массив с парой заголовков.
     * Первый элемент соответствует expanded = true.
     * Второй элемент соответствует expanded = false.
     * Для изменения пары заголовков нужно передать новый массив.
     * @demo Controls-demo/Spoiler/Heading/Captions/Index
     */
    captions: TCaptions;
    /**
     * Позиция заголовка относительно контейнера.
     * @default right
     * @demo Controls-demo/Spoiler/Heading/CaptionPosition/Index
     */
    captionPosition: 'left' | 'right';
}

export interface IHeading extends IExpandable, IFontSize {
    readonly '[Controls/_spoiler/IHeading]': boolean;
}

/**
 * Графический контрол, отображаемый в виде загловка с состоянием развернутости.
 * Предоставляет пользователю возможность запуска события смены состояния развернутости при нажатии на него.
 * @remark
 * <a href="http://axure.tensor.ru/StandardsV8/%D1%81%D0%BF%D0%BE%D0%B9%D0%BB%D0%B5%D1%80%D1%8B_%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D0%B0_%D1%81%D0%BF%D0%BE%D0%B9%D0%BB%D0%B5%D1%80%D0%BE%D0%B2.html">Стандарт</a>.
 *
 * @class Controls/_spoiler/Heading
 * @extends UI/Base:Control
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:IExpandable
 * @mixes Controls/spoiler:IHeadingOptions
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Spoiler/Heading/Index
 */
class Heading extends Control<IHeadingOptions> implements IHeading {
    private _icon: TIcon;
    private _view: TView;
    private _caption: string;

    protected _template: TemplateFunction = template;

    readonly '[Controls/_spoiler/IHeading]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_toggle/interface/IExpandable]': boolean = true;

    private _needChangeCaption(options: IHeadingOptions): boolean {
        const {captions, expanded} = options;
        const {captions: oldCaptions} = this._options;

        if (captions instanceof Array && oldCaptions instanceof Array) {
            return !isEqual(captions, oldCaptions) || this._needChangeStateByExpanded(expanded);
        } else {
            return captions !== oldCaptions;
        }
    }

    private _needChangeStateByExpanded(expanded: boolean): boolean {
        return expanded !== this._options.expanded;
    }

    protected _beforeMount(options?: IHeadingOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._caption = Heading._calcCaption(options);
        this._icon = Heading._calcIcon(options.expanded);
        this._view = Heading._calcView(options.expanded);
        return super._beforeMount(options, contexts, receivedState);
    }

    protected _beforeUpdate(options?: IHeadingOptions, contexts?: any): void {
        if (this._needChangeCaption(options)) {
            this._caption = Heading._calcCaption(options);
        }
        if (this._needChangeStateByExpanded(options.expanded)) {
            this._icon = Heading._calcIcon(options.expanded);
            this._view = Heading._calcView(options.expanded);
        }
        super._beforeUpdate(options, contexts);
    }

    protected _clickHandler(event: SyntheticEvent<MouseEvent>): void {
        this._notify('expandedChanged', [!this._options.expanded]);
    }

    static _theme: string[] = ['Controls/spoiler', 'Controls/Classes'];

    private static _captionToString(caption?: string): string {
        if (typeof caption === 'string') {
            return  caption;
        }

        return '';
    }

    private static _calcCaption({captions, expanded}: IHeadingOptions): string {
        if (captions instanceof Array) {
            const requiredCountCaptions: number = 2;

            if (captions.length !== requiredCountCaptions) {
                Logger.error('Неверное количество заголовков.');
            }
            const caption: string | undefined = expanded ? captions[0] : captions[1];
            return Heading._captionToString(caption);
        } else {
            return captions;
        }
    }

    private static _calcView(expanded: boolean): TView {
        return expanded ? 'expanded' : 'collapsed';
    }

    private static _calcIcon(expanded: boolean): TIcon {
        return expanded ? 'CollapseLight' : 'ExpandLight';
    }

    static getDefaultOptions(): Partial<IHeadingOptions> {
        return {
            captions: '',
            fontSize: 'm',
            expanded: true,
            captionPosition: 'right'
        };
    }

    static getOptionTypes(): Partial<IHeadingOptions> {
        return {
            fontSize: descriptor(String),
            expanded: descriptor(Boolean),
            captions: descriptor(String, Array),
            captionPosition: descriptor(String).oneOf(['left', 'right'])
        };
    }
}

export default Heading;
