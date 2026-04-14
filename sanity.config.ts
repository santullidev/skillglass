'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import CertificadoView from './sanity/components/CertificadoView'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
  },
  plugins: [
    structureTool({
      structure,
      defaultDocumentNode: (S, { schemaType, structurePath }) => {
        if (
          schemaType === 'producto' &&
          structurePath?.includes('certificadosEmitidos')
        ) {
          return S.document().views([
            S.view.form(),
            S.view.component(CertificadoView).title('Certificado'),
          ])
        }
        return null
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})