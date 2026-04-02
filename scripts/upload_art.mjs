import fs from 'fs';
import path from 'path';
import { createClient } from 'next-sanity';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = createClient({
  projectId: "obhj76tx",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: "sksRyF8XWVJRLSJO2lyQRi8cRD4naxONSi4uowTRzdooKO37KnbMvd6yp7vo8IB8zuPN5ni2be3RaQOqJwV5eX3SCsdCobAG0AYAZeD2G3NEEYXVOEZrgnSFxvFmHrwnHpGvkRkQMk8nE1aONSvg9W1qFkbw8Xb1bHA7aWhkNxc2i9W2TEA8",
  useCdn: false,
});

const uploadAsset = async (filePath) => {
  console.log(`Uploading ${filePath}...`);
  try {
    const fileContent = fs.readFileSync(filePath);
    const asset = await client.assets.upload('image', fileContent, {
      filename: path.basename(filePath)
    });
    console.log(`✅ Uploaded: ${asset._id}`);
    return asset._id;
  } catch (error) {
    console.error(`❌ Failed to upload ${filePath}:`, error.message);
    return null;
  }
};

const run = async () => {
  const images = {
    hero1: 'C:\\Users\\zaphe\\.gemini\\antigravity\\brain\\b95ef023-f893-4a26-9d18-4fe9d5ebf9b5\\hero_vitrofusion_1_1775087385121.png',
    hero2: 'C:\\Users\\zaphe\\.gemini\\antigravity\\brain\\b95ef023-f893-4a26-9d18-4fe9d5ebf9b5\\hero_vitrofusion_2_1775087405994.png',
    manifesto: 'C:\\Users\\zaphe\\.gemini\\antigravity\\brain\\b95ef023-f893-4a26-9d18-4fe9d5ebf9b5\\manifesto_kiln_image_1775087427629.png',
    p_collar: 'C:\\Users\\zaphe\\.gemini\\antigravity\\brain\\b95ef023-f893-4a26-9d18-4fe9d5ebf9b5\\product_collar_baltic_1775087451119.png',
    p_aretes: 'C:\\Users\\zaphe\\.gemini\\antigravity\\brain\\b95ef023-f893-4a26-9d18-4fe9d5ebf9b5\\product_aretes_rojos_1775087473507.png',
    p_pulsera: 'C:\\Users\\zaphe\\.gemini\\antigravity\\brain\\b95ef023-f893-4a26-9d18-4fe9d5ebf9b5\\product_pulsera_verde_1775087495278.png',
    p_anillo: 'C:\\Users\\zaphe\\.gemini\\antigravity\\brain\\b95ef023-f893-4a26-9d18-4fe9d5ebf9b5\\product_anillo_purpura_1775087515750.png',
    p_broche: 'C:\\Users\\zaphe\\.gemini\\antigravity\\brain\\b95ef023-f893-4a26-9d18-4fe9d5ebf9b5\\product_broche_dorado_1775087534667.png'
  };

  // Upload all assets
  const assetMap = {};
  for (const [key, filepath] of Object.entries(images)) {
    if (fs.existsSync(filepath)) {
      const assetId = await uploadAsset(filepath);
      if (assetId) assetMap[key] = assetId;
    } else {
      console.log(`⚠️ Skip: ${filepath} not found`);
    }
  }

  // Fetch products
  const products = await client.fetch('*[_type == "producto"]{_id, nombre}');
  
  if (products.length >= 5) {
      console.log('Update products with unique images...');
      const productImagesKeys = ['p_collar', 'p_aretes', 'p_pulsera', 'p_anillo', 'p_broche'];
      
      for(let i=0; i<Math.min(products.length, productImagesKeys.length); i++) {
          const product = products[i];
          const imgKey = productImagesKeys[i];
          const assetId = assetMap[imgKey];
          if(assetId) {
             await client.patch(product._id).set({
                 imagenes: [{ _type: 'image', asset: { _type: 'reference', _ref: assetId } }]
             }).commit();
             console.log(`✅ Updated product ${product.nombre} with ${imgKey}`);
          }
      }
  } else {
      console.log(`⚠️ Not enough products found (${products.length}). Skipping product updates.`);
  }

  // Update homeConfig
  console.log('Update homeConfig...');
  const homeConfigList = await client.fetch('*[_type == "homeConfig"]');
  if (homeConfigList.length > 0) {
      const homeId = homeConfigList[0]._id;
      const heroImages = [];
      if(assetMap.hero1) heroImages.push({ _type: 'image', _key: 'hero1', asset: { _type: 'reference', _ref: assetMap.hero1 }});
      if(assetMap.hero2) heroImages.push({ _type: 'image', _key: 'hero2', asset: { _type: 'reference', _ref: assetMap.hero2 }});
      
      const patchObj = {};
      if(heroImages.length > 0) {
          patchObj.heroImages = heroImages;
      }
      if(assetMap.manifesto) {
          // Because seccionProceso is an object, we patch inside it
          // Sanity syntax for patching nested objects without overriding the whole object:
          patchObj['seccionProceso.imagen'] = { _type: 'image', asset: { _type: 'reference', _ref: assetMap.manifesto }};
      }
      
      if(Object.keys(patchObj).length > 0) {
         try {
             await client.patch(homeId).set(patchObj).commit();
             console.log(`✅ Updated homeConfig layout images!`);
         } catch(e) {
             console.error('Error updating homeConfig:', e.message);
         }
      }
  } else {
      console.log(`⚠️ No homeConfig document found. Skipping hero/manifesto update.`);
  }

  console.log('Done!');
};

run().catch(console.error);
