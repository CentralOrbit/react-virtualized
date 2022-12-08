import '@testing-library/jest-dom';
import {cleanup, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

beforeEach(() => {
  jest.resetModules();
});

afterEach(cleanup);

jest.mock('dom-helpers/scrollbarSize', () => {
  return () => 20;
});

export * from '@testing-library/react';
export {userEvent, waitFor};
