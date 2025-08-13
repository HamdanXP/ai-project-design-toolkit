import html2pdf from 'html2pdf.js';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
});

const getPdfFileName = (fileType: string, projectTitle?: string): string => {
  const baseTitle = projectTitle ? `${projectTitle}-` : 'ai-project-';
  
  switch (fileType) {
    case 'documentation':
      return `${baseTitle}documentation.pdf`;
    case 'setup_instructions':
      return `${baseTitle}setup-guide.pdf`;
    case 'deployment_guide':
      return `${baseTitle}deployment-guide.pdf`;
    case 'ethical_assessment_guide':
      return `${baseTitle}ethical-assessment.pdf`;
    case 'technical_handover_package':
      return `${baseTitle}technical-handover.pdf`;
    default:
      return `${baseTitle}${fileType}.pdf`;
  }
};

const getPdfStyles = () => `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
      margin-bottom: 30px;
      font-size: 28px;
    }
    h2 {
      color: #1e40af;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
      margin-top: 40px;
      margin-bottom: 20px;
      font-size: 22px;
    }
    h3 {
      color: #1e40af;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 18px;
    }
    h4 {
      color: #374151;
      margin-top: 25px;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 600;
    }
    ul, ol {
      margin: 15px 0;
      padding-left: 25px;
    }
    li {
      margin: 8px 0;
    }
    p {
      margin: 12px 0;
      text-align: justify;
    }
    code {
      background-color: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      overflow-x: auto;
      margin: 20px 0;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #2563eb;
      margin: 20px 0;
      padding-left: 20px;
      font-style: italic;
      color: #6b7280;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
    }
    table th, table td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
    }
    table th {
      background-color: #f9fafb;
      font-weight: 600;
    }
    strong {
      color: #1f2937;
    }
  </style>
`;

export const convertMarkdownToPdf = async (
  markdownContent: string, 
  filename: string,
  projectTitle?: string
): Promise<void> => {
  const cleanMarkdown = markdownContent.replace(/^```(?:markdown)?\s*\n?|```\s*$/g, '').trim();

  const htmlContent = md.render(cleanMarkdown);
  
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${projectTitle || 'AI Project Documentation'}</title>
        ${getPdfStyles()}
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;
  
  const options = {
    margin: [0.5, 0.5],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'in', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };
  
  try {
    await html2pdf().set(options).from(fullHtml).save();
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF');
  }
};

export { getPdfFileName };