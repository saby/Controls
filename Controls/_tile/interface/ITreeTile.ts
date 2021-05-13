/**
 * Интерфейс для списков, в которых элементы отображаются в виде {@link /doc/platform/developmentapl/interface-development/controls/list/tile/ плитки} с иерархией.
 *
 * @interface Controls/_tile/interface/ITreeTile
 * @public
 * @author Панихин К.А.
 */

/**
 * @name Controls/_tile/interface/ITreeTile#nodesHeight
 * @cfg {Number} Высота узлов, отображаемых в виде плитки.
 * @default 150
 * @remark Эта опция необходима для расчета размеров элементов при отрисовке на сервере.
 * Если установить высоту с помощью css, компонент не будет отображен корректно.
 * @example
 * В следующем примере показано, как установить высоту элементов - 200 пикселей.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.tile:View
 *    nodesHeight="{{200}}"
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    nodeProperty="Раздел@"/>
 * </pre>
 */

/*
 * @name Controls/_tile/interface/ITreeTile#nodesHeight
 * @cfg {Number} The height of the tile nodes items.
 * @default 150
 * @remark This option is required to calculate element sizes when rendering on the server.
 * If you set the height using css, the component cannot be displayed immediately in the correct state.
 * @example
 * The following example shows how to set the height of nodes to 200 pixels.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.tile:View
 *    nodesHeight="{{200}}"
 *    source="{{_viewSource}}"
 *    keyProperty="id"
 *    parentProperty="Раздел"
 *    nodeProperty="Раздел@"/>
 * </pre>
 */

/**
 * @name Controls/_tile/interface/ITreeTile#folderWidth
 * @cfg {Number} Ширина папки. Значение задаётся в px.
 * @see itemWidth
 * @see staticHeight
 */