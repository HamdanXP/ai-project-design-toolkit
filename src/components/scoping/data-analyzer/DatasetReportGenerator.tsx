import { DatasetStatistics, EthicalAnalysis, ManualAssessmentResults, FileInfo } from "@/types/scoping-phase";

interface DatasetReportData {
  analysisType: 'automatic_with_ai' | 'statistical_only' | 'manual';
  fileInfo?: FileInfo;
  analysisTimestamp: string;
  statistics?: DatasetStatistics;
  ethicalAnalysis?: EthicalAnalysis;
  manualResults?: ManualAssessmentResults;
  note?: string;
}

export class DatasetReportGenerator {
  static generateReport(data: DatasetReportData): void {
    const htmlContent = this.generateReportHTML(data);
    this.downloadAsHTML(htmlContent, data.analysisType);
  }

  private static generateReportHTML(data: DatasetReportData): string {
    const timestamp = new Date(data.analysisTimestamp).toLocaleString();
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dataset Analysis Report - Humanitarian AI Assessment</title>
      <meta charset="UTF-8">
      <style>
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.4;
          margin: 0;
          padding: 15pt;
          color: #1f2937;
          background: white;
          font-size: 10pt;
        }
        
        .container {
          max-width: 180mm;
          margin: 0 auto;
          background: white;
        }
        
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
          color: white;
          padding: 18pt;
          margin: -15pt -15pt 18pt -15pt;
          text-align: center;
        }
        
        .header h1 {
          margin: 0 0 6pt 0;
          font-size: 18pt;
          font-weight: 600;
          letter-spacing: -0.3px;
        }
        
        .header .subtitle {
          opacity: 0.9;
          font-size: 11pt;
          margin-bottom: 6pt;
          font-weight: 400;
        }
        
        .header .timestamp {
          opacity: 0.8;
          font-size: 9pt;
        }
        
        .executive-summary {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6pt;
          padding: 15pt;
          margin-bottom: 18pt;
          page-break-inside: avoid;
        }
        
        .executive-summary h2 {
          color: #1e40af;
          margin: 0 0 12pt 0;
          font-size: 14pt;
          font-weight: 600;
          text-align: center;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15pt;
          margin-bottom: 12pt;
        }
        
        .summary-metric {
          text-align: center;
          padding: 12pt;
          background: white;
          border-radius: 4pt;
          border: 1px solid #e5e7eb;
        }
        
        .summary-metric .value {
          font-size: 20pt;
          font-weight: 700;
          margin-bottom: 3pt;
        }
        
        .summary-metric .label {
          font-size: 9pt;
          color: #6b7280;
          font-weight: 500;
        }
        
        .risk-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50pt;
          height: 50pt;
          border-radius: 50%;
          font-size: 9pt;
          font-weight: 700;
          text-align: center;
          margin-bottom: 6pt;
        }
        
        .risk-low { 
          background: #dcfce7; 
          color: #166534; 
          border: 2px solid #22c55e;
        }
        .risk-medium { 
          background: #fef3c7; 
          color: #92400e; 
          border: 2px solid #f59e0b;
        }
        .risk-high { 
          background: #fef2f2; 
          color: #991b1b; 
          border: 2px solid #ef4444;
        }
        
        .score-bar {
          width: 100%;
          height: 6pt;
          background: #e5e7eb;
          border-radius: 3pt;
          overflow: hidden;
          margin-top: 6pt;
        }
        
        .score-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .score-high { background: #22c55e; }
        .score-medium { background: #f59e0b; }
        .score-low { background: #ef4444; }
        
        .section {
          margin-bottom: 18pt;
          page-break-inside: avoid;
        }
        
        .section h2 {
          color: #1e40af;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 6pt;
          margin-bottom: 12pt;
          font-size: 13pt;
          font-weight: 600;
        }
        
        .section h3 {
          color: #374151;
          margin: 12pt 0 6pt 0;
          font-size: 11pt;
          font-weight: 600;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100pt, 1fr));
          gap: 10pt;
          margin: 10pt 0;
        }
        
        .info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 3pt;
          padding: 10pt;
        }
        
        .info-card .label {
          font-weight: 600;
          color: #6b7280;
          font-size: 8pt;
          margin-bottom: 3pt;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .info-card .value {
          font-size: 10pt;
          color: #1f2937;
          font-weight: 500;
        }
        
        .assessment-summary {
          background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%);
          border: 1px solid #0ea5e9;
          border-radius: 4pt;
          padding: 12pt;
          margin: 12pt 0;
        }
        
        .recommendation-box {
          background: #f0f9ff;
          border-left: 3pt solid #0ea5e9;
          padding: 12pt;
          margin: 12pt 0;
          border-radius: 0 3pt 3pt 0;
        }
        
        .recommendation-box h4 {
          margin: 0 0 6pt 0;
          color: #0c4a6e;
          font-size: 11pt;
          font-weight: 600;
        }
        
        .recommendation-list {
          margin: 6pt 0;
          padding-left: 12pt;
        }
        
        .recommendation-list li {
          margin: 4pt 0;
          line-height: 1.3;
        }
        
        .alert {
          padding: 10pt;
          border-radius: 3pt;
          margin: 10pt 0;
          border: 1px solid;
        }
        
        .alert-info {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1e40af;
        }
        
        .alert-warning {
          background: #fef3c7;
          border-color: #f59e0b;
          color: #92400e;
        }
        
        .alert-success {
          background: #f0fdf4;
          border-color: #22c55e;
          color: #166534;
        }
        
        .alert-danger {
          background: #fef2f2;
          border-color: #ef4444;
          color: #991b1b;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10pt 0;
          font-size: 8pt;
        }
        
        .data-table th,
        .data-table td {
          border: 1px solid #e5e7eb;
          padding: 5pt 4pt;
          text-align: left;
        }
        
        .data-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        
        .data-table tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .privacy-section {
          padding: 10pt;
          border-radius: 3pt;
          margin: 10pt 0;
          border: 1px solid;
        }
        
        .privacy-low { 
          background: #f0fdf4; 
          border-color: #22c55e; 
          color: #166534;
        }
        .privacy-medium { 
          background: #fef3c7; 
          border-color: #f59e0b; 
          color: #92400e;
        }
        .privacy-high { 
          background: #fef2f2; 
          border-color: #ef4444; 
          color: #991b1b;
        }
        
        .flagged-columns {
          display: flex;
          flex-wrap: wrap;
          gap: 3pt;
          margin: 6pt 0;
        }
        
        .flagged-column {
          background: #fef3c7;
          color: #92400e;
          padding: 2pt 4pt;
          border-radius: 2pt;
          font-size: 8pt;
          border: 1px solid #f59e0b;
        }
        
        .manual-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12pt;
          margin: 10pt 0;
        }
        
        .check-item {
          display: flex;
          align-items: center;
          margin: 3pt 0;
          font-size: 9pt;
        }
        
        .check-icon {
          width: 10pt;
          height: 10pt;
          border-radius: 50%;
          margin-right: 6pt;
          display: inline-block;
          flex-shrink: 0;
          position: relative;
        }
        
        .check-yes { 
          background: #22c55e; 
        }
        .check-yes::after {
          content: "✓";
          color: white;
          font-size: 7pt;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .check-unknown { 
          background: #f59e0b;
        }
        .check-unknown::after {
          content: "?";
          color: white;
          font-size: 7pt;
          font-weight: bold;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .check-no { 
          background: #ef4444;
        }
        .check-no::after {
          content: "✗";
          color: white;
          font-size: 7pt;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .scoring-breakdown {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(90pt, 1fr));
          gap: 8pt;
          margin: 12pt 0;
        }
        
        .scoring-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 3pt;
          padding: 10pt;
          text-align: center;
        }
        
        .scoring-card .score {
          font-size: 14pt;
          font-weight: 700;
          margin-bottom: 3pt;
        }
        
        .scoring-card .label {
          font-size: 8pt;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 6pt;
        }
        
        .scoring-card .details {
          font-size: 7pt;
          color: #9ca3af;
          line-height: 1.2;
        }
        
        .footer {
          background: #f8fafc;
          padding: 12pt;
          margin: 18pt -15pt -15pt -15pt;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 8pt;
          line-height: 1.3;
        }
        
        @media print {
          body { 
            padding: 8pt;
            font-size: 9pt;
          }
          
          .container {
            max-width: 100%;
          }
          
          .header {
            margin: -8pt -8pt 15pt -8pt;
            padding: 15pt;
          }
          
          .footer {
            margin: 15pt -8pt -8pt -8pt;
            padding: 10pt;
          }
          
          .section,
          .executive-summary,
          .assessment-summary,
          .recommendation-box {
            page-break-inside: avoid;
          }
          
          .summary-grid,
          .info-grid,
          .manual-grid,
          .scoring-breakdown {
            page-break-inside: avoid;
          }
          
          .data-table {
            font-size: 7pt;
          }
          
          .data-table th,
          .data-table td {
            padding: 3pt;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Dataset Analysis Report</h1>
          <div class="subtitle">Humanitarian AI Project Assessment</div>
          <div class="timestamp">Generated: ${timestamp}</div>
        </div>
        
        ${this.generateExecutiveSummary(data)}
        ${this.generateAnalysisTypeSection(data)}
        ${data.fileInfo ? this.generateFileInfoSection(data.fileInfo) : ''}
        ${data.statistics ? this.generateStatisticsSection(data.statistics) : ''}
        ${data.ethicalAnalysis ? this.generateEthicalAnalysisSection(data.ethicalAnalysis) : ''}
        ${data.manualResults ? this.generateManualAssessmentSection(data.manualResults) : ''}
        ${this.generateRecommendationsSection(data)}
        
        <div class="footer">
          <p><strong>Humanitarian AI Dataset Assessment</strong></p>
          <p>This report provides a comprehensive analysis of your dataset's suitability for humanitarian AI applications. For technical questions or implementation guidance, consult with your data science team.</p>
          <p>Report generated on ${timestamp} using automated analysis tools designed for humanitarian organizations.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private static generateExecutiveSummary(data: DatasetReportData): string {
    let overallScore = 0;
    let riskLevel = 'unknown';
    let summaryText = '';

    if (data.ethicalAnalysis) {
      overallScore = data.ethicalAnalysis.suitabilityScore;
      riskLevel = data.ethicalAnalysis.overallRiskLevel;
      summaryText = data.ethicalAnalysis.overallRecommendation;
    } else if (data.manualResults) {
      overallScore = data.manualResults.overallScore;
      riskLevel = overallScore >= 70 ? 'low' : overallScore >= 50 ? 'medium' : 'high';
      summaryText = overallScore >= 70 
        ? 'Manual assessment indicates strong potential for humanitarian AI development.'
        : overallScore >= 50 
        ? 'Manual assessment shows moderate potential with some areas requiring attention.'
        : 'Manual assessment suggests significant preparation needed before AI development.';
    } else if (data.statistics) {
      const completeness = data.statistics.qualityAssessment.completenessScore;
      overallScore = completeness;
      riskLevel = completeness >= 80 ? 'low' : completeness >= 60 ? 'medium' : 'high';
      summaryText = 'Statistical analysis completed. AI ethical analysis was unavailable for comprehensive assessment.';
    }

    const scoreClass = overallScore >= 70 ? 'score-high' : overallScore >= 50 ? 'score-medium' : 'score-low';

    return `
      <div class="executive-summary">
        <h2>Executive Summary</h2>
        <div class="summary-grid">
          <div class="summary-metric">
            <div class="value" style="color: ${overallScore >= 70 ? '#22c55e' : overallScore >= 50 ? '#f59e0b' : '#ef4444'}">${overallScore}%</div>
            <div class="label">Overall Suitability Score</div>
            <div class="score-bar">
              <div class="score-fill ${scoreClass}" style="width: ${overallScore}%"></div>
            </div>
          </div>
          <div class="summary-metric">
            <div class="risk-badge risk-${riskLevel}">${riskLevel.toUpperCase()}</div>
            <div class="label">Risk Assessment</div>
          </div>
        </div>
        <div class="recommendation-box">
          <h4>Key Recommendation</h4>
          <p>${summaryText}</p>
        </div>
      </div>
    `;
  }

  private static generateAnalysisTypeSection(data: DatasetReportData): string {
    const typeDescriptions = {
      'automatic_with_ai': 'Comprehensive automated analysis with AI-powered ethical assessment',
      'statistical_only': 'Statistical analysis with pattern-based privacy detection',
      'manual': 'Manual assessment conducted by project team'
    };

    const alertClass = data.analysisType === 'automatic_with_ai' ? 'alert-success' : 
                      data.analysisType === 'statistical_only' ? 'alert-warning' : 'alert-info';

    return `
      <div class="section">
        <h2>Analysis Overview</h2>
        <div class="alert ${alertClass}">
          <strong>Analysis Method:</strong> ${typeDescriptions[data.analysisType]}
          ${data.note ? `<br><em>Note: ${data.note}</em>` : ''}
        </div>
      </div>
    `;
  }

  private static generateFileInfoSection(fileInfo: FileInfo): string {
    const fileSizeMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
    const lastModified = new Date(fileInfo.lastModified).toLocaleDateString();

    return `
      <div class="section">
        <h2>Dataset Information</h2>
        <div class="info-grid">
          <div class="info-card">
            <div class="label">File Name</div>
            <div class="value">${fileInfo.name}</div>
          </div>
          <div class="info-card">
            <div class="label">File Size</div>
            <div class="value">${fileSizeMB} MB</div>
          </div>
          <div class="info-card">
            <div class="label">File Type</div>
            <div class="value">${fileInfo.type || 'Unknown'}</div>
          </div>
          <div class="info-card">
            <div class="label">Last Modified</div>
            <div class="value">${lastModified}</div>
          </div>
        </div>
      </div>
    `;
  }

  private static generateStatisticsSection(statistics: DatasetStatistics): string {
    const completenessClass = statistics.qualityAssessment.completenessScore >= 80 ? 'score-high' : 
                             statistics.qualityAssessment.completenessScore >= 60 ? 'score-medium' : 'score-low';
    
    const consistencyClass = statistics.qualityAssessment.consistencyScore >= 80 ? 'score-high' : 
                            statistics.qualityAssessment.consistencyScore >= 60 ? 'score-medium' : 'score-low';

    return `
      <div class="section">
        <h2>Statistical Analysis Results</h2>
        
        <h3>Dataset Overview</h3>
        <div class="info-grid">
          <div class="info-card">
            <div class="label">Total Records</div>
            <div class="value">${statistics.basicMetrics.totalRows.toLocaleString()}</div>
          </div>
          <div class="info-card">
            <div class="label">Data Fields</div>
            <div class="value">${statistics.basicMetrics.totalColumns}</div>
          </div>
          <div class="info-card">
            <div class="label">Duplicate Records</div>
            <div class="value">${statistics.basicMetrics.duplicateRows}</div>
          </div>
          <div class="info-card">
            <div class="label">Dataset Size</div>
            <div class="value">${(statistics.basicMetrics.fileSize / (1024 * 1024)).toFixed(2)} MB</div>
          </div>
        </div>

        <h3>Data Quality Metrics</h3>
        <div class="assessment-summary">
          <div style="margin-bottom: 12pt;">
            <strong>Data Completeness: ${statistics.qualityAssessment.completenessScore}%</strong>
            <div class="score-bar">
              <div class="score-fill ${completenessClass}" style="width: ${statistics.qualityAssessment.completenessScore}%"></div>
            </div>
            <small style="color: #6b7280;">Percentage of fields with valid data across all records</small>
          </div>
          <div>
            <strong>Data Consistency: ${statistics.qualityAssessment.consistencyScore}%</strong>
            <div class="score-bar">
              <div class="score-fill ${consistencyClass}" style="width: ${statistics.qualityAssessment.consistencyScore}%"></div>
            </div>
            <small style="color: #6b7280;">Uniformity and standardization of data formats and values</small>
          </div>
        </div>

        <h3>Privacy Risk Assessment</h3>
        ${this.generatePrivacySection(statistics.privacyRisks)}

        ${statistics.biasIndicators ? `
        <h3>Bias Indicators</h3>
        <div class="alert alert-info">
          <strong>Statistical Bias Analysis:</strong><br>
          ${statistics.biasIndicators.representationConcerns.length > 0 ? `
            <p>Representation concerns identified: ${statistics.biasIndicators.representationConcerns.length}</p>
            <ul style="margin: 6pt 0; padding-left: 12pt;">
              ${statistics.biasIndicators.representationConcerns.map(concern => `<li style="margin: 3pt 0;">${concern}</li>`).join('')}
            </ul>
          ` : '<p>No significant representation concerns identified through statistical analysis.</p>'}
          ${statistics.biasIndicators.smallGroupSizes.length > 0 ? `
            <p><strong>Small group sizes detected:</strong> ${statistics.biasIndicators.smallGroupSizes.join(', ')}</p>
          ` : ''}
        </div>
        ` : ''}

        <h3>Field Analysis</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Field Name</th>
              <th>Data Type</th>
              <th>Unique Values</th>
              <th>Missing Values</th>
              <th>Completeness</th>
            </tr>
          </thead>
          <tbody>
            ${statistics.columnAnalysis.map(col => {
              const completeness = ((statistics.basicMetrics.totalRows - col.nullCount) / statistics.basicMetrics.totalRows * 100).toFixed(1);
              return `
                <tr>
                  <td><strong>${col.name}</strong></td>
                  <td>${col.type}</td>
                  <td>${col.uniqueCount.toLocaleString()}</td>
                  <td>${col.nullCount.toLocaleString()}</td>
                  <td>${completeness}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  private static generatePrivacySection(privacyRisks: any): string {
    const riskLevel = privacyRisks.potentialIdentifiers.length === 0 ? 'low' : 
                     privacyRisks.potentialIdentifiers.length <= 3 ? 'medium' : 'high';

    return `
      <div class="privacy-section privacy-${riskLevel}">
        <h4>Statistical Pattern Detection Results</h4>
        <p>Automated analysis of data patterns for potential privacy-sensitive information:</p>
        
        ${privacyRisks.potentialIdentifiers.length > 0 ? `
          <div style="margin-top: 10pt;">
            <strong>Fields Flagged for Review:</strong>
            <div class="flagged-columns">
              ${privacyRisks.potentialIdentifiers.map((identifier: string) => 
                `<span class="flagged-column">${identifier}</span>`
              ).join('')}
            </div>
            <div class="alert alert-warning" style="margin-top: 10pt;">
              <strong>Important:</strong> These fields were flagged based on naming patterns and statistical characteristics. Manual review is recommended to determine if they contain personally identifiable information or other sensitive data relevant to your humanitarian context.
            </div>
          </div>
        ` : `
          <div class="alert alert-success">
            <strong>No Privacy Concerns Detected</strong><br>
            Statistical analysis did not identify fields with typical identifier characteristics. However, contextual review is still recommended for humanitarian data.
          </div>
        `}
      </div>
    `;
  }

  private static generateEthicalAnalysisSection(ethicalAnalysis: EthicalAnalysis): string {
    const riskColor = ethicalAnalysis.overallRiskLevel === 'low' ? 'success' : 
                     ethicalAnalysis.overallRiskLevel === 'medium' ? 'warning' : 'danger';
    
    const scoreClass = ethicalAnalysis.suitabilityScore >= 70 ? 'score-high' : 
                      ethicalAnalysis.suitabilityScore >= 50 ? 'score-medium' : 'score-low';

    return `
      <div class="section">
        <h2>AI Ethical Analysis</h2>
        
        <div class="assessment-summary">
          <h3>Overall Assessment</h3>
          <div class="summary-grid">
            <div class="summary-metric">
              <div class="value" style="color: ${ethicalAnalysis.suitabilityScore >= 70 ? '#22c55e' : ethicalAnalysis.suitabilityScore >= 50 ? '#f59e0b' : '#ef4444'}">${ethicalAnalysis.suitabilityScore}%</div>
              <div class="label">AI Suitability Score</div>
              <div class="score-bar">
                <div class="score-fill ${scoreClass}" style="width: ${ethicalAnalysis.suitabilityScore}%"></div>
              </div>
            </div>
            <div class="summary-metric">
              <div class="risk-badge risk-${ethicalAnalysis.overallRiskLevel}">${ethicalAnalysis.overallRiskLevel.toUpperCase()}</div>
              <div class="label">Overall Risk Level</div>
            </div>
          </div>
          
          <div class="recommendation-box">
            <h4>AI Analysis Recommendation</h4>
            <p>${ethicalAnalysis.overallRecommendation}</p>
          </div>
        </div>

        <h3>Privacy Assessment Details</h3>
        <div class="privacy-section privacy-${ethicalAnalysis.privacyEvaluation.riskLevel}">
          <h4>Privacy Risk Level: ${ethicalAnalysis.privacyEvaluation.riskLevel.toUpperCase()}</h4>
          
          ${ethicalAnalysis.privacyEvaluation.assessmentReasoning ? `
            <div style="margin: 10pt 0;">
              <strong>Assessment Reasoning:</strong>
              <p style="margin: 4pt 0; font-style: italic;">${ethicalAnalysis.privacyEvaluation.assessmentReasoning}</p>
            </div>
          ` : ''}

          ${ethicalAnalysis.privacyEvaluation.concerns.length > 0 ? `
            <div>
              <strong>Identified Privacy Concerns:</strong>
              <ul style="margin: 6pt 0; padding-left: 12pt;">
                ${ethicalAnalysis.privacyEvaluation.concerns.map(concern => `<li style="margin: 3pt 0;">${concern}</li>`).join('')}
              </ul>
            </div>
          ` : `
            <div class="alert alert-success">
              <strong>No significant privacy concerns identified</strong><br>
              The AI analysis did not detect privacy risks that would prevent humanitarian AI development.
            </div>
          `}
        </div>

        <h3>Bias and Representation Assessment</h3>
        <div class="alert alert-${ethicalAnalysis.biasAssessment.level === 'low' ? 'success' : ethicalAnalysis.biasAssessment.level === 'medium' ? 'warning' : 'danger'}">
          <strong>Bias Risk Level: ${ethicalAnalysis.biasAssessment.level.toUpperCase()}</strong>
          ${ethicalAnalysis.biasAssessment.concerns.length > 0 ? `
            <ul style="margin: 6pt 0; padding-left: 12pt;">
              ${ethicalAnalysis.biasAssessment.concerns.map(concern => `<li style="margin: 3pt 0;">${concern}</li>`).join('')}
            </ul>
          ` : '<p style="margin: 6pt 0;">No significant bias concerns identified in the dataset.</p>'}
        </div>

        ${ethicalAnalysis.scoringBreakdown ? this.generateScoringBreakdown(ethicalAnalysis.scoringBreakdown) : ''}
      </div>
    `;
  }

  private static generateScoringBreakdown(scoringBreakdown: any): string {
    const getScoreValue = (scoreObj: any): string => {
      if (typeof scoreObj === 'number') return scoreObj.toString();
      if (scoreObj && typeof scoreObj === 'object') {
        if (scoreObj.score !== undefined) return scoreObj.score.toString();
        if (scoreObj.value !== undefined) return scoreObj.value.toString();
      }
      return 'N/A';
    };

    const getScoreDetails = (scoreObj: any): string => {
      if (scoreObj && typeof scoreObj === 'object' && scoreObj.reasoning) {
        return scoreObj.reasoning;
      }
      return 'Automated analysis score';
    };

    return `
      <h3>Detailed Scoring Breakdown</h3>
      <div class="scoring-breakdown">
        <div class="scoring-card">
          <div class="score" style="color: #22c55e;">${getScoreValue(scoringBreakdown.privacy_score)}</div>
          <div class="label">Privacy Score</div>
          <div class="details">${getScoreDetails(scoringBreakdown.privacy_score)}</div>
        </div>
        <div class="scoring-card">
          <div class="score" style="color: #3b82f6;">${getScoreValue(scoringBreakdown.fairness_score)}</div>
          <div class="label">Fairness Score</div>
          <div class="details">${getScoreDetails(scoringBreakdown.fairness_score)}</div>
        </div>
        <div class="scoring-card">
          <div class="score" style="color: #8b5cf6;">${getScoreValue(scoringBreakdown.quality_score)}</div>
          <div class="label">Quality Score</div>
          <div class="details">${getScoreDetails(scoringBreakdown.quality_score)}</div>
        </div>
        <div class="scoring-card">
          <div class="score" style="color: #f59e0b;">${getScoreValue(scoringBreakdown.humanitarian_alignment)}</div>
          <div class="label">Humanitarian Alignment</div>
          <div class="details">${getScoreDetails(scoringBreakdown.humanitarian_alignment)}</div>
        </div>
      </div>
    `;
  }

  private static generateManualAssessmentSection(manualResults: ManualAssessmentResults): string {
    const overallClass = manualResults.overallScore >= 70 ? 'score-high' : 
                        manualResults.overallScore >= 50 ? 'score-medium' : 'score-low';

    return `
      <div class="section">
        <h2>Manual Assessment Results</h2>
        
        <div class="assessment-summary">
          <h3>Overall Assessment Score</h3>
          <div class="summary-metric" style="text-align: center; margin: 12pt 0;">
            <div class="value" style="color: ${manualResults.overallScore >= 70 ? '#22c55e' : manualResults.overallScore >= 50 ? '#f59e0b' : '#ef4444'}; font-size: 28pt;">${manualResults.overallScore}%</div>
            <div class="label" style="font-size: 11pt;">Overall Suitability Score</div>
            <div class="score-bar">
              <div class="score-fill ${overallClass}" style="width: ${manualResults.overallScore}%"></div>
            </div>
          </div>
          
          <div class="alert alert-info">
            <strong>Scoring Methodology:</strong><br>
            Dataset Quality Assessment: ${manualResults.datasetScore}% (70% weight) = ${Math.round(manualResults.datasetScore * 0.7)} points<br>
            Target Variable Assessment: ${manualResults.targetLabelScore}% (30% weight) = ${Math.round(manualResults.targetLabelScore * 0.3)} points<br>
            <strong>Combined Score: ${Math.round(manualResults.datasetScore * 0.7)} + ${Math.round(manualResults.targetLabelScore * 0.3)} = ${manualResults.overallScore}%</strong>
          </div>
        </div>

        <h3>Detailed Assessment Results</h3>
        <div class="manual-grid">
          <div>
            <h4 style="color: #1e40af;">Dataset Quality Assessment (${manualResults.datasetScore}%)</h4>
            ${manualResults.datasetChecks.map(check => `
              <div class="check-item">
                <span class="check-icon check-${check.answer}"></span>
                <span>${check.question}</span>
              </div>
            `).join('')}
          </div>

          <div>
            <h4 style="color: #059669;">Target Variable Assessment (${manualResults.targetLabelScore}%)</h4>
            ${manualResults.targetLabelChecks.map(check => `
              <div class="check-item">
                <span class="check-icon check-${check.answer}"></span>
                <span>${check.question}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="recommendation-box">
          <h4>Assessment Summary</h4>
          <p>${manualResults.overallScore >= 80
            ? 'Excellent suitability for humanitarian AI development. Your dataset and target definition show strong potential for successful implementation with appropriate technical expertise.'
            : manualResults.overallScore >= 60
            ? 'Good potential for humanitarian AI development. Address the identified concerns in your assessment before proceeding to ensure optimal results and ethical implementation.'
            : manualResults.overallScore >= 40
            ? 'Moderate suitability detected. Significant improvements to dataset quality or target variable definition are recommended before pursuing AI development.'
            : 'Substantial preparation required. Focus on strengthening your data foundation and clarifying your target outcomes before attempting AI implementation.'}</p>
        </div>
      </div>
    `;
  }

  private static generateRecommendationsSection(data: DatasetReportData): string {
    let recommendations: string[] = [];
    let nextSteps: string[] = [];

    if (data.statistics) {
      if (data.statistics.qualityAssessment.completenessScore < 80) {
        recommendations.push('Improve data completeness by addressing missing values and data collection gaps.');
        nextSteps.push('Review data collection processes and implement data validation procedures.');
      }
      if (data.statistics.privacyRisks.potentialIdentifiers.length > 0) {
        recommendations.push('Conduct thorough privacy review of flagged fields and implement appropriate anonymization strategies.');
        nextSteps.push('Consult with legal and data protection experts to ensure compliance with humanitarian data standards.');
      }
      if (data.statistics.basicMetrics.totalRows < 1000) {
        recommendations.push('Consider expanding dataset size for more robust AI model training.');
        nextSteps.push('Explore additional data sources or extend data collection timeline to increase sample size.');
      }
    }

    if (data.ethicalAnalysis) {
      if (data.ethicalAnalysis.overallRiskLevel !== 'low') {
        recommendations.push('Address ethical concerns identified in the AI analysis before proceeding to model development.');
        nextSteps.push('Implement additional safeguards and bias mitigation strategies in your AI development process.');
      }
      if (data.ethicalAnalysis.suitabilityScore < 70) {
        recommendations.push('Strengthen dataset quality and address ethical considerations to improve suitability for humanitarian AI applications.');
      }
      if (data.ethicalAnalysis.privacyEvaluation.concerns.length > 0) {
        recommendations.push('Implement specific privacy protection measures based on the identified concerns.');
        nextSteps.push('Develop a comprehensive data governance framework for your humanitarian AI project.');
      }
    }

    if (data.manualResults) {
      if (data.manualResults.overallScore < 70) {
        recommendations.push('Address the gaps identified in the manual assessment before proceeding with AI development.');
      }
      if (data.manualResults.datasetScore < data.manualResults.targetLabelScore) {
        recommendations.push('Focus on improving dataset quality as it forms the foundation for successful AI implementation.');
        nextSteps.push('Implement data quality improvement processes and regular data validation procedures.');
      } else if (data.manualResults.targetLabelScore < data.manualResults.datasetScore) {
        recommendations.push('Refine your target variable definition to ensure clear and measurable outcomes for AI training.');
        nextSteps.push('Collaborate with domain experts to better define and validate your prediction targets.');
      }
    }

    if (data.analysisType === 'statistical_only') {
      recommendations.push('Complete comprehensive ethical analysis when AI assessment tools become available for full evaluation.');
      nextSteps.push('Schedule follow-up assessment with AI ethical analysis to ensure responsible development practices.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your dataset demonstrates strong potential for humanitarian AI development with current quality and ethical standards.');
      nextSteps.push('Proceed with AI model development while maintaining focus on responsible AI practices and continuous monitoring.');
    }

    recommendations.push('Ensure all AI development follows humanitarian principles of humanity, neutrality, impartiality, and independence.');
    nextSteps.push('Establish monitoring systems to track AI performance and impact in humanitarian contexts.');
    nextSteps.push('Plan for regular model updates and validation as humanitarian situations evolve.');

    return `
      <div class="section">
        <h2>Recommendations and Next Steps</h2>
        
        <div class="recommendation-box">
          <h4>Key Recommendations for Your Humanitarian AI Project</h4>
          <ul class="recommendation-list">
            ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>

        <h3>Immediate Next Steps</h3>
        <div class="alert alert-info">
          <ul style="margin: 6pt 0; padding-left: 12pt;">
            ${nextSteps.map(step => `<li style="margin: 3pt 0;">${step}</li>`).join('')}
          </ul>
        </div>

        <h3>Long-term Considerations</h3>
        <div class="alert alert-warning">
          <strong>Ongoing Responsibilities:</strong>
          <ul style="margin: 6pt 0; padding-left: 12pt;">
            <li>Regular assessment of AI model performance and bias in real-world humanitarian contexts</li>
            <li>Continuous stakeholder engagement including affected communities and humanitarian partners</li>
            <li>Adherence to humanitarian data standards and international guidelines for responsible AI</li>
            <li>Documentation and transparency in AI decision-making processes for accountability</li>
          </ul>
        </div>
      </div>
    `;
  }

  private static downloadAsHTML(htmlContent: string, analysisType: string): void {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `humanitarian-ai-dataset-report-${analysisType}-${timestamp}.html`;
    
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      if (confirm('Report generated successfully! Would you like to print or save this report now?')) {
        printWindow.print();
      }
    }, 1000);
  }
}