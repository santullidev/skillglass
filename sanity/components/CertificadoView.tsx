import { SanityDocument } from 'sanity'
import { urlFor } from '../lib/image'

// Las vistas reciben el documento completo en props — NO usar useFormValue
interface CertificadoViewProps {
  document: {
    displayed: SanityDocument & {
      nombre?: string
      slug?: { current: string }
      categoria?: string
      numeroCertificado?: string
      descripcion?: string
      imagenes?: any[]
    }
  }
}

export default function CertificadoView({ document }: CertificadoViewProps) {
  const { nombre, slug, categoria, numeroCertificado, descripcion, imagenes } = document.displayed

  return (
    <div style={{ padding: '3rem 2.5rem', maxWidth: '680px', fontFamily: 'sans-serif', color: '#111' }}>
      <div style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#999', margin: '0 0 0.5rem' }}>
          Registro de Certificado de Unicidad
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0 }}>{nombre || '—'}</h1>
      </div>

      <div style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#777' }}>
          Número de Certificado
        </p>
        <span style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: '700', letterSpacing: '0.3em', color: '#111' }}>
          № {numeroCertificado || 'Sin asignar'}
        </span>
      </div>

      {/* Galería de Imágenes */}
      {imagenes && imagenes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {imagenes.map((img, i) => (
            <div key={i} style={{ aspectRatio: '1/1', overflow: 'hidden', borderRadius: '4px', border: '1px solid #eee', background: '#f5f5f5' }}>
              <img 
                src={urlFor(img).width(300).height(300).fit('crop').url()} 
                alt={`${nombre} - ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Field label="URL / Slug" value={slug?.current ? `/${slug.current}` : '—'} />
        <Field label="Categoría" value={categoria || '—'} />
        <Field label="Descripción" value={descripcion || '—'} multiline />
      </div>

      <p style={{ marginTop: '3rem', paddingTop: '1.25rem', borderTop: '1px solid #e5e5e5', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb' }}>
        Estudio Skilglass · Solo Lectura · No editable desde esta vista
      </p>
    </div>
  )
}

function Field({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#999', margin: '0 0 0.4rem' }}>
        {label}
      </p>
      <p style={{ fontSize: '14px', color: '#222', margin: 0, lineHeight: multiline ? '1.6' : '1', whiteSpace: multiline ? 'pre-wrap' : 'normal' }}>
        {value}
      </p>
    </div>
  )
}
