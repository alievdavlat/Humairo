import z from 'zod'

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
})

export const cartSchema = z.object({
  items: z.array(cartItemSchema).min(1),
})


export type CartItem = z.infer<typeof cartItemSchema>; 
export type Cart = z.infer<typeof cartSchema>;  