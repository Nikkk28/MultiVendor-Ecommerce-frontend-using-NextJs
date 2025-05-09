# MultiMart E-commerce Platform

MultiMart is a comprehensive e-commerce platform built with Next.js for the frontend and Spring Boot for the backend. This README provides detailed information about the project structure, setup instructions, and API endpoints required for the Spring Boot backend.

## Table of Contents

- [Frontend Overview](#frontend-overview)
- [Backend Requirements](#backend-requirements)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)

## Frontend Overview

The frontend is built with:

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Hook Form** for form handling
- **Zod** for validation

### Key Features

- User authentication (login, register, forgot password)
- Role-based access (customer, vendor, admin)
- Product browsing and searching
- Category and subcategory navigation
- Product details with reviews
- Shopping cart functionality
- Wishlist management
- Vendor dashboard for product management
- Admin dashboard for platform management

## Backend Requirements

The backend should be built with:

- **Spring Boot 3.x**
- **Java 17+**
- **Spring Security** with JWT authentication
- **Spring Data JPA** for database operations
- **PostgreSQL** or **MySQL** for the database
- **Hibernate** for ORM
- **Maven** or **Gradle** for dependency management

## API Endpoints

### Authentication

\`\`\`
POST /api/auth/register - Register a new user
POST /api/auth/login - Login and get JWT token
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password - Reset password with token
GET /api/auth/verify-email - Verify email with token
\`\`\`

### User Management

\`\`\`
GET /api/users/profile - Get current user profile
PUT /api/users/profile - Update user profile
GET /api/users/addresses - Get user addresses
POST /api/users/addresses - Add a new address
PUT /api/users/addresses/{id} - Update an address
DELETE /api/users/addresses/{id} - Delete an address
GET /api/users/wishlist - Get user wishlist
POST /api/users/wishlist - Add product to wishlist
DELETE /api/users/wishlist/{productId} - Remove product from wishlist
\`\`\`

### Products

\`\`\`
GET /api/products - Get all products with pagination and filtering
GET /api/products/{id} - Get product details by ID
GET /api/products/trending - Get trending products
GET /api/products/recommended - Get recommended products
GET /api/products/recently-viewed - Get recently viewed products
GET /api/products/{id}/similar - Get similar products
GET /api/products/search - Search products
\`\`\`

### Categories

\`\`\`
GET /api/categories - Get all categories
GET /api/categories/{id} - Get category by ID
GET /api/categories/slug/{slug} - Get category by slug
GET /api/categories/{id}/subcategories - Get subcategories
GET /api/categories/featured - Get featured categories
GET /api/categories/{id}/products - Get products by category
\`\`\`

### Cart

\`\`\`
GET /api/cart - Get current user's cart
POST /api/cart/items - Add item to cart
PUT /api/cart/items/{id} - Update cart item quantity
DELETE /api/cart/items/{id} - Remove item from cart
DELETE /api/cart - Clear cart
\`\`\`

### Orders

\`\`\`
POST /api/orders - Place a new order
GET /api/orders - Get user orders
GET /api/orders/{id} - Get order details
POST /api/orders/{id}/cancel - Cancel an order
\`\`\`

### Reviews

\`\`\`
GET /api/products/{productId}/reviews - Get product reviews
POST /api/products/{productId}/reviews - Add a review
POST /api/reviews/{reviewId}/helpful - Mark review as helpful
\`\`\`

### Vendor Management

\`\`\`
GET /api/vendors/profile - Get vendor profile
PUT /api/vendors/profile - Update vendor profile
GET /api/vendors/products - Get vendor products
POST /api/vendors/
\`\`\`

## Data Models

### User

\`\`\`json
{
  "id": 1,
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+91 9876543210",
  "role": "CUSTOMER", // CUSTOMER, VENDOR, ADMIN
  "address": {
    "country": "India",
    "state": "Maharashtra",
    "city": "Mumbai",
    "zipCode": "400001",
    "street": "123 Main St, Apt 4B"
  },
  "addresses": [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "+91 9876543210",
      "addressLine1": "123 Main St",
      "addressLine2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "isDefault": true
    }
  ],
  "createdAt": "2023-01-10T00:00:00Z",
  "lastLogin": "2023-06-15T10:30:00Z",
  "isActive": true,
  "isEmailVerified": true
}
\`\`\`

### Vendor

\`\`\`json
{
  "id": 1,
  "userId": 1,
  "storeName": "ElectroHub",
  "storeDescription": "Best electronics store in town",
  "storeAddress": {
    "country": "India",
    "state": "Maharashtra",
    "city": "Mumbai",
    "zipCode": "400001",
    "street": "456 Market St"
  },
  "logo": "vendor-logo.jpg",
  "bannerImage": "vendor-banner.jpg",
  "approvalStatus": "APPROVED", // PENDING, APPROVED, REJECTED
  "rejectionReason": null,
  "rating": 4.7,
  "productCount": 250,
  "specialty": "Electronics",
  "joinedDate": "2022-01-15T00:00:00Z",
  "contactEmail": "vendor@example.com",
  "contactPhone": "+91 9876543210",
  "socialLinks": {
    "website": "https://example.com",
    "facebook": "https://facebook.com/vendor",
    "instagram": "https://instagram.com/vendor"
  },
  "businessHours": [
    {
      "day": "Monday",
      "open": "09:00",
      "close": "18:00"
    }
  ]
}
\`\`\`

### Product

\`\`\`json
{
  "id": 1,
  "name": "Premium Wireless Earbuds",
  "description": "Experience premium sound quality with these wireless earbuds...",
  "price": 2499,
  "originalPrice": 3999,
  "images": ["image1.jpg", "image2.jpg", "image3.jpg"],
  "category": {
    "id": 1,
    "name": "Electronics"
  },
  "subcategory": {
    "id": 2,
    "name": "Audio"
  },
  "vendor": {
    "id": 1,
    "name": "ElectroHub",
    "rating": 4.8
  },
  "rating": 4.7,
  "reviewCount": 245,
  "inventory": 50,
  "specifications": [
    {
      "name": "Battery Life",
      "value": "6 hours (24 hours with case)"
    },
    {
      "name": "Connectivity",
      "value": "Bluetooth 5.2"
    }
  ],
  "tags": ["wireless", "earbuds", "bluetooth", "audio"],
  "isOnSale": true,
  "discountPercentage": 37,
  "inStock": true,
  "sku": "PROD-12345",
  "weight": 0.5,
  "dimensions": {
    "length": 10,
    "width": 5,
    "height": 2
  },
  "shippingInfo": {
    "freeShipping": true,
    "estimatedDelivery": "3-5 days"
  },
  "reviews": [
    {
      "id": 1,
      "user": "Rahul S.",
      "rating": 5,
      "date": "2023-06-15",
      "title": "Best earbuds I've ever owned",
      "comment": "The sound quality is amazing...",
      "helpful": 24,
      "verified": true
    }
  ],
  "createdAt": "2023-06-15T10:30:00Z",
  "updatedAt": "2023-06-15T10:30:00Z"
}
\`\`\`

### Category

\`\`\`json
{
  "id": 1,
  "name": "Category Name",
  "image": "category.jpg",
  "description": "Category description",
  "subcategories": [
    {
      "id": 1,
      "name": "Subcategory 1"
    },
    {
      "id": 2,
      "name": "Subcategory 2"
    }
  ],
  "productCount": 150,
  "featured": true,
  "slug": "category-name"
}
\`\`\`

### Cart

\`\`\`json
{
  "id": 1,
  "userId": 1,
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Product Name",
        "image": "product.jpg",
        "price": 1999,
        "vendor": {
          "id": 1,
          "name": "Vendor Name"
        }
      },
      "quantity": 2,
      "price": 1999
    }
  ],
  "totalItems": 2,
  "subtotal": 3998,
  "tax": 720,
  "shipping": 100,
  "total": 4818,
  "couponCode": "SUMMER10",
  "couponDiscount": 0,
  "updatedAt": "2023-06-20T15:30:00Z"
}
\`\`\`

### Order

\`\`\`json
{
  "id": 1,
  "orderNumber": "ORD12345",
  "userId": 1,
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Product Name",
        "image": "product.jpg"
      },
      "quantity": 2,
      "price": 1999,
      "vendorId": 1
    }
  ],
  "shippingAddress": {
    "id": 1,
    "name": "John Doe",
    "phone": "+91 9876543210",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001"
  },
  "paymentMethod": "Credit Card",
  "paymentStatus": "PAID", // PENDING, PAID, FAILED
  "orderStatus": "PROCESSING", // PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED
  "subtotal": 3998,
  "tax": 720,
  "shipping": 100,
  "discount": 0,
  "total": 4818,
  "trackingNumber": "TRK123456789",
  "shippingProvider": "FedEx",
  "estimatedDelivery": "2023-06-25T00:00:00Z",
  "notes": "Please leave at the front door",
  "createdAt": "2023-06-20T15:30:00Z",
  "updatedAt": "2023-06-20T15:30:00Z"
}
\`\`\`

### Review

\`\`\`json
{
  "id": 1,
  "productId": 1,
  "userId": 1,
  "userName": "John D.",
  "rating": 4,
  "title": "Great product",
  "comment": "This product exceeded my expectations. Very happy with the purchase.",
  "images": ["review-image1.jpg", "review-image2.jpg"],
  "helpful": 5,
  "verified": true,
  "createdAt": "2023-06-25T10:15:00Z",
  "updatedAt": "2023-06-25T10:15:00Z"
}
\`\`\`

### Payment

\`\`\`json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 4818,
  "currency": "INR",
  "paymentMethod": "Credit Card",
  "paymentGateway": "Stripe",
  "transactionId": "txn_123456789",
  "status": "COMPLETED", // PENDING, COMPLETED, FAILED, REFUNDED
  "createdAt": "2023-06-20T15:30:00Z",
  "updatedAt": "2023-06-20T15:30:00Z"
}
\`\`\`

### Notification

\`\`\`json
{
  "id": 1,
  "userId": 1,
  "title": "Order Shipped",
  "message": "Your order #ORD12345 has been shipped.",
  "type": "ORDER_UPDATE", // ORDER_UPDATE, PAYMENT, PROMOTION, SYSTEM
  "read": false,
  "actionUrl": "/orders/1",
  "createdAt": "2023-06-22T10:15:00Z"
}
\`\`\`

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Make sure your Spring Boot backend is running on localhost:8080

## Backend Setup

The frontend is designed to connect with a Spring Boot backend. Make sure your backend implements all the required API endpoints as specified above.

### Database Schema

The backend should use a relational database (MySQL, PostgreSQL) with the following schema:

- users
- vendors
- products
- product_images
- categories
- subcategories
- cart_items
- orders
- order_items
- reviews
- addresses
- payments
- notifications
- wishlist_items

### File Storage

For product images and other file uploads, the backend should implement:

1. Secure file upload handling with validation for file types, sizes, and content
2. Integration with a cloud storage service (AWS S3, Google Cloud Storage, etc.)
3. Image processing for thumbnails and optimized versions
4. CDN integration for fast global delivery of images

## Environment Variables

No environment variables are required for the frontend to connect to the backend as it's hardcoded to connect to `http://localhost:8080/api`.

## Testing

For testing purposes, the application includes mock users:

- **Customers**: customer1, customer2, customer3
- **Vendors**: vendor1 (approved), vendor2 (pending), vendor3 (rejected)
- **Admins**: admin1, admin2, admin3

Any password will work for these mock users in the demo mode.

## License

This project is licensed under the MIT License.
