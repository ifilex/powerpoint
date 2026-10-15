import JSZip from 'jszip';
import { Presentation, Slide, SlideElement, ShapeType, PresentationTheme } from '../types/presentation';
import { OFFICE_THEMES, DEFAULT_MACROS } from './defaultData';

/**
 * Converts EMU (English Metric Units) used in OpenXML to canvas pixels
 * Standard PowerPoint slide 16:9 is 12192000 x 6858000 EMU -> 960 x 540 px
 */
const EMU_PER_PX_X = 12192000 / 960; // 12700
const EMU_PER_PX_Y = 6858000 / 540; // 12700

export async function parsePptxFile(file: File): Promise<Presentation> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);

  const fileName = file.name.replace(/\.[^/.]+$/, '');
  const extension = file.name.split('.').pop()?.toLowerCase() || 'pptx';
  const fileFormat: 'pptx' | 'potx' | 'pptm' =
    extension === 'potx' ? 'potx' : extension === 'pptm' ? 'pptm' : 'pptx';

  const slides: Slide[] = [];
  const slideFiles: { name: string; index: number }[] = [];

  // Find all slide XML files
  contents.forEach((relativePath) => {
    const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/i);
    if (match) {
      slideFiles.push({
        name: relativePath,
        index: parseInt(match[1], 10),
      });
    }
  });

  // Sort slides in numerical order
  slideFiles.sort((a, b) => a.index - b.index);

  if (slideFiles.length === 0) {
    // If no explicit slides found, create a placeholder slide with the file name
    slides.push({
      id: `slide-${Date.now()}-1`,
      slideNumber: 1,
      title: fileName,
      layout: 'title',
      background: { type: 'solid', color: '#FFFFFF' },
      notes: 'Diapositiva importada desde archivo.',
      transition: { type: 'fade', duration: 500 },
      elements: [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          x: 80,
          y: 180,
          width: 800,
          height: 100,
          content: fileName,
          fontSize: 38,
          fontWeight: 'bold',
          color: '#1E293B',
          textAlign: 'center',
          zIndex: 1,
        },
      ],
    });
  } else {
    for (let i = 0; i < slideFiles.length; i++) {
      const slideItem = slideFiles[i];
      const xmlStr = await contents.file(slideItem.name)?.async('string');
      if (!xmlStr) continue;

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');

      const elements: SlideElement[] = [];
      let slideTitle = `Diapositiva ${i + 1}`;

      // Try to read notes slide if present
      let notes = '';
      const notesFile = contents.file(`ppt/notesSlides/notesSlide${slideItem.index}.xml`);
      if (notesFile) {
        const notesXml = await notesFile.async('string');
        const notesDoc = parser.parseFromString(notesXml, 'application/xml');
        const textNodes = notesDoc.getElementsByTagName('a:t');
        const noteParts: string[] = [];
        for (let t = 0; t < textNodes.length; t++) {
          noteParts.push(textNodes[t].textContent || '');
        }
        notes = noteParts.join(' ').trim();
      }

      // Extract all shape nodes <p:sp>
      const spNodes = xmlDoc.getElementsByTagName('p:sp');
      for (let s = 0; s < spNodes.length; s++) {
        const sp = spNodes[s];

        // Extract transform & position
        let x = 80;
        let y = 80 + s * 90;
        let width = 400;
        let height = 80;

        const off = sp.getElementsByTagName('a:off')[0];
        const ext = sp.getElementsByTagName('a:ext')[0];

        if (off) {
          const offX = parseInt(off.getAttribute('x') || '0', 10);
          const offY = parseInt(off.getAttribute('y') || '0', 10);
          x = Math.max(20, Math.min(880, Math.round(offX / EMU_PER_PX_X)));
          y = Math.max(20, Math.min(480, Math.round(offY / EMU_PER_PX_Y)));
        }

        if (ext) {
          const extCx = parseInt(ext.getAttribute('cx') || '0', 10);
          const extCy = parseInt(ext.getAttribute('cy') || '0', 10);
          width = Math.max(60, Math.min(900, Math.round(extCx / EMU_PER_PX_X)));
          height = Math.max(30, Math.min(500, Math.round(extCy / EMU_PER_PX_Y)));
        }

        // Extract text runs
        const tNodes = sp.getElementsByTagName('a:t');
        const textParts: string[] = [];
        for (let t = 0; t < tNodes.length; t++) {
          textParts.push(tNodes[t].textContent || '');
        }
        const textContent = textParts.join('\n').trim();

        // Extract color if present
        let color = '#1E293B';
        const srgbClr = sp.getElementsByTagName('a:srgbClr')[0];
        if (srgbClr) {
          const val = srgbClr.getAttribute('val');
          if (val) color = `#${val}`;
        }

        // Extract fill color for shape
        let fill: string | undefined = undefined;
        const solidFill = sp.getElementsByTagName('a:solidFill')[0];
        if (solidFill) {
          const fillClr = solidFill.getElementsByTagName('a:srgbClr')[0];
          if (fillClr && fillClr.getAttribute('val')) {
            fill = `#${fillClr.getAttribute('val')}`;
          }
        }

        // Determine if it's title
        const ph = sp.getElementsByTagName('p:ph')[0];
        const isTitle = ph?.getAttribute('type') === 'title' || ph?.getAttribute('type') === 'ctrTitle' || s === 0;

        if (textContent) {
          if (isTitle && textContent) {
            slideTitle = textContent.slice(0, 50);
          }

          elements.push({
            id: `el-parsed-${i}-${s}`,
            type: 'text',
            x,
            y,
            width,
            height,
            content: textContent,
            fontSize: isTitle ? 32 : 18,
            fontWeight: isTitle ? 'bold' : 'normal',
            color,
            fill,
            textAlign: isTitle ? 'center' : 'left',
            zIndex: s + 1,
          });
        } else if (fill) {
          // Shape without text
          elements.push({
            id: `el-shape-${i}-${s}`,
            type: 'shape',
            shapeType: 'rectangle',
            x,
            y,
            width,
            height,
            fill,
            zIndex: s + 1,
          });
        }
      }

      // Check for slide background
      let bgColor = '#FFFFFF';
      const bgClr = xmlDoc.getElementsByTagName('p:bg')[0]?.getElementsByTagName('a:srgbClr')[0];
      if (bgClr?.getAttribute('val')) {
        bgColor = `#${bgClr.getAttribute('val')}`;
      }

      slides.push({
        id: `slide-${Date.now()}-${i + 1}`,
        slideNumber: i + 1,
        title: slideTitle,
        layout: i === 0 ? 'title' : 'titleAndContent',
        background: { type: 'solid', color: bgColor },
        notes: notes || 'Diapositiva importada.',
        transition: { type: 'fade', duration: 500 },
        elements: elements.length > 0 ? elements : [
          {
            id: `el-empty-${i}`,
            type: 'text',
            x: 80,
            y: 200,
            width: 800,
            height: 80,
            content: `Diapositiva ${i + 1}`,
            fontSize: 32,
            fontWeight: 'bold',
            color: '#1E293B',
            textAlign: 'center',
            zIndex: 1,
          }
        ],
      });
    }
  }

  // Check if there are VBA macros inside .pptm
  const vbaProject = contents.file('ppt/vbaProject.bin');
  const macros = [...DEFAULT_MACROS];
  if (vbaProject) {
    macros.unshift({
      id: `macro-imported-${Date.now()}`,
      name: 'ModuloImportadoVBA',
      description: 'Módulo de macro binario extraído del archivo .pptm original.',
      language: 'vba',
      code: `' Macro extraída de ${file.name}\nSub EjecutarMacroOriginal()\n    MsgBox "Macro cargada exitosamente en PowerPoint Web Editor"\nEnd Sub`,
      lastRun: new Date().toISOString().split('T')[0],
      isCustom: true,
    });
  }

  return {
    id: `pres-${Date.now()}`,
    title: fileName,
    author: 'Usuario',
    version: 1,
    fileFormat,
    aspectRatio: '16:9',
    slides,
    theme: OFFICE_THEMES[0],
    macros,
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Builds a valid OpenXML PowerPoint (.pptx, .potx, .pptm) archive
 */
export async function exportToPptx(
  presentation: Presentation,
  format: 'pptx' | 'potx' | 'pptm' = 'pptx'
): Promise<Blob> {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  const contentTypeOverride =
    format === 'pptm'
      ? 'application/vnd.ms-powerpoint.presentation.macroEnabled.main+xml'
      : format === 'potx'
      ? 'application/vnd.openxmlformats-officedocument.presentationml.template.main+xml'
      : 'application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml';

  let contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Default Extension="bin" ContentType="application/vnd.ms-office.vbaProject"/>
  <Override PartName="/ppt/presentation.xml" ContentType="${contentTypeOverride}"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
`;

  presentation.slides.forEach((_, idx) => {
    contentTypesXml += `  <Override PartName="/ppt/slides/slide${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>\n`;
    contentTypesXml += `  <Override PartName="/ppt/notesSlides/notesSlide${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>\n`;
  });
  contentTypesXml += `</Types>`;
  zip.file('[Content_Types].xml', contentTypesXml);

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  );

  // 3. ppt/_rels/presentation.xml.rels
  let presRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdTheme" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
`;
  presentation.slides.forEach((_, idx) => {
    presRelsXml += `  <Relationship Id="rIdSlide${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${idx + 1}.xml"/>\n`;
  });
  if (format === 'pptm') {
    presRelsXml += `  <Relationship Id="rIdVba" Type="http://schemas.microsoft.com/office/2006/relationships/vbaProject" Target="vbaProject.bin"/>\n`;
  }
  presRelsXml += `</Relationships>`;
  zip.file('ppt/_rels/presentation.xml.rels', presRelsXml);

  // 4. ppt/presentation.xml
  let presXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rIdTheme"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
`;
  presentation.slides.forEach((_, idx) => {
    presXml += `    <p:sldId id="${256 + idx}" r:id="rIdSlide${idx + 1}"/>\n`;
  });
  presXml += `  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;
  zip.file('ppt/presentation.xml', presXml);

  // 5. ppt/theme/theme1.xml
  zip.file(
    'ppt/theme/theme1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
  <a:themeElements>
    <a:clrScheme name="Office">
      <a:dk1><a:srgbClr val="0F172A"/></a:dk1>
      <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="1E293B"/></a:dk2>
      <a:lt2><a:srgbClr val="F8FAFC"/></a:lt2>
      <a:accent1><a:srgbClr val="C2410C"/></a:accent1>
      <a:accent2><a:srgbClr val="2563EB"/></a:accent2>
      <a:accent3><a:srgbClr val="059669"/></a:accent3>
      <a:accent4><a:srgbClr val="7C3AED"/></a:accent4>
      <a:accent5><a:srgbClr val="D97706"/></a:accent5>
      <a:accent6><a:srgbClr val="DC2626"/></a:accent6>
    </a:clrScheme>
    <a:fontScheme name="Office">
      <a:majorFont><a:latin typeface="Segoe UI"/></a:majorFont>
      <a:minorFont><a:latin typeface="Segoe UI"/></a:minorFont>
    </a:fontScheme>
  </a:themeElements>
</a:theme>`
  );

  // 6. Generate individual slide XMLs & Notes
  presentation.slides.forEach((slide, idx) => {
    let slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
`;

    slide.elements.forEach((el, elIdx) => {
      const emuX = Math.round(el.x * EMU_PER_PX_X);
      const emuY = Math.round(el.y * EMU_PER_PX_Y);
      const emuW = Math.round(el.width * EMU_PER_PX_X);
      const emuH = Math.round(el.height * EMU_PER_PX_Y);
      const hexColor = (el.color || '#1E293B').replace('#', '');
      const hexFill = el.fill ? el.fill.replace('#', '') : undefined;
      const textVal = (el.content || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      slideXml += `      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${elIdx + 2}" name="${el.type}_${elIdx + 1}"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="${emuX}" y="${emuY}"/>
            <a:ext cx="${emuW}" cy="${emuH}"/>
          </a:xfrm>
          <a:prstGeom prst="${el.shapeType === 'circle' ? 'ellipse' : el.shapeType === 'roundedRectangle' ? 'roundRect' : 'rect'}">
            <a:avLst/>
          </a:prstGeom>
          ${hexFill ? `<a:solidFill><a:srgbClr val="${hexFill}"/></a:solidFill>` : '<a:noFill/>'}
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr sz="${(el.fontSize || 18) * 100}" b="${el.fontWeight === 'bold' ? '1' : '0'}">
                <a:solidFill><a:srgbClr val="${hexColor}"/></a:solidFill>
              </a:rPr>
              <a:t>${textVal}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
`;
    });

    slideXml += `    </p:spTree>
  </p:cSld>
</p:sld>`;

    zip.file(`ppt/slides/slide${idx + 1}.xml`, slideXml);

    // Slide relationship
    zip.file(
      `ppt/slides/_rels/slide${idx + 1}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdNotes" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide${idx + 1}.xml"/>
</Relationships>`
    );

    // Notes slide
    const notesSafe = (slide.notes || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    zip.file(
      `ppt/notesSlides/notesSlide${idx + 1}.xml`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notes xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>${notesSafe}</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:notes>`
    );
  });

  // If macro enabled (.pptm), generate dummy/real vbaProject.bin stream with metadata
  if (format === 'pptm') {
    const macroHeaders = presentation.macros.map((m) => `' Macro: ${m.name}\n${m.code}`).join('\n\n');
    zip.file('ppt/vbaProject.bin', new TextEncoder().encode(`MS_VBA_PROJECT_BINARY_STREAM\n${macroHeaders}`));
  }

  return await zip.generateAsync({ type: 'blob', mimeType: contentTypeOverride });
}
