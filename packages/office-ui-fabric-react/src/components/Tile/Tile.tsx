
import * as React from 'react';
import { ITileProps, TileMode } from './Tile.Props';
import { Check } from '../../Check';
import { SELECTION_CHANGE } from '../../utilities/selection/interfaces';
import { css, BaseComponent, autobind } from '../../Utilities';
import * as TileStylesModule from './Tile.scss';

const TileStyles: any = TileStylesModule;

export interface ITileState {
  isSelected?: boolean;
}

/**
 * A tile provides a frame for a potentially-selectable item which displays its contents prominently.
 *
 * @export
 * @class Tile
 * @extends {React.Component<ITileProps, ITileState>}
 */
export class Tile extends BaseComponent<ITileProps, ITileState> {
  constructor(props: ITileProps, context: any) {
    super(props, context);

    const {
      selectionIndex,
      selection
    } = props;

    const isSelected = !!selection && selectionIndex > 1 && selection.isIndexSelected(selectionIndex);

    this.state = {
      isSelected: isSelected
    };
  }

  public componentWillReceiveProps(nextProps: ITileProps) {
    const {
      selection,
      selectionIndex
    } = this.props;

    const {
      selection: nextSelection,
      selectionIndex: nextSelectionIndex
    } = nextProps;

    if (selection !== nextSelection || selectionIndex !== nextSelectionIndex) {
      const isSelected = !!nextSelection && nextSelectionIndex > 1 && nextSelection.isIndexSelected(nextSelectionIndex);

      this.setState({
        isSelected: isSelected
      });
    }
  }

  public componentDidMount() {
    const {
      selection
    } = this.props;

    if (selection) {
      this._events.on(selection, SELECTION_CHANGE, this._onSelectionChange);
    }
  }

  public componentDidUpdate(previousProps: ITileProps) {
    const {
      selection
    } = this.props;

    const {
      selection: previousSelection
    } = previousProps;

    if (selection !== previousSelection) {
      if (previousSelection) {
        this._events.off(previousSelection);
      }

      if (selection) {
        this._events.on(selection, SELECTION_CHANGE, this._onSelectionChange);
      }
    }
  }

  public render() {
    const {
      children,
      selectionIndex = -1,
      mode = TileMode.icon
    } = this.props;

    const {
      isSelected = false
    } = this.state;

    return (
      <div className={ css('ms-Tile', TileStyles.tile, {
        [TileStyles.richContent]: mode === TileMode.rich,
        [TileStyles.iconContent]: mode === TileMode.icon,
        [TileStyles.selected]: isSelected
      }) }
        data-is-focusable={ true }
        data-is-sub-focuszone={ true }
        data-selection-index={ (selectionIndex > -1) ? selectionIndex : undefined }>
        <div className={ css('ms-Tile-content') }>
          { children }
        </div>
        <button className={ css('ms-Tile-check', TileStyles.check) }
          data-selection-toggle={ true }
          role='checkbox'>
          <Check
            checked={ isSelected }
          />
        </button>
      </div>
    );
  }

  @autobind
  private _onSelectionChange() {
    const {
      selection,
      selectionIndex
    } = this.props;

    this.setState({
      isSelected: selectionIndex > -1 && selection.isIndexSelected(selectionIndex)
    });
  }
}
