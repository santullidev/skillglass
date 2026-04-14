import { productSchema } from './product'
import { collectionSchema } from './collection'
import { orderSchema } from './order'
import { settingsSchema } from './settings'
import { soporteSchema } from './soporte'
import { productoConfigSchema } from './productoConfig'
import { diarioTallerSchema } from './diarioTaller'
import { heroConfigSchema } from './heroConfig'
import { capsulasSectionSchema } from './capsulasSectionConfig'
import { alquimiaSectionSchema } from './alquimiaSectionConfig'
import { fraseSectionSchema } from './fraseSectionConfig'
import { productosSectionSchema } from './productosSectionConfig'
import { procesoSectionSchema } from './procesoSectionConfig'

export const schemaTypes = [
  productSchema,
  collectionSchema,
  orderSchema,
  settingsSchema,
  soporteSchema,
  productoConfigSchema,
  diarioTallerSchema,
  heroConfigSchema,
  capsulasSectionSchema,
  alquimiaSectionSchema,
  fraseSectionSchema,
  productosSectionSchema,
  procesoSectionSchema,
]