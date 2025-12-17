import { fetchProducts } from "./adapter"
import { normalizeProduct } from "./normalize"
import { withCache } from "./cache"

export const productMcp = {
  async getProductsByIds(ids: string[]) {
    return withCache(
      `products:${ids.join(",")}`,
      30,
      async () => {
        const raw = await fetchProducts(ids)
        return raw.map(normalizeProduct)
      }
    )
  }
}
