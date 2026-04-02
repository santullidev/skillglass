import { createClient } from 'next-sanity';
import fs from 'fs';
import path from 'path';

const client = createClient({
  projectId: "obhj76tx",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: "sksRyF8XWVJRLSJO2lyQRi8cRD4naxONSi4uowTRzdooKO37KnbMvd6yp7vo8IB8zuPN5ni2be3RaQOqJwV5eX3SCsdCobAG0AYAZeD2G3NEEYXVOEZrgnSFxvFmHrwnHpGvkRkQMk8nE1aONSvg9W1qFkbw8Xb1bHA7aWhkNxc2i9W2TEA8",
  useCdn: false,
});

async function main() {
  const images = [
    {
      filepath: 'C:\\Users\\zaphe\\.gemini\\antigravity\\brain\\b95ef023-f893-4a26-9d18-4fe9d5ebf9b5\\manifesto_flameworking_torch_1775098248498.png',
      fieldPath: 'seccionProceso.imagen'
    }
  ];

  const homeConfigList = await client.fetch('*[_type == "homeConfig"]');
  if (homeConfigList.length === 0) {
    console.error("❌ No homeConfig document found.");
    return;
  }
  
  const homeId = homeConfigList[0]._id;
  console.log(`📌 Found Home Config ID: ${homeId}`);

  let patchObj = client.patch(homeId);

  for (const img of images) {
    if (!fs.existsSync(img.filepath)) {
      console.error(`❌ Image not found: ${img.filepath}`);
      continue;
    }
    
    console.log(`Uploading ${path.basename(img.filepath)}...`);
    const asset = await client.assets.upload('image', fs.createReadStream(img.filepath));
    
    // Set the asset reference into the document field
    patchObj = patchObj.set({
      [img.fieldPath]: {
        _type: 'image',
        asset: {
          _type: "reference",
          _ref: asset._id
        }
      }
    });

    console.log(`✅ Uploaded and queued for ${img.fieldPath}`);
  }

  console.log('🔄 Committing changes to Sanity...');
  await patchObj.commit();
  console.log('✅ Finished uploading and patching schema!');
}

main();
