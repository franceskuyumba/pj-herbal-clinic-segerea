// Types shared between apps/web and apps/api so the two never drift apart.
// Mirrors apps/api/prisma/schema.prisma — if a field changes there, it
// changes here too.

export type Role = "customer" | "staff" | "admin";

export type ProductStatus = "active" | "out_of_stock" | "discontinued" | "draft";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentMethod =
  | "mpesa"
  | "tigopesa"
  | "airtelmoney"
  | "halopesa"
  | "crdb_bank"
  | "nmb_bank";

export type PaymentProvider = "selcom" | "flutterwave" | "dpo";

export type PaymentStatus = "initiated" | "pending" | "successful" | "failed" | "refunded";

export type DeliveryStatus =
  | "unassigned"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "failed";

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  shortBenefits: string;
  description: string;
  ingredients: string;
  usageInstructions: string;
  benefits: string;
  warnings: string;
  priceCents: number;
  compareAtCents: number | null;
  currency: string;
  stock: number;
  status: ProductStatus;
  categoryId: string;
  images: { url: string; altText: string | null }[];
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  fullName: string;
  phone: string;
  region: string;
  district: string;
  streetLine: string;
  items: OrderItemDTO[];
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  totalCents: number;
  createdAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  [key: string]: unknown;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  details?: unknown;
}
