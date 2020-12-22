export const enum SHADOW_VISIBILITY {
   HIDDEN = 'hidden',
   VISIBLE = 'visible',
   AUTO = 'auto'
}

export const enum SHADOW_MODE {
    JS = 'js',
    MIXED = 'mixed',
    CSS = 'css'
}

export interface IShadowsOptions {
    topShadowVisibility: SHADOW_VISIBILITY;
    bottomShadowVisibility: SHADOW_VISIBILITY;
    leftShadowVisibility: SHADOW_VISIBILITY;
    rightShadowVisibility: SHADOW_VISIBILITY;
    shadowMode: SHADOW_MODE;
}

export interface IShadowsVisibilityByInnerComponents {
    top?: SHADOW_VISIBILITY;
    bottom?: SHADOW_VISIBILITY;
    left?: SHADOW_VISIBILITY;
    right?: SHADOW_VISIBILITY;
}

export function getDefaultOptions(): IShadowsOptions {
    return {
        topShadowVisibility: SHADOW_VISIBILITY.AUTO,
        bottomShadowVisibility: SHADOW_VISIBILITY.AUTO,
        leftShadowVisibility: SHADOW_VISIBILITY.AUTO,
        rightShadowVisibility: SHADOW_VISIBILITY.AUTO,
        shadowMode: SHADOW_MODE.MIXED
    };
}

/**
 * Интерфейс для контролов со скролбарами.
 *
 * @interface Controls/_scroll/Container/Interface/IShadows
 * @public
 * @author Миронов А.Ю.
 */

export interface IShadows {
    readonly '[Controls/_scroll/Container/Interface/IShadows]': boolean;
}

/**
 * @typedef {String} shadowVisibility
 * @variant auto Видимость зависит от состояния скролируемой области. Тень отображается только с той стороны
 * в которую можно скролить.
 * контент, то на этой границе отображается тень.
 * @variant visible Тень всегда видима.
 * @variant hidden Тень всегда скрыта.
 */

/**
 * @name Controls/_scroll/Container/Interface/IShadows#topShadowVisibility
 * @cfg {shadowVisibility} Устанавливает режим отображения тени сверху.
 * @default auto
 * @demo Controls-demo/Scroll/Container/TopShadowVisibility/Index
 */

/**
 * @name Controls/_scroll/Container/Interface/IShadows#bottomShadowVisibility
 * @cfg {shadowVisibility} Устанавливает режим отображения тени снизу.
 * @demo Controls-demo/Scroll/Container/BottomShadowVisibility/Index
 */

/**
 * @name Controls/_scroll/Container/Interface/IShadows#shadowMode
 * @cfg {String} Устанавливает режим отображения тени снизу.
 * @variant mixed При построении контрола тени работают полностью через стили как в режиме css.
 * Это позволяет избавиться от лишнего цикла синхронизации при построение скролируемой области.
 * При наведении курсора переключаются в режим js.
 * @variant js Управление тенями осуществляется через js.
 * @variant css Управление тенями работает полностью через css. У этого режима есть ограничения.
 * Тени рисуются под контентом, по этому их могут перекрывать фоны, картинки и прочие элементы расположенные
 * внутри скролируемой области.
 */
