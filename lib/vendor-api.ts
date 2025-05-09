import { request } from "@/lib/api"

export const vendorApi = {
  getProducts: (params?: { page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()

    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return request(`/vendors/products${queryString}`)
  },

  addProduct: (productData: any) =>
    request("/vendors/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  updateProduct: (productId: number, productData: any) =>
    request(`/vendors/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),

  deleteProduct: (productId: number) =>
    request(`/vendors/products/${productId}`, {
      method: "DELETE",
    }),
}
