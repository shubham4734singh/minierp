export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "MiniERP API",
    version: "1.0.0",
    description: "API documentation for MiniERP system"
  },
  servers: [
    { url: "/api", description: "Vercel Production API" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/register": {
      post: {
        summary: "Register new user",
        security: [],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { name: { type: "string" }, email: { type: "string" }, password: { type: "string" }, role: { type: "string", enum: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] } }
              }
            }
          }
        },
        responses: { 201: { description: "Created" } }
      }
    },
    "/auth/login": {
      post: {
        summary: "Login user",
        security: [],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { email: { type: "string" }, password: { type: "string" } }
              }
            }
          }
        },
        responses: { 200: { description: "Success" } }
      }
    },
    "/products": {
      get: { summary: "Get all products", responses: { 200: { description: "Success" } } },
      post: {
        summary: "Create product",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  sku: { type: "string" },
                  category: { type: "string" },
                  unitPrice: { type: "number" },
                  currentStock: { type: "number" }
                }
              }
            }
          }
        },
        responses: { 201: { description: "Created" } }
      }
    },
    "/products/{id}": {
      get: {
        summary: "Get product by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Success" } }
      },
      put: {
        summary: "Update product",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { name: { type: "string" }, unitPrice: { type: "number" } }
              }
            }
          }
        },
        responses: { 200: { description: "Success" } }
      },
      delete: {
        summary: "Delete product",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Success" } }
      }
    },
    "/products/{id}/stock": {
      post: {
        summary: "Adjust stock",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  quantity: { type: "number" },
                  type: { type: "string", enum: ["IN", "OUT"] },
                  reason: { type: "string" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Success" } }
      }
    },
    "/customers": {
      get: { summary: "Get all customers", responses: { 200: { description: "Success" } } },
      post: {
        summary: "Create customer",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { name: { type: "string" }, mobile: { type: "string" }, type: { type: "string" } }
              }
            }
          }
        },
        responses: { 201: { description: "Created" } }
      }
    },
    "/customers/{id}": {
      get: {
        summary: "Get customer by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Success" } }
      },
      put: {
        summary: "Update customer",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { name: { type: "string" }, mobile: { type: "string" } }
              }
            }
          }
        },
        responses: { 200: { description: "Success" } }
      },
      delete: {
        summary: "Delete customer",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Success" } }
      }
    },
    "/challans": {
      get: { summary: "Get all challans", responses: { 200: { description: "Success" } } },
      post: {
        summary: "Create challan",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  customerId: { type: "string" },
                  status: { type: "string", enum: ["DRAFT", "CONFIRMED"] },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { productId: { type: "string" }, quantity: { type: "number" } }
                    }
                  }
                }
              }
            }
          }
        },
        responses: { 201: { description: "Created" } }
      }
    },
    "/challans/{id}/status": {
      put: {
        summary: "Update challan status",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", properties: { status: { type: "string", enum: ["DRAFT", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] } } }
            }
          }
        },
        responses: { 200: { description: "Success" } }
      }
    },
    "/dashboard/stats": {
      get: { summary: "Get dashboard stats", responses: { 200: { description: "Success" } } }
    },
    "/users": {
      get: { summary: "Get all users", responses: { 200: { description: "Success" } } }
    },
    "/audit-logs": {
      get: { summary: "Get all audit logs", responses: { 200: { description: "Success" } } }
    }
  }
};
