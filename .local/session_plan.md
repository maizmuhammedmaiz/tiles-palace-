# Objective
Full purchase invoice system with profit tracking and enhanced analytics.

# Tasks

### T001: Schema — add new tables + columns
- purchaseInvoices table, purchaseInvoiceItems table
- Add stockQty + costPrice to products
- Export all types/schemas

### T002: Storage — add CRUD methods + analytics
- createPurchaseInvoice (updates product stock + cost_price)
- getPurchaseInvoices / getPurchaseInvoiceItems
- getProfitAnalytics (per product + totals)
- Update createOrder to reduce stock

### T003: Routes — add API endpoints
- POST/GET /api/admin/purchase-invoices
- GET /api/admin/purchase-invoices/:id
- GET /api/admin/analytics/profit

### T004: Frontend — Purchases tab in Admin
- Invoice form: supplier, invoice#, date, line items (name, qty, purchase price, selling price / profit input)
- Auto-calculations live
- Purchase history list

### T005: Frontend — Enhanced Analytics tab
- Profit per product, total revenue, total purchase cost, gross profit
- Remaining stock, best-selling, most profitable products

