
import * as React from 'react';
import { ITilesListProps, ITilesHeaderItem, ITilesGridSegment, TilesGridMode, ITileSize } from './TilesList.Props';
import { List, IPageProps } from '../../List';
import { FocusZone, FocusZoneDirection } from '../../FocusZone';
import { SelectionZone, SelectionMode } from '../../utilities/selection/index';
import { autobind, css, IRenderFunction, IRectangle } from '../../Utilities';
import * as TilesListStylesModule from './TilesList.scss';

const TilesListStyles: any = TilesListStylesModule;

export interface ITilesListState<TItem> {
  cells: ITileCell<TItem>[];
}

export interface ITileGrid {
  rowHeight: number;
  mode: TilesGridMode;
  spacing: number;
  marginTop: number;
  marginBottom: number;
  key: string;
}

export interface ITileCell<TItem> {
  key: string;
  content: TItem;
  aspectRatio: number;
  grid: ITileGrid;
  onRender(content: TItem, finalSize: { width: number; height: number; }): React.ReactNode | React.ReactNode[];
}

interface IPageData<TItem> {
  startCells: {
    [index: number]: boolean;
  };
  cellSizes: {
    [index: number]: ITileSize;
  };
  extraCells: ITileCell<TItem>[];
}

export class TilesList<TItem> extends React.Component<ITilesListProps<TItem>, ITilesListState<TItem>> {
  constructor(props: ITilesListProps<TItem>, context: any) {
    super(props, context);

    this.state = {
      cells: this._getCells(props.items)
    };
  }

  public componentWillReceiveProps(nextProps: ITilesListProps<TItem>) {
    if (nextProps.items !== this.props.items) {
      this.setState({
        cells: this._getCells(nextProps.items)
      });
    }
  }

  public render() {
    const {
      selection
    } = this.props;

    const {
      cells
    } = this.state;

    const list = (
      <List
        items={ cells }
        getCellClassName={ this._onGetCellClassName }
        getCellStyle={ this._onGetCellStyle }
        getPage={ this._getPage }
        getPageClassName={ this._onGetPageClassName }
        onRenderPage={ this._onRenderPage }
      />
    );

    return (
      <FocusZone
        direction={ FocusZoneDirection.bidirectional }
      >
        {
          selection ?
            <SelectionZone
              selection={ selection }
              selectionMode={ SelectionMode.multiple }>
              { list }
            </SelectionZone> :
            { list }
        }
      </FocusZone>
    );
  }

  private _onRenderCell(item: ITileCell<TItem>, finalSize: ITileSize) {
    if (item.grid.mode === TilesGridMode.none) {
      return (
        <div className={ css(TilesListStyles.header) }
        >
          { item.onRender(item.content, { width: 0, height: 0 }) }
        </div>
      );
    }

    const itemWidthOverHeight = item.aspectRatio;
    const itemHeightOverWidth = 1 / itemWidthOverHeight;

    return (
      <div
        role='presentation'
        className={ css(TilesListStyles.cell) }
        style={
          {
            paddingTop: `${(100 * itemHeightOverWidth).toFixed(2)}%`
          }
        }
      >
        <div
          role='presentation'
          className={ css(TilesListStyles.cellContent) }
        >
          { item.onRender(item.content, finalSize) }
        </div>
      </div>
    );
  }

  @autobind
  private _onRenderPage(pageProps: IPageProps, defaultRender?: IRenderFunction<IPageProps>) {
    const {
      page,
      ...divProps
    } = pageProps;

    const {
      items
    } = page;

    const data: IPageData<TItem> = page.data;

    const cells: ITileCell<TItem>[] = items || [];

    let grids: React.ReactNode[] = [];

    const previousCell = this.state.cells[page.startIndex - 1];
    const nextCell = this.state.cells[page.startIndex + page.itemCount];

    const endIndex = cells.length;

    for (let i = 0; i < endIndex;) {
      const grid = cells[i].grid;

      const renderedCells: React.ReactNode[] = [];

      for (; i < endIndex && cells[i].grid === grid; i++) {
        const cell = cells[i];

        renderedCells.push(
          <div
            key={ `${grid.key}-item-${cell.key}` }
            data-item-index={ page.startIndex + i }
            className={ css('ms-List-cell', this._onGetCellClassName(), {
              [`ms-TilesList-cell--firstInRow ${TilesListStyles.cellFirstInRow}`]: data.startCells[page.startIndex + i]
            }) }
            style={
              {
                ...this._onGetCellStyle(cell)
              }
            }
          >
            { this._onRenderCell(cell, data.cellSizes[page.startIndex + i]) }
          </div>
        );
      }

      const isOpenStart = previousCell && previousCell.grid === grid;
      const isOpenEnd = nextCell && nextCell.grid === grid;

      const margin = grid.spacing / 2;

      grids.push(
        <div
          key={ grid.key }
          className={ css('ms-TilesList-grid', {
            [`${TilesListStyles.grid}`]: grid.mode !== TilesGridMode.none
          }) }
          style={
            {
              margin: `${-margin}px`,
              marginTop: isOpenStart ? '0' : `${grid.marginTop - margin}px`,
              marginBottom: isOpenEnd ? '0' : `${grid.marginBottom - margin}px`
            }
          }>
          { ...renderedCells }
        </div>
      );
    }

    return (
      <div
        { ...divProps }
      >
        { ...grids }
      </div>
    );
  }

  @autobind
  private _getPage(startIndex: number, bounds: IRectangle): {
    itemCount: number;
    data: IPageData<TItem>;
  } {
    const {
      cells
    } = this.state;

    const endIndex = Math.min(cells.length, startIndex + 100);

    let rowWidth = 0;
    let rowStart: number;
    let fillPercent: number;
    let i = startIndex;

    let isAtGridEnd = true;

    let startCells: IPageData<TItem>['startCells'] = {};
    let extraCells: IPageData<TItem>['extraCells'];
    let cellSizes: IPageData<TItem>['cellSizes'] = {};

    for (; i < endIndex;) {
      const grid = cells[i].grid;

      rowWidth = 0;
      rowStart = i;

      const boundsWidth = bounds.width + grid.spacing;

      if (grid.mode === TilesGridMode.none) {
        isAtGridEnd = true;
        fillPercent = 1;
        i++;
        continue;
      }

      startCells[i] = true;

      for (; i < endIndex && cells[i].grid === grid; i++) {
        const cell = cells[i];

        const width = cell.aspectRatio * grid.rowHeight + grid.spacing;
        rowWidth += width;
        fillPercent = rowWidth / boundsWidth;

        cellSizes[i] = {
          width: width,
          height: grid.rowHeight
        };

        if (rowWidth > boundsWidth) {
          rowWidth = width;
          fillPercent = rowWidth / boundsWidth;
          rowStart = i;
          startCells[i] = true;
        }
      }

      if (cells[i] && cells[i].grid === grid) {
        isAtGridEnd = false;
      }

      if (fillPercent > 0 && fillPercent < 0.9 && !isAtGridEnd) {
        extraCells = cells.slice(rowStart, i);
      }
    }

    let itemCount = fillPercent > 0 && fillPercent < 0.9 && !isAtGridEnd ?
      rowStart - startIndex :
      i - startIndex;

    return {
      itemCount: itemCount,
      data: {
        startCells: startCells,
        extraCells: extraCells,
        cellSizes: cellSizes
      }
    };
  }

  @autobind
  private _onGetCellClassName(): string {
    return TilesListStyles.listCell;
  }

  @autobind
  private _onGetPageClassName(): string {
    return TilesListStyles.listPage;
  }

  @autobind
  private _onGetCellStyle(item: ITileCell<TItem>): any {
    if (item.grid.mode === TilesGridMode.none) {
      return {};
    }

    const itemWidthOverHeight = item.aspectRatio || 1;
    const itemHeightOverWidth = 1 / itemWidthOverHeight;
    const margin = item.grid.spacing / 2;

    const isFill = item.grid.mode === TilesGridMode.fill;

    const height = item.grid.rowHeight;
    const width = itemWidthOverHeight * height;

    return {
      flex: isFill ? `${itemWidthOverHeight} ${itemWidthOverHeight} ${width}px` : `0 0 ${width}px`,
      maxWidth: isFill ? `${width * 1.5}px` : `${width}px`,
      margin: `${margin}px`
    };
  }

  private _getCells(items: (ITilesGridSegment<TItem> | ITilesHeaderItem<TItem>)[]): ITileCell<TItem>[] {
    const cells: ITileCell<TItem>[] = [];

    let index = 0;

    for (const item of items) {
      if (isGridSegment(item)) {
        const {
          spacing = 0,
          marginBottom = 0,
          marginTop = 0
        } = item;

        const grid: ITileGrid = {
          rowHeight: item.rowHeight,
          spacing: spacing,
          mode: item.mode,
          key: `grid-${item.key}`,
          marginTop: marginTop,
          marginBottom: marginBottom
        };

        for (const gridItem of item.items) {
          cells.push({
            aspectRatio: gridItem.desiredSize.width / gridItem.desiredSize.height,
            content: gridItem.content,
            onRender: gridItem.onRender,
            grid: grid,
            key: gridItem.key
          });
        }
      } else {
        cells.push({
          aspectRatio: 1,
          content: item.content,
          onRender: item.onRender,
          grid: {
            rowHeight: 0,
            spacing: 0,
            mode: TilesGridMode.none,
            key: `header-${item.key}`,
            marginBottom: 0,
            marginTop: 0
          },
          key: `header-${item.key}`
        });
      }
    }

    return cells;
  }
}

function isGridSegment<TItem>(item: ITilesGridSegment<TItem> | ITilesHeaderItem<TItem>): item is ITilesGridSegment<TItem> {
  return !!(item as ITilesGridSegment<TItem>).items;
}
