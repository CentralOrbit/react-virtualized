/** @flow */
import React, {useEffect} from 'react';

import type {RenderedSection} from '../Grid';

/**
 * This HOC decorates a virtualized component and responds to arrow-key events by scrolling one row or column at a time.
 */

type RowCol = {
  row: number,
  col: number,
};

type ChildrenParams = {
  onSectionRendered: (params: RenderedSection) => void,
  target: RowCol,
};

type Props = {
  role?: String,
  onSectionRendered: (params: RenderedSection) => void,
  target: RowCol,
  children: (params: ChildrenParams) => React.Element<*>,
  className?: string,
  columnCount: number,
  disabled: boolean,
  isControlled: boolean,
  mode: 'cells' | 'edges',
  onScrollToChange?: (params: RowCol) => void,
  rowCount: number,
};

type State = {
  currentTarget: RowCol,
  previousTarget: RowCol,
  colIndexes: [number, number],
  rowIndexes: [number, number],
};

const ArrowKeyStepper = (props: Props) => {
  let [state, setState]: [State, Function] = React.useState({
    currentTarget: {
      row: 0,
      col: 0,
    },
    previousTarget: {
      col: 0,
      row: 0,
    },
    colIndexes: [0, 0],
    rowIndexes: [0, 0],
  });
  useEffect(() => {
    if (props.isControlled) {
      return;
    }
    const nextTarget = props.target;
    const currTarget = state.currentTarget;
    if (
      nextTarget.col !== currTarget.col ||
      nextTarget.row !== nextTarget.row
    ) {
      setState({
        ...state,
        currentTarget: nextTarget,
      });
    }
  }, [props]);

  function onKeyDown(event: KeyboardEvent) {
    const {columnCount, disabled, mode, rowCount, onScrollToChange} = props;
    const validKeys = new Set([
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
    ]);
    const validModes = new Set(['cells', 'edges']);
    const key = event.key;
    if (disabled) {
      return;
    }

    if (!validKeys.has(key)) {
      return;
    }

    if (!validModes.has(mode)) {
      return;
    }

    const {row, col} = state.currentTarget;

    const lookup = {
      cells: {
        ArrowDown: () => Math.min(scrollToRow + 1, rowCount - 1),
        ArrowLeft: () => Math.max(scrollToColumn - 1, 0),
        ArrowRight: () => Math.min(scrollToColumn + 1, columnCount - 1),
        ArrowUp: () => Math.max(scrollToRow - 1, 0),
      },
      edges: {
        ArrowDown: () => Math.min(this._rowStopIndex + 1, rowCount - 1),
        ArrowLeft: () => Math.max(this._columnStartIndex - 1, 0),
        ArrowRight: () => Math.min(this._columnStopIndex + 1, columnCount - 1),
        ArrowUp: () => Math.max(this._rowStartIndex - 1, 0),
      },
    };
    let candidateTarget = {};
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      candidateTarget.col = lookup[mode][key];
    }
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      candidateTarget.row = lookup[mode][key];
    }

    if (candidateTarget.row !== row || candidateTarget.col !== col) {
      event.preventDefault();
      const nextTarget = {
        ...state.currentTarget,
        ...candidateTarget,
      };

      if (typeof onScrollToChange === 'function') {
        onScrollToChange(nextTarget);
      }
      setState({
        currentTarget: nextTarget,
        previousTarget: state.currentTarget,
      });
    }
  }

  const {col, row} = state.currentTarget;
  return (
    <div
      role={props.role || 'arrow-stepper'}
      className={props.className}
      onKeyDown={onKeyDown}>
      {props.children({
        onSectionRendered: props.onSectionRendered,
        col,
        row,
      })}
    </div>
  );
};

ArrowKeyStepper.defaultProps = {
  role: 'arrow-stepper',
  disabled: false,
  isControlled: false,
  mode: 'edges',
  target: {
    row: 0,
    col: 0,
  },
};

export default ArrowKeyStepper;
