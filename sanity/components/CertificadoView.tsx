import { useFormValue } from 'sanity'

export default function CertificadoView() {
  const nombre = useFormValue(['nombre']) as string
  const slug = useFormValue(['slug', 'current']) as string
  const categoria = useFormValue(['categoria']) as string
  const numeroCertificado = useFormValue(['numeroCertificado']) as string
  const descripcion = useFormValue(['descripcion']) as string

  return (
    <div style={{ padding: '3rem 2.5rem', maxWidth: '680px', fontFamily: 'sans-serif', color: '#111' }}>
      <div style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#999', margin: '0 0 0.5rem' }}>
          Registro de Certificado de Unicidad
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0 }}>{nombre || '—'}</h1>
      </div>

      <div style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#777' }}>
          Número de Certificado
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: '700', letterSpacing: '0.3em', color: '#111' }}>
          № {numeroCertificado || 'Sin asignar'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Field label="URL / Slug" value={slug ? `/${slug}` : '—'} />
        <Field label="Categoría" value={categoria || '—'} />
        <Field label="Descripción" value={descripcion || '—'} multiline />
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '1.25rem', borderTop: '1px solid #e5e5e5', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb' }}>
        Estudio Skilglass · Solo Lectura · No editable desde esta vista
      </div>
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
