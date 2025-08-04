import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DatasetStatistics, EthicalAnalysis } from "@/types/scoping-phase";
import { scopingApi } from './scoping-api';

export class DatasetAnalysisEngine {
  static async parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';'],
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          resolve(results.data);
        },
        error: (error) => reject(error)
      });
    });
  }

  static async parseExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: null,
            raw: false
          });
          
          if (jsonData.length === 0) {
            reject(new Error('Excel file appears to be empty'));
            return;
          }
          
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = (row as any[])[index] || null;
            });
            return obj;
          });
          
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  }

  static async parseJSON(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);
          
          if (Array.isArray(data)) {
            resolve(data);
          } else if (data && typeof data === 'object') {
            const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
            if (arrayKeys.length > 0) {
              resolve(data[arrayKeys[0]]);
            } else {
              resolve([data]);
            }
          } else {
            reject(new Error('JSON file does not contain valid data structure'));
          }
        } catch (error) {
          reject(new Error('Invalid JSON format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read JSON file'));
      reader.readAsText(file);
    });
  }

  static async parseFile(file: File): Promise<any[]> {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'csv':
      case 'tsv':
      case 'txt':
        return this.parseCSV(file);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(file);
      case 'json':
        return this.parseJSON(file);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  static detectColumnType(values: any[]): 'numeric' | 'categorical' | 'datetime' | 'text' | 'boolean' {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonNullValues.length === 0) return 'text';
    
    const numericValues = nonNullValues.filter(v => {
      if (typeof v === 'number') return true;
      if (typeof v === 'string') {
        const num = parseFloat(v.replace(/[,\s]/g, ''));
        return !isNaN(num) && isFinite(num);
      }
      return false;
    });
    if (numericValues.length / nonNullValues.length > 0.8) return 'numeric';
    
    const uniqueValues = new Set(nonNullValues);
    if (uniqueValues.size < nonNullValues.length * 0.1 && uniqueValues.size < 50) {
      return 'categorical';
    }
    
    return 'text';
  }

  static async analyzeDataset(file: File): Promise<DatasetStatistics> {
    const data = await this.parseFile(file);
    
    if (!data || data.length === 0) {
      throw new Error('No data found in file');
    }
    
    const columnNames = Object.keys(data[0] || {});
    
    if (columnNames.length === 0) {
      throw new Error('No columns detected in data');
    }
    
    const columnAnalysis = columnNames.map(colName => {
      const values = data.map(row => row[colName]);
      const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
      const uniqueValues = new Set(nonNullValues);
      
      return {
        name: colName,
        type: this.detectColumnType(values),
        nullCount: values.length - nonNullValues.length,
        uniqueCount: uniqueValues.size,
        potentialIdentifier: this.isPotentialIdentifier(colName, uniqueValues.size, values.length),
        totalRows: values.length
      };
    });
    
    const columnTypeCount: Record<string, number> = {};
    columnAnalysis.forEach(col => {
      columnTypeCount[col.type] = (columnTypeCount[col.type] || 0) + 1;
    });
    
    const basicMetrics = {
      totalRows: data.length,
      totalColumns: columnNames.length,
      columnTypes: columnTypeCount,
      missingValues: Object.fromEntries(columnAnalysis.map(col => [col.name, col.nullCount])),
      duplicateRows: this.countDuplicateRows(data),
      fileSize: file.size
    };
    
    const totalCells = basicMetrics.totalRows * basicMetrics.totalColumns;
    const missingCells = Object.values(basicMetrics.missingValues).reduce((a, b) => a + b, 0);
    const completenessScore = Math.round(((totalCells - missingCells) / totalCells) * 100);
    
    const qualityAssessment = {
      completenessScore,
      consistencyScore: this.calculateConsistencyScore(columnAnalysis),
      uniquenessRatio: columnAnalysis.reduce((sum, col) => sum + (col.uniqueCount / basicMetrics.totalRows), 0) / columnAnalysis.length
    };
    
    const privacyRisks = this.assessPrivacyRisks(columnAnalysis, basicMetrics.totalRows);
    const biasIndicators = this.detectBias(data, columnAnalysis);
    const distributionStats = this.calculateDistributionStats(data, columnAnalysis);
    
    return {
      basicMetrics,
      columnAnalysis,
      distributionStats,
      qualityAssessment,
      biasIndicators,
      privacyRisks
    };
  }

  static isPotentialIdentifier(columnName: string, uniqueCount: number, totalCount: number): boolean {
    const identifierPatterns = [
      /id|identifier|key/i,
      /name|firstname|lastname/i,
      /email|mail/i,
      /phone|tel/i
    ];
    
    return identifierPatterns.some(pattern => pattern.test(columnName)) || 
           (uniqueCount / totalCount) > 0.95;
  }

  static countDuplicateRows(data: any[]): number {
    const serialized = data.map(row => JSON.stringify(row));
    const unique = new Set(serialized);
    return data.length - unique.size;
  }

  static calculateConsistencyScore(columnAnalysis: any[]): number {
    let totalScore = 0;
    
    columnAnalysis.forEach(col => {
      let colScore = 100;
      const nullRate = col.nullCount / (col.uniqueCount + col.nullCount || 1);
      colScore -= nullRate * 30;
      totalScore += Math.max(0, colScore);
    });
    
    return Math.round(totalScore / columnAnalysis.length);
  }

  static assessPrivacyRisks(columnAnalysis: any[], totalRows: number) {
    const potentialIdentifiers: string[] = [];
    const quasiIdentifiers: string[] = [];
    
    columnAnalysis.forEach(col => {
      const uniquenessRatio = col.uniqueCount / totalRows;
      
      if (col.potentialIdentifier) {
        potentialIdentifiers.push(col.name);
      } else if (uniquenessRatio > 0.3 && uniquenessRatio < 0.95) {
        quasiIdentifiers.push(col.name);
      }
    });
    
    const avgUniqueness = columnAnalysis.reduce((sum, col) => sum + (col.uniqueCount / totalRows), 0) / columnAnalysis.length;
    
    return {
      potentialIdentifiers,
      quasiIdentifiers,
      uniquenessRatio: avgUniqueness,
    };
  }

  static detectBias(data: any[], columnAnalysis: any[]) {
    const demographicColumns = columnAnalysis.filter(col => {
      const patterns = [/gender|sex|age|race|country|income|education/i];
      return patterns.some(pattern => pattern.test(col.name)) && col.type === 'categorical';
    });
    
    const smallGroupSizes: string[] = [];
    const representationConcerns: string[] = [];
    const demographicBalance: Record<string, any> = {};
    
    demographicColumns.forEach(col => {
      const valueCounts: Record<string, number> = {};
      data.forEach(row => {
        const value = String(row[col.name] || 'unknown');
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      });
      
      const totalCount = Object.values(valueCounts).reduce((a, b) => a + b, 0);
      
      const distribution = Object.entries(valueCounts).map(([value, count]) => ({
        value,
        count: count as number,
        percentage: ((count as number) / totalCount) * 100
      }));
      
      demographicBalance[col.name] = distribution;
      
      const smallGroups = distribution.filter(d => d.percentage < 5);
      smallGroups.forEach(group => {
        smallGroupSizes.push(`${col.name}: "${group.value}" (${group.percentage.toFixed(1)}%)`);
      });
      
      const dominantGroups = distribution.filter(d => d.percentage > 80);
      if (dominantGroups.length > 0) {
        representationConcerns.push(`${col.name}: Heavily skewed toward "${dominantGroups[0].value}"`);
      }
    });
    
    return { demographicBalance, smallGroupSizes, representationConcerns };
  }

  static calculateDistributionStats(data: any[], columnAnalysis: any[]) {
    const numericalSummary: Record<string, any> = {};
    const categoricalSummary: Record<string, any> = {};
    let outlierCount = 0;
    
    columnAnalysis.forEach(col => {
      if (col.type === 'numeric') {
        const values = data.map(row => parseFloat(row[col.name])).filter(v => !isNaN(v));
        if (values.length > 0) {
          const sorted = values.sort((a, b) => a - b);
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          
          numericalSummary[col.name] = {
            count: values.length,
            mean,
            median: sorted[Math.floor(sorted.length * 0.5)],
            min: Math.min(...values),
            max: Math.max(...values)
          };
        }
      } else if (col.type === 'categorical') {
        const valueCounts: Record<string, number> = {};
        data.forEach(row => {
          const value = String(row[col.name] || 'unknown');
          valueCounts[value] = (valueCounts[value] || 0) + 1;
        });
        
        categoricalSummary[col.name] = {
          uniqueValues: col.uniqueCount,
          topValues: Object.entries(valueCounts)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([value, count]) => ({ value, count }))
        };
      }
    });
    
    return { numericalSummary, categoricalSummary, outlierCount };
  }
}

export class EthicalAnalysisService {
  static async analyzeEthics(
    statistics: DatasetStatistics,
    projectId: string
  ): Promise<EthicalAnalysis> {
    try {
      return await scopingApi.analyzeDatasetEthics(projectId, statistics);
    } catch (error) {
      console.error('Ethical analysis failed:', error);
      throw error;
    }
  }
}