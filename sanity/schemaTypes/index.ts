import { productSchema } from './product'
import { collectionSchema } from './collection'
import { homeConfigSchema } from './homeConfig'
import { orderSchema } from './order'
import { settingsSchema } from './settings'
import { soporteSchema } from './soporte'
import { productoConfigSchema } from './productoConfig'

export const schemaTypes = [
  productSchema, 
  collectionSchema, 
  homeConfigSchema, 
  orderSchema,
  settingsSchema, 
  soporteSchema,
  productoConfigSchema
]