
import * as React from 'react';
import { Tile } from './Tile';
import { Selection } from '../../utilities/selection/Selection';

export const enum TileMode {
  icon,
  rich
}

export interface ITileProps extends React.Props<Tile> {
  selectionIndex?: number;
  mode?: TileMode;
  selection?: Selection;
}
