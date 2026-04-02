import { createClient } from 'next-sanity';

const client = createClient({
  projectId: "obhj76tx",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: "sksRyF8XWVJRLSJO2lyQRi8cRD4naxONSi4uowTRzdooKO37KnbMvd6yp7vo8IB8zuPN5ni2be3RaQOqJwV5eX3SCsdCobAG0AYAZeD2G3NEEYXVOEZrgnSFxvFmHrwnHpGvkRkQMk8nE1aONSvg9W1qFkbw8Xb1bHA7aWhkNxc2i9W2TEA8",
  useCdn: false,
});

async function main() {
  const homeConfigList = await client.fetch('*[_type == "homeConfig"]');
  if (homeConfigList.length === 0) {
    console.error("❌ No homeConfig document found.");
    return;
  }
  
  const homeId = homeConfigList[0]._id;
  
  const patchData = {
    'seccionAlquimia.etiqueta': 'SOPLADO A LA FLAMA',
    'seccionFrase.frase': 'Nace de una noble varilla de cristal y la intensidad de la llama. En esa danza inestable entre el calor de 1000°C y la gravedad, guiamos el vidrio fundido para congelar un instante de pura luz.',
    'seccionFrase.activo': true,
    'tituloPiezasDestacadas': 'El Catálogo Flameworking',
    'seccionProceso.activo': true,
    'seccionProceso.etiqueta': 'LA TÉCNICA',
    'seccionProceso.titulo': 'La Tensión de la Llama',
    'seccionProceso.descripcion': 'Olvida la producción en masa. Cada joya de SKILGLASS es esculpida individualmente mediante la pura técnica del soplado a la flama. El artesano manipula el calor y el cristal líquido, moldeando la gota incandescente con precisión quirúrgica antes de que el aire la solidifique.',
    'seccionProceso.pasos': [
      {
        titulo: "Pulso y Soplete",
        descripcion: "Llevamos varillas de cristal puro a su punto de fusión exacto, dominando una llama viva para que obedezca al pulso de nuestras manos.",
        _key: "feat1"
      },
      {
        titulo: "Sin Moldes",
        descripcion: "La forma final de cada anillo o joya es dictada por la tensión superficial y nuestro control de la gravedad. Ninguna pieza es idéntica a otra.",
        _key: "feat2"
      },
      {
        titulo: "Templado Íntimo",
        descripcion: "Tras ser esculpidas en el fuego, las piezas reposan en un meticuloso proceso de templado artesanal para garantizar su resistencia eterna.",
        _key: "feat3"
      },
      {
        titulo: "Luz Vestible",
        descripcion: "Diseñamos prismas orgánicos. Creados no solo como accesorios, sino como piezas que interactúan con la refracción lumínica sobre tu piel.",
        _key: "feat4"
      }
    ]
  };

  try {
    await client.patch(homeId)
      .unset(['alquimia', 'frase', 'seccionNarrativa', 'tituloPiezas'])
      .set(patchData)
      .commit();
    console.log("✅ Sanity content schema fixed and fields migrated successfully!");
  } catch (error) {
    console.error("❌ Error fixing Sanity content schema:", error.message);
  }
}

main();
