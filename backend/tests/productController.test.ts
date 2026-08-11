import { Request, Response } from 'express';
import { adjustStock } from '../src/controllers/productController';
import { prismaMock } from './setup';
import { MovementType } from '@prisma/client';
import { vi, describe, it, expect } from 'vitest';

describe('productController - adjustStock', () => {
  it('should prevent stock from falling below zero on OUT movement', async () => {
    // Mock the DB finding a product with currentStock = 5
    prismaMock.product.findUnique.mockResolvedValue({
      id: 'prod-123',
      name: 'Test Product',
      sku: 'TEST-01',
      category: 'Test',
      unitPrice: 100,
      currentStock: 5,
      minStockAlert: 10,
      location: null,
      description: null,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Requesting to remove 10 units, which exceeds currentStock of 5
    const req = {
      params: { id: 'prod-123' },
      body: { quantity: 10, type: MovementType.OUT, reason: 'Sale' },
      user: { id: 'user-123', role: 'ADMIN' }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    await adjustStock(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient stock' });
    expect(prismaMock.product.update).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('should successfully update stock on valid OUT movement', async () => {
    // Mock the DB finding a product with currentStock = 50
    prismaMock.product.findUnique.mockResolvedValue({
      id: 'prod-123',
      name: 'Test Product',
      sku: 'TEST-01',
      category: 'Test',
      unitPrice: 100,
      currentStock: 50,
      minStockAlert: 10,
      location: null,
      description: null,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const mockUpdatedProduct = { id: 'prod-123', currentStock: 40 };
    prismaMock.$transaction.mockResolvedValue(mockUpdatedProduct);

    const req = {
      params: { id: 'prod-123' },
      body: { quantity: 10, type: MovementType.OUT, reason: 'Sale' },
      user: { id: 'user-123', role: 'ADMIN' }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    await adjustStock(req, res);

    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Stock adjusted successfully', 
      product: mockUpdatedProduct 
    });
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});
