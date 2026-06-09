const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
    const doc = new PDFDocument({
        size: 'A5',
        layout: 'landscape',
        margin: 0
    });

    const outputPath = path.join(__dirname, '..', 'public', 'Certificado_Unicidad_Generico.pdf');
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const width = 595.28; // A5 Landscape width
    const height = 419.53; // A5 Landscape height

    // 1. Background Color
    doc.rect(0, 0, width, height).fill('#f7f4f4');

    // 2. Dotted Pattern (Subtle)
    // Using a lighter color and larger spacing to avoid bloating the PDF
    doc.save();
    doc.fillColor('#e8e4e4'); 
    for (let x = 10; x < width; x += 12) {
        for (let y = 10; y < height; y += 12) {
            doc.circle(x, y, 0.5).fill();
        }
    }
    doc.restore();

    // 3. Border
    doc.rect(10, 10, width - 20, height - 20)
       .lineWidth(0.5)
       .strokeColor('#6b1a2a')
       .strokeOpacity(0.3)
       .stroke();

    const pad = 40;

    // 4. Header (Title and Serial)
    doc.fillColor('#6b1a2a').fillOpacity(1);
    
    // Title
    doc.fontSize(8)
       .font('Helvetica-Bold')
       .text('CERTIFICADO DE UNICIDAD', pad, pad, { characterSpacing: 4 });

    // Serial Placeholder
    doc.fontSize(10)
       .font('Courier-Bold')
       .text('N° __________', width - pad - 120, pad, { width: 120, align: 'right', characterSpacing: 1 });

    // 5. Subtitle (Pieza Única e Irrepetible)
    doc.fillColor('#111111')
       .fontSize(28)
       .font('Times-Italic')
       .text('Pieza Única e Irrepetible', pad, pad + 45);

    // 6. Body Text
    doc.fillColor('#4a3b3c')
       .fontSize(12)
       .font('Helvetica')
       .text('Esta obra ha sido esculpida mediante transformación térmica directa. Debido a la naturaleza orgánica del vidrio fundido, las tensiones moleculares y la gravedad han dictado una forma final que es técnicamente imposible de replicar con exactitud. Todas las piezas atraviesan un proceso de cocción en el horno para poder hacer el material más resistente y liberando cualquier tensión interna del vidrio y reposando en un enfriamiento gradual en cada pieza.', pad, pad + 100, {
           width: width - (pad * 2),
           align: 'justify',
           lineGap: 6
       });

    // 7. Signature Area
    const signatureY = height - pad - 60;
    doc.moveTo(width / 2 - 80, signatureY)
       .lineTo(width / 2 + 80, signatureY)
       .lineWidth(0.5)
       .strokeColor('#6b1a2a')
       .strokeOpacity(0.5)
       .stroke();

    doc.fillColor('#6b1a2a').fillOpacity(0.7)
       .fontSize(7)
       .font('Helvetica-Bold')
       .text('FIRMA DE LA AUTORA', 0, signatureY + 8, { align: 'center', characterSpacing: 2 });

    // 8. Footer
    const footerY = height - pad - 20;
    
    // Line
    doc.moveTo(pad, footerY).lineTo(width - pad, footerY)
       .lineWidth(0.5)
       .strokeColor('#6b1a2a')
       .strokeOpacity(0.1)
       .stroke();

    // Studio Name
    doc.fillColor('#6b1a2a').fillOpacity(0.6)
       .fontSize(8)
       .font('Helvetica-Bold')
       .text('ESTUDIO SKILGLASS AR', pad, footerY + 15, { characterSpacing: 2 });

    // Three Dots
    const dotXStart = width - pad - 30;
    const dotY = footerY + 15;
    doc.fillColor('#6b1a2a').fillOpacity(0.3);
    doc.rect(dotXStart, dotY, 4, 4).fill();
    doc.rect(dotXStart + 8, dotY, 4, 4).fill();
    doc.rect(dotXStart + 16, dotY, 4, 4).fill();

    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
}

generatePDF().then(path => {
    console.log(`PDF generated successfully at: ${path}`);
}).catch(err => {
    console.error('Error generating PDF:', err);
    process.exit(1);
});
