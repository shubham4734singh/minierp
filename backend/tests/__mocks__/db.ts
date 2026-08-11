import { vi } from 'vitest';

const prismaMock = {
  product: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

export default prismaMock;
