import React from 'react';
import {render, fireEvent, act} from '../test-utils';

import ArrowKeyStepper from './ArrowKeyStepper';

describe('ArrowKeyStepper', () => {
  function expectedText(scrollToColumn, scrollToRow) {
    return `scrollToColumn:${scrollToColumn}, scrollToRow:${scrollToRow}`;
  }

  function renderHelper(props = {}, reRenderFn) {
    let callbackHack;

    const markup = (
      <ArrowKeyStepper columnCount={10} mode="edges" rowCount={10} {...props}>
        {({hackStateAndGiveCancer, col, row}) => {
          callbackHack = hackStateAndGiveCancer;
          return expectedText(col, row);
        }}
      </ArrowKeyStepper>
    );

    if (reRenderFn) {
      reRenderFn(markup);
      return;
    }

    const {getByRole, rerender} = render(markup);

    return {
      node: getByRole('arrow-stepper'),
      rerender,
      hackStateAndGiveCancer: (taintedState) => {
        act(() => {
          callbackHack(taintedState);
        });
      },
    };
  }

  const assertCurrentScrollTo = (node, c, r) =>
    expect(node).toHaveTextContent(expectedText(c, r));
  const up = () => fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
  const down = () =>
    fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
  const left = () =>
    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
  const right = () =>
    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});

  it('should use a custom :className if one is specified', async () => {
    const {node} = renderHelper({className: 'foo'});
    expect(node.className).toEqual('foo');
  });
  it('should update :scrollToColumn and :scrollToRow in response to arrow keys', () => {
    const {node} = renderHelper();
    expect(node).toHaveTextContent(expectedText(0, 0));
    node.focus();
    down();
    expect(node).toHaveTextContent(expectedText(0, 1));
    right();
    expect(node).toHaveTextContent(expectedText(1, 1));
    up();
    expect(node).toHaveTextContent(expectedText(1, 0));
    left();
    expect(node).toHaveTextContent(expectedText(0, 0));
  });

  it('should not scroll past the row and column boundaries provided', () => {
    const {node} = renderHelper({
      columnCount: 2,
      rowCount: 2,
    });
    assertCurrentScrollTo(node, 0, 0);
    node.focus();
    down();
    down();
    down();
    assertCurrentScrollTo(node, 0, 1);
    up();
    up();
    up();
    assertCurrentScrollTo(node, 0, 0);
    right();
    right();
    right();
    assertCurrentScrollTo(node, 1, 0);
    left();
    left();
    left();
    assertCurrentScrollTo(node, 0, 0);
  });

  it('should accept initial :scrollToColumn and :scrollToRow values via props', () => {
    const {node} = renderHelper({
      mode: 'cells',
      target: {
        col: 2,
        row: 4,
      },
    });
    assertCurrentScrollTo(node, 2, 4);
    node.focus();
    down();
    assertCurrentScrollTo(node, 2, 5);
    right();
    assertCurrentScrollTo(node, 3, 5);
  });

  it('should accept updated :scrollToColumn and :scrollToRow values via props', () => {
    const {node, rerender} = renderHelper({
      mode: 'cells',
      target: {
        col: 2,
        row: 4,
      },
    });
    assertCurrentScrollTo(node, 2, 4);
    node.focus();
    down();
    assertCurrentScrollTo(node, 2, 5);
    renderHelper(
      {
        mode: 'cells',
        scrollToColumn: 1,
        scrollToRow: 1,
        target: {
          col: 1,
          row: 1,
        },
      },
      rerender,
    );
    right();
    assertCurrentScrollTo(node, 2, 1);
    down();
    assertCurrentScrollTo(node, 2, 2);
  });

  it('should accept updated :scrollToColumn and :scrollToRow values via setScrollIndexes()', () => {
    const {node, rerender} = renderHelper({
      mode: 'cells',
      target: {
        col: 2,
        row: 4,
      },
    });
    node.focus();
    down();
    assertCurrentScrollTo(node, 2, 5);
    renderHelper(
      {
        mode: 'cells',
        target: {
          col: 1,
          row: 1,
        },
      },
      rerender,
    );
    right();
    assertCurrentScrollTo(node, 2, 1);
    down();
    assertCurrentScrollTo(node, 2, 2);
  });

  it('should not update :scrollToColumn or :scrollToRow when :disabled', () => {
    const {node} = renderHelper({
      disabled: true,
    });
    assertCurrentScrollTo(node, 0, 0);
    node.focus();
    down();
    assertCurrentScrollTo(node, 0, 0);
    right();
    assertCurrentScrollTo(node, 0, 0);
  });

  it('should call :onScrollToChange for key down', () => {
    let reRenderFn, nodeTarget;
    [true, false].forEach(() => {
      const onScrollToChange = jest.fn();

      if (reRenderFn) {
        renderHelper(
          {
            isControlled: true,
            onScrollToChange,
          },
          reRenderFn,
        );
      } else {
        const {node, rerender} = renderHelper(
          {
            isControlled: true,
            onScrollToChange,
          },
          reRenderFn,
        );
        reRenderFn = rerender;
        nodeTarget = node;
      }

      nodeTarget.focus();

      expect(onScrollToChange.mock.calls).toHaveLength(0);

      down();

      expect(onScrollToChange.mock.calls).toHaveLength(1);

      const {col, row} = onScrollToChange.mock.calls[0][0];
      expect(col).toEqual(0);
      expect(row).toEqual(1);
    });
  });

  it('should not call :onScrollToChange for prop update', () => {
    const onScrollToChange = jest.fn();
    const {rerender} = renderHelper({
      onScrollToChange,
      target: {
        row: 0,
        col: 0,
      },
    });

    renderHelper(
      {
        isControlled: true,
        onScrollToChange,
        scrollToColumn: 0,
        scrollToRow: 1,
      },
      rerender,
    );
    expect(onScrollToChange.mock.calls).toHaveLength(0);
  });

  describe('mode === "edges"', () => {
    it('should update :scrollToColumn and :scrollToRow relative to the most recent :onSectionRendered event', async () => {
      const {node, hackStateAndGiveCancer} = renderHelper();
      hackStateAndGiveCancer({
        currentTarget: {
          row: 0,
          col: 0,
        },
        colIndexes: [0, 4],
        rowIndexes: [4, 6],
      });
      node.focus();
      down();
      assertCurrentScrollTo(node, 0, 7);
      hackStateAndGiveCancer({
        currentTarget: {
          row: 7,
          col: 0,
        },
        colIndexes: [5, 10],
        rowIndexes: [2, 4],
      });
      up();
      assertCurrentScrollTo(node, 0, 1);
      hackStateAndGiveCancer({
        currentTarget: {
          row: 1,
          col: 0,
        },
        colIndexes: [4, 8],
        rowIndexes: [5, 10],
      });

      right();
      assertCurrentScrollTo(node, 9, 1);
      hackStateAndGiveCancer({
        currentTarget: {
          row: 1,
          col: 9,
        },
        colIndexes: [2, 4],
        rowIndexes: [2, 4],
      });

      left();
      assertCurrentScrollTo(node, 1, 1);
    });
  });

  describe('mode === "cells"', () => {
    it('should update :scrollToColumn and :scrollToRow relative to the most recent :onSectionRendered event', () => {
      const {node, hackStateAndGiveCancer} = renderHelper({
        mode: 'cells',
        scrollToColumn: 5,
        scrollToRow: 5,
      });

      hackStateAndGiveCancer({
        currentTarget: {
          row: 5,
          col: 5,
        },
        colIndexes: [10, 10],
        rowIndexes: [15, 15],
      });
      node.focus();
      up();
      assertCurrentScrollTo(node, 5, 4);
      down();
      assertCurrentScrollTo(node, 5, 5);

      hackStateAndGiveCancer({
        currentTarget: {
          row: 5,
          col: 5,
        },
        colIndexes: [10, 10],
        rowIndexes: [15, 15],
      });

      right();
      assertCurrentScrollTo(node, 6, 5);
      left();
      assertCurrentScrollTo(node, 5, 5);
    });
  });
});
