import { vi, beforeEach } from 'vitest';
import prismaMock from './__mocks__/db';

vi.mock('../src/utils/db', () => ({
  __esModule: true,
  default: prismaMock,
}));

export { prismaMock };

beforeEach(() => {
  vi.clearAllMocks();
});
