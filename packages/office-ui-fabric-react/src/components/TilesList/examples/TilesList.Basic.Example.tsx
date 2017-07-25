
import * as React from 'react';
import {
  TilesList,
  ITilesGridSegment,
  ITilesHeaderItem,
  ITilesGridItem,
  TilesGridMode,
  ITileSize
} from '../../TilesList';
import { Tile, TileMode } from '../../Tile';
import { Selection } from '../../../utilities/selection/Selection';
import { MarqueeSelection } from '../../../MarqueeSelection';
import { autobind } from '../../../Utilities';

type IAspectRatioByProbability = { [probability: string]: number; };

const PROBABILITIES: IAspectRatioByProbability = {
  '0.95': 3,
  '0.90': 1 / 3,
  '0.80': 16 / 9,
  '0.70': 9 / 16,
  '0.40': 4 / 3,
  '0.10': 3 / 4,
  '0.00': 1
};

type ExampleItem = {
  key: string;
  aspectRatio: number;
};

const ENTRIES = Object.keys(PROBABILITIES).map((key: keyof IAspectRatioByProbability) => ({
  probability: Number(key),
  aspectRatio: PROBABILITIES[key]
}));

function createItems(count: number, isFill: boolean = false): ExampleItem[] {
  return (Array.apply(null, { length: count }) as undefined[]).map((value: undefined, index: number) => {
    const seed = isFill ? Math.random() : 0;

    return {
      key: `item-${index}`,
      aspectRatio: ENTRIES.filter((entry: { probability: number; aspectRatio: number; }) => seed >= entry.probability)[0].aspectRatio
    };
  });
}

const GROUPS = (Array.apply(null, { length: 8 }) as undefined[]).map((value: undefined, index: number) => {
  const isFill = Math.random() >= 0.5;

  return {
    items: createItems(50 + Math.ceil(Math.random() * 6) * 50, isFill),
    mode: isFill ? TilesGridMode.fill : TilesGridMode.stack,
    spacing: 4 + Math.ceil(Math.random() * 8),
    marginBottom: 20,
    key: `group-${index}`
  };
});

const ITEMS = [].concat(...GROUPS.map((group: { items: ExampleItem[]; }) => group.items));

declare class TilesListClass extends TilesList<ExampleItem> { }

const TilesListType: typeof TilesListClass = TilesList;

export class TilesListBasicExample extends React.Component<any, any> {
  private _selection: Selection;

  constructor() {
    super();

    this._selection = new Selection({
      getKey: (item: ExampleItem) => item.key,
    });

    this._selection.setItems(ITEMS);
  }
  public render() {
    const items: (ITilesGridSegment<ExampleItem> | ITilesHeaderItem<ExampleItem>)[] = [];

    for (const group of GROUPS) {
      items.push({
        key: `header-${group.key}`,
        content: {
          key: '',
          aspectRatio: 1
        },
        onRender: this._onRenderHeader
      });

      items.push({
        items: group.items.map((item: ExampleItem): ITilesGridItem<ExampleItem> => {
          return {
            key: item.key,
            content: item,
            desiredSize: {
              width: 100 * item.aspectRatio,
              height: 100
            },
            onRender: group.mode === TilesGridMode.fill ? this._onRenderFillCell : this._onRenderStackCell
          };
        }),
        spacing: group.spacing,
        marginBottom: group.marginBottom,
        rowHeight: 100,
        mode: group.mode,
        key: group.key
      });
    }

    return (
      <div style={ { padding: '4px' } }>
        <MarqueeSelection selection={ this._selection }>
          <TilesListType
            selection={ this._selection }
            items={ items }
          />
        </MarqueeSelection>
      </div>
    );
  }

  @autobind
  private _onRenderStackCell(item: ExampleItem) {
    return (
      <Tile
        selection={ this._selection }
        selectionIndex={ ITEMS.indexOf(item) }
        mode={ TileMode.icon }
      >
        <div style={
          {
            display: 'flex',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            alignItems: 'center'
          }
        }>
          <img
            src={
              `https://static2.sharepointonline.com/files/fabric/assets/brand-icons/document/svg/docx_48x1.svg`
            }
            style={
              {
                width: '48px',
                height: '48px',
                margin: 'auto',
                alignSelf: 'center',
                boxShadow: '0 1px 1px 1px rgba(1, 1, 1, 0.3)',
                backgroundColor: '#fff'
              }
            }
          />
        </div>
      </Tile>
    );
  }

  @autobind
  private _onRenderFillCell(item: ExampleItem, finalSize: ITileSize) {
    return (
      <Tile
        selection={ this._selection }
        selectionIndex={ ITEMS.indexOf(item) }
        mode={ TileMode.rich }
      >
        <img src={
          `//placehold.it/${Math.round(finalSize.width)}x${Math.round(finalSize.height)}`
        } />
      </Tile>
    );
  }

  @autobind
  private _onRenderHeader(item: ExampleItem) {
    return (
      <div>
        <h3>Header</h3>
      </div>
    );
  }
}
