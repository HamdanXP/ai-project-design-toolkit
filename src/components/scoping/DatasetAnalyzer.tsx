import { useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Upload,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Brain,
  Download,
  Eye,
  EyeOff,
  Calculator,
  FileText,
  Shield,
  Database,
  Image,
  HardDrive,
  Wifi,
  HelpCircle,
  ChevronDown,
  Info,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { StepHeading } from "./common/StepHeading";
import {
  DatasetAnalysisEngine,
  EthicalAnalysisService,
} from "@/lib/dataset-analysis-utils";
import { DatasetReportGenerator } from "@/components/scoping/data-analyzer/DatasetReportGenerator";
import { ScoringBreakdownCard } from "@/components/scoping/data-analyzer/ScoringBreakdownCard";
import { ManualDatasetAssessment } from "@/components/scoping/data-analyzer/ManualDatasetAssessment";
import {
  FileInfo,
  FormatDetection,
  DatasetStatistics,
  EthicalAnalysis,
  ManualAssessmentResults,
  DataSuitabilityCheck,
} from "@/types/scoping-phase";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const LARGE_FILE_WARNING = 50 * 1024 * 1024; // 50MB

const SUPPORTED_FORMATS = {
  csv: { name: "CSV (Comma Separated Values)", support: "full" as const },
  tsv: { name: "TSV (Tab Separated Values)", support: "full" as const },
  txt: { name: "Text File (with delimiters)", support: "partial" as const },
  json: { name: "JSON", support: "full" as const },
  jsonl: { name: "JSON Lines", support: "full" as const },
  xlsx: { name: "Excel Spreadsheet", support: "full" as const },
  xls: { name: "Excel Spreadsheet (Legacy)", support: "full" as const },
};

const CONVERTIBLE_FORMATS = {
  dta: { name: "STATA Data File", instructions: "Export as CSV from STATA" },
  sav: { name: "SPSS Data File", instructions: "Export as CSV from SPSS" },
  rds: {
    name: "R Data File",
    instructions: "Export as CSV from R using write.csv()",
  },
  parquet: {
    name: "Parquet File",
    instructions: "Convert to CSV using pandas or other tools",
  },
  feather: {
    name: "Feather File",
    instructions: "Convert to CSV using pandas",
  },
};

const DATA_TYPE_SCENARIOS = [
  {
    icon: Image,
    title: "Images, Videos, Audio",
    description: "Photos, satellite imagery, recordings, multimedia files",
    guidance:
      "Use manual assessment to evaluate data quality, representation, and ethical considerations for your media files.",
  },
  {
    icon: Database,
    title: "Databases & APIs",
    description: "SQL databases, REST APIs, data warehouses",
    guidance:
      "Export a sample dataset to CSV/Excel format, or use manual assessment to evaluate your data access and quality.",
  },
  {
    icon: HardDrive,
    title: "Multiple Files",
    description: "Folders with many files, distributed datasets",
    guidance:
      "Combine into a single file if possible, or use manual assessment to evaluate your overall data landscape.",
  },
  {
    icon: Wifi,
    title: "Streaming/Live Data",
    description: "Real-time feeds, sensor data, social media streams",
    guidance:
      "Capture a representative sample and export to CSV, or use manual assessment to evaluate data patterns and availability.",
  },
];

export const DatasetAnalyzer = ({
  moveToPreviousStep,
  moveToNextStep,
}: {
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
}) => {
  const [isRetryingAI, setIsRetryingAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    datasetAnalysisState,
    setDatasetAnalysisState,
    datasetManualResults,
    setDatasetManualResults,
    datasetFileSizeWarning,
    setDatasetFileSizeWarning,
    datasetShowRawData,
    setDatasetShowRawData,
    setSuitabilityChecks,
    clearDatasetAnalysis,
  } = useProject();

  const detectFileFormat = useCallback((file: File): FormatDetection => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";

    if (SUPPORTED_FORMATS[extension as keyof typeof SUPPORTED_FORMATS]) {
      const format =
        SUPPORTED_FORMATS[extension as keyof typeof SUPPORTED_FORMATS];
      return {
        detectedFormat: format.name,
        confidence: "high",
        supportLevel: format.support,
      };
    }

    if (CONVERTIBLE_FORMATS[extension as keyof typeof CONVERTIBLE_FORMATS]) {
      const format =
        CONVERTIBLE_FORMATS[extension as keyof typeof CONVERTIBLE_FORMATS];
      return {
        detectedFormat: format.name,
        confidence: "high",
        supportLevel: "manual",
        suggestions: [format.instructions],
      };
    }

    const multimediaExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "mp4",
      "avi",
      "wav",
      "mp3",
    ];
    const databaseExtensions = ["db", "sqlite", "mdb", "accdb"];

    if (multimediaExtensions.includes(extension)) {
      return {
        detectedFormat: `${extension.toUpperCase()} (Multimedia)`,
        confidence: "high",
        supportLevel: "manual",
        suggestions: ["Use manual assessment for multimedia datasets"],
      };
    }

    if (databaseExtensions.includes(extension)) {
      return {
        detectedFormat: `${extension.toUpperCase()} (Database)`,
        confidence: "high",
        supportLevel: "manual",
        suggestions: ["Export data to CSV format or use manual assessment"],
      };
    }

    return {
      detectedFormat: `Unknown format (${extension || "no extension"})`,
      confidence: "low",
      supportLevel: "unsupported",
      suggestions: [
        "Convert to CSV, Excel, or JSON format",
        "Use manual assessment instead",
      ],
    };
  }, []);

  const validateFileSize = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size (${(file.size / 1024 / 1024).toFixed(
        1
      )}MB) exceeds maximum limit of ${
        MAX_FILE_SIZE / 1024 / 1024
      }MB. Please use a smaller file or manual assessment.`;
    }

    if (file.size > LARGE_FILE_WARNING) {
      return `Large file detected (${(file.size / 1024 / 1024).toFixed(
        1
      )}MB). Processing may take longer than usual.`;
    }

    return null;
  }, []);

  const retryAIAnalysis = useCallback(async () => {
    if (!datasetAnalysisState.statistics) return;

    setIsRetryingAI(true);

    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      setIsRetryingAI(false);
      return;
    }

    try {
      const ethicalAnalysis = await EthicalAnalysisService.analyzeEthics(
        datasetAnalysisState.statistics,
        projectId
      );

      setDatasetAnalysisState((prev) => ({
        ...prev,
        ethicalAnalysis,
      }));

      updateProjectContextWithAI(datasetAnalysisState.statistics, ethicalAnalysis);
    } catch (error) {
      console.warn("AI ethical analysis retry failed:", error);
    } finally {
      setIsRetryingAI(false);
    }
  }, [datasetAnalysisState.statistics, setDatasetAnalysisState]);

  const analyzeFile = useCallback(
    async (file: File) => {
      const sizeWarning = validateFileSize(file);
      if (sizeWarning && file.size > MAX_FILE_SIZE) {
        setDatasetAnalysisState({
          stage: "error",
          error: sizeWarning,
          fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          },
        });
        return;
      }

      setDatasetFileSizeWarning(sizeWarning);

      setDatasetAnalysisState({
        stage: "analyzing",
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        },
        analysisStartTime: Date.now(),
        statistics: undefined,
        ethicalAnalysis: undefined,
      });

      const formatDetection = detectFileFormat(file);

      setDatasetAnalysisState((prev) => ({
        ...prev,
        formatDetection,
      }));

      if (
        formatDetection.supportLevel === "unsupported" ||
        formatDetection.supportLevel === "manual"
      ) {
        setDatasetAnalysisState((prev) => ({
          ...prev,
          stage: "unsupported",
        }));
        return;
      }

      try {
        const statistics = await DatasetAnalysisEngine.analyzeDataset(file);

        setDatasetAnalysisState((prev) => ({
          ...prev,
          statistics,
          stage: "ethicalAnalysis",
        }));

        const searchParams = new URLSearchParams(location.search);
        const projectId = searchParams.get("projectId");

        if (!projectId) {
          throw new Error("Project ID is required for ethical analysis");
        }

        try {
          const ethicalAnalysis = await EthicalAnalysisService.analyzeEthics(
            statistics,
            projectId
          );

          setDatasetAnalysisState((prev) => ({
            ...prev,
            ethicalAnalysis,
            stage: "complete",
          }));

          updateProjectContextWithAI(statistics, ethicalAnalysis);
        } catch (ethicalError) {
          console.warn("AI ethical analysis unavailable:", ethicalError);

          setDatasetAnalysisState((prev) => ({
            ...prev,
            stage: "complete",
          }));

          updateProjectContextStatisticalOnly(statistics);
        }
      } catch (error) {
        setDatasetAnalysisState((prev) => ({
          ...prev,
          stage: "error",
          error: error instanceof Error ? error.message : "Analysis failed",
        }));
      }
    },
    [detectFileFormat, validateFileSize, setDatasetAnalysisState, setDatasetFileSizeWarning]
  );

  const updateProjectContextWithAI = useCallback(
    (statistics: DatasetStatistics, ethicalAnalysis: EthicalAnalysis) => {
      const riskLevelToAnswer = (
        riskLevel: string
      ): "yes" | "unknown" | "no" => {
        if (riskLevel === "low") return "yes";
        if (riskLevel === "medium") return "unknown";
        return "no";
      };

      const suitabilityChecks: DataSuitabilityCheck[] = [
        {
          id: "data_completeness",
          question: "Data completeness and quality assessment",
          answer:
            statistics.qualityAssessment.completenessScore >= 80
              ? "yes"
              : statistics.qualityAssessment.completenessScore >= 60
              ? "unknown"
              : "no",
          description: `Statistical analysis: Completeness: ${statistics.qualityAssessment.completenessScore}%, Quality Score: ${statistics.qualityAssessment.consistencyScore}%`,
        },
        {
          id: "population_representativeness",
          question: "Population representation and bias assessment",
          answer: riskLevelToAnswer(ethicalAnalysis.biasAssessment.level),
          description: `AI analysis: Bias level: ${ethicalAnalysis.biasAssessment.level}. ${ethicalAnalysis.biasAssessment.concerns.length} concerns identified.`,
        },
        {
          id: "privacy_ethics",
          question: "Privacy and ethical considerations",
          answer: riskLevelToAnswer(
            ethicalAnalysis.privacyEvaluation.riskLevel
          ),
          description: `AI analysis: Privacy risk: ${ethicalAnalysis.privacyEvaluation.riskLevel}. Context-aware assessment completed.`,
        },
        {
          id: "quality_sufficiency",
          question: "Data volume and quality sufficiency",
          answer:
            statistics.basicMetrics.totalRows >= 1000 &&
            statistics.qualityAssessment.completenessScore >= 80
              ? "yes"
              : statistics.basicMetrics.totalRows >= 500
              ? "unknown"
              : "no",
          description: `Statistical analysis: ${statistics.basicMetrics.totalRows.toLocaleString()} rows, ${
            statistics.basicMetrics.totalColumns
          } columns analyzed`,
        },
        {
          id: "ai_overall_score",
          question: "AI-powered overall assessment",
          answer:
            ethicalAnalysis.suitabilityScore >= 70
              ? "yes"
              : ethicalAnalysis.suitabilityScore >= 50
              ? "unknown"
              : "no",
          description: `AI analysis overall score: ${ethicalAnalysis.suitabilityScore}%`,
        },
      ];

      setSuitabilityChecks(suitabilityChecks);
    },
    [setSuitabilityChecks]
  );

  const updateProjectContextStatisticalOnly = useCallback(
    (statistics: DatasetStatistics) => {
      const suitabilityChecks: DataSuitabilityCheck[] = [
        {
          id: "data_completeness",
          question: "Data completeness and quality assessment",
          answer:
            statistics.qualityAssessment.completenessScore >= 80
              ? "yes"
              : statistics.qualityAssessment.completenessScore >= 60
              ? "unknown"
              : "no",
          description: `Statistical analysis: Completeness: ${statistics.qualityAssessment.completenessScore}%, Quality Score: ${statistics.qualityAssessment.consistencyScore}%`,
        },
        {
          id: "population_representativeness",
          question: "Population representation and bias assessment",
          answer: "unknown",
          description: `Statistical analysis: ${datasetAnalysisState.statistics?.biasIndicators?.representationConcerns?.length || 0} representation concerns identified through statistical analysis`,
        },
        {
          id: "privacy_ethics",
          question: "Privacy and ethical considerations",
          answer: "unknown",
          description: `Statistical analysis: ${statistics.privacyRisks.potentialIdentifiers.length} columns flagged by pattern detection. Comprehensive privacy assessment requires additional analysis.`,
        },
        {
          id: "quality_sufficiency",
          question: "Data volume and quality sufficiency",
          answer:
            statistics.basicMetrics.totalRows >= 1000 &&
            statistics.qualityAssessment.completenessScore >= 80
              ? "yes"
              : statistics.basicMetrics.totalRows >= 500
              ? "unknown"
              : "no",
          description: `Statistical analysis: ${statistics.basicMetrics.totalRows.toLocaleString()} rows, ${
            statistics.basicMetrics.totalColumns
          } columns analyzed`,
        },
      ];

      setSuitabilityChecks(suitabilityChecks);
    },
    [setSuitabilityChecks, datasetAnalysisState.statistics]
  );

  const handleManualAssessmentComplete = useCallback(
    (results: ManualAssessmentResults) => {
      setDatasetManualResults(results);

      const typedDatasetChecks: DataSuitabilityCheck[] =
        results.datasetChecks.map((check) => ({
          id: check.id,
          question: check.question,
          answer: check.answer as "yes" | "no" | "unknown",
          description: check.description,
        }));

      const typedTargetLabelChecks: DataSuitabilityCheck[] =
        results.targetLabelChecks.map((check) => ({
          id: check.id,
          question: check.question,
          answer: check.answer as "yes" | "no" | "unknown",
          description: check.description,
        }));

      const allChecks = [...typedDatasetChecks, ...typedTargetLabelChecks];
      setSuitabilityChecks(allChecks);

      setDatasetAnalysisState((prev) => ({
        ...prev,
        stage: "complete",
      }));
    },
    [setSuitabilityChecks, setDatasetManualResults, setDatasetAnalysisState]
  );

  const exportReport = useCallback(() => {
    if (datasetAnalysisState.statistics && datasetAnalysisState.ethicalAnalysis) {
      const reportData = {
        analysisType: "automatic_with_ai" as const,
        fileInfo: datasetAnalysisState.fileInfo,
        analysisTimestamp: new Date().toISOString(),
        statistics: {
          ...datasetAnalysisState.statistics,
          basicMetrics: {
            ...datasetAnalysisState.statistics.basicMetrics,
            fileSize: datasetAnalysisState.fileInfo?.size || datasetAnalysisState.statistics.basicMetrics.fileSize || 0,
          },
        },
        ethicalAnalysis: datasetAnalysisState.ethicalAnalysis,
      };

      DatasetReportGenerator.generateReport(reportData);
    } else if (datasetAnalysisState.statistics) {
      const reportData = {
        analysisType: "statistical_only" as const,
        fileInfo: datasetAnalysisState.fileInfo,
        analysisTimestamp: new Date().toISOString(),
        statistics: {
          ...datasetAnalysisState.statistics,
          basicMetrics: {
            ...datasetAnalysisState.statistics.basicMetrics,
            fileSize: datasetAnalysisState.fileInfo?.size || datasetAnalysisState.statistics.basicMetrics.fileSize || 0,
          },
        },
        note: "AI ethical analysis was unavailable for this dataset",
      };

      DatasetReportGenerator.generateReport(reportData);
    } else if (datasetManualResults) {
      const reportData = {
        analysisType: "manual" as const,
        analysisTimestamp: new Date().toISOString(),
        manualResults: {
          ...datasetManualResults,
          datasetChecks: datasetManualResults.datasetChecks.map(check => ({
            ...check,
            description: check.description || `Manual assessment: ${check.question}`,
          })),
          targetLabelChecks: datasetManualResults.targetLabelChecks.map(check => ({
            ...check,
            description: check.description || `Manual assessment: ${check.question}`,
          })),
        },
      };

      DatasetReportGenerator.generateReport(reportData);
    }
  }, [datasetAnalysisState, datasetManualResults]);

  const handleFileSelect = useCallback(
    (file: File) => {
      setDatasetFileSizeWarning(null);
      analyzeFile(file);
    },
    [analyzeFile, setDatasetFileSizeWarning]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleClearAnalysis = useCallback(() => {
    clearDatasetAnalysis();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [clearDatasetAnalysis]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <StepHeading stepNumber={4} title="Dataset Analysis" />
          {(datasetAnalysisState.stage !== "upload" || datasetManualResults) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAnalysis}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear Results
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-4">
              Upload your dataset for comprehensive analysis, or use our manual
              assessment for any data type.
            </p>

            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg mb-4">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-primary mb-1">
                  Privacy Protected
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your raw data never leaves your browser. Only statistical
                  summaries are used for AI analysis - no personal information
                  is transmitted.
                </p>
              </div>
            </div>
          </div>
        </div>
        {datasetAnalysisState.stage === "upload" && (
          <div className="space-y-8">
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 cursor-pointer border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="p-6 rounded-full bg-primary/10">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Upload Your Dataset
                  </h3>
                  <p className="text-muted-foreground text-lg mb-4">
                    Drop your file here or click to browse
                  </p>
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary">
                      <CheckCircle className="h-4 w-4" />
                      Supports: CSV, Excel, JSON, TSV files
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
                    </p>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept=".csv,.xlsx,.xls,.json,.jsonl,.txt,.tsv"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground font-medium">
                  or
                </span>
              </div>
            </div>

            <Card
              className="border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors cursor-pointer group"
              onClick={() => setDatasetAnalysisState({ stage: "manual" })}
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-700 mb-2">
                        Manual Assessment
                      </h3>
                      <p className="text-green-600">
                        Works with any data type - no file upload required
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-green-600 group-hover:text-green-700 transition-colors" />
                </div>
              </CardContent>
            </Card>

            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
                <span className="font-medium">
                  Can't upload your data? Click here for guidance
                </span>
                <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {DATA_TYPE_SCENARIOS.map((scenario, index) => (
                  <Card key={index} className="border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <scenario.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">
                            {scenario.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {scenario.description}
                          </p>
                          <p className="text-xs text-primary">
                            {scenario.guidance}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </details>
          </div>
        )}

        {datasetFileSizeWarning && (
          <div className="p-4 border border-yellow-500/20 bg-yellow-500/10 rounded-lg mb-6">
            <div className="flex items-center text-yellow-700 dark:text-yellow-300">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="font-medium">File Size Notice</span>
            </div>
            <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
              {datasetFileSizeWarning}
            </p>
          </div>
        )}

        {datasetAnalysisState.fileInfo && datasetAnalysisState.formatDetection && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {datasetAnalysisState.formatDetection.supportLevel === "full" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{datasetAnalysisState.fileInfo.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {datasetAnalysisState.formatDetection.detectedFormat} •{" "}
                    {(datasetAnalysisState.fileInfo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Badge
                  variant={
                    datasetAnalysisState.formatDetection.supportLevel === "full"
                      ? "default"
                      : "secondary"
                  }
                >
                  {datasetAnalysisState.formatDetection.supportLevel === "full"
                    ? "Ready to Analyze"
                    : "Manual Assessment Needed"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {datasetAnalysisState.stage === "analyzing" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-medium">Analyzing Dataset</p>
            <p className="text-sm text-muted-foreground">
              Processing your data securely in your browser...
            </p>
            {datasetFileSizeWarning && datasetFileSizeWarning.includes("Large file") && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                Large file detected - this may take a few moments
              </p>
            )}
          </div>
        )}

        {datasetAnalysisState.stage === "ethicalAnalysis" && (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            </div>
            <p className="text-lg font-medium">Getting AI Ethical Analysis</p>
            <p className="text-sm text-muted-foreground">
              Analyzing statistical summary for bias and privacy risks...
            </p>
          </div>
        )}

        {datasetAnalysisState.statistics && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <h3 className="font-semibold">Dataset Statistics</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatasetShowRawData(!datasetShowRawData)}
                >
                  {datasetShowRawData ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {datasetShowRawData ? "Hide" : "Show"} Details
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Rows:</span>
                    <span className="ml-2 font-medium">
                      {datasetAnalysisState.statistics.basicMetrics.totalRows.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Total Columns:
                    </span>
                    <span className="ml-2 font-medium">
                      {datasetAnalysisState.statistics.basicMetrics.totalColumns}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completeness:</span>
                    <span className="ml-2 font-medium">
                      {
                        datasetAnalysisState.statistics.qualityAssessment
                          .completenessScore
                      }
                      %
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Duplicate Rows:
                    </span>
                    <span className="ml-2 font-medium">
                      {datasetAnalysisState.statistics.basicMetrics.duplicateRows}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">
                  Statistical Pattern Detection
                </h4>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Automated pattern detection for potential privacy-related
                    columns
                  </p>

                  {datasetAnalysisState.statistics.privacyRisks.potentialIdentifiers
                    .length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Pattern-Flagged Columns:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {datasetAnalysisState.statistics.privacyRisks.potentialIdentifiers.map(
                          (identifier, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded text-xs"
                            >
                              {identifier}
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Flagged based on column names and uniqueness patterns
                      </p>
                    </div>
                  )}

                  {datasetAnalysisState.statistics.privacyRisks.potentialIdentifiers
                    .length === 0 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">
                        No obvious identifier patterns detected
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {datasetShowRawData && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Column Analysis</h4>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Column</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Unique</th>
                          <th className="text-left p-2">Missing</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datasetAnalysisState.statistics.columnAnalysis.map(
                          (col, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-medium">{col.name}</td>
                              <td className="p-2">{col.type}</td>
                              <td className="p-2">{col.uniqueCount}</td>
                              <td className="p-2">{col.nullCount}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {datasetAnalysisState.ethicalAnalysis && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="font-semibold">AI Ethical Analysis</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-lg mb-4 text-center">
                  Dataset Assessment Summary
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">
                      {datasetAnalysisState.ethicalAnalysis.suitabilityScore}%
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Overall Suitability
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          datasetAnalysisState.ethicalAnalysis.suitabilityScore >= 70
                            ? "bg-green-500"
                            : datasetAnalysisState.ethicalAnalysis.suitabilityScore >=
                              50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${datasetAnalysisState.ethicalAnalysis.suitabilityScore}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div
                      className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-sm font-bold mb-2 ${
                        datasetAnalysisState.ethicalAnalysis.overallRiskLevel === "low"
                          ? "bg-green-500/20 text-green-700 dark:text-green-300 border-2 border-green-500/30"
                          : datasetAnalysisState.ethicalAnalysis.overallRiskLevel ===
                            "medium"
                          ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-2 border-yellow-500/30"
                          : "bg-red-500/20 text-red-700 dark:text-red-300 border-2 border-red-500/30"
                      }`}
                    >
                      {datasetAnalysisState.ethicalAnalysis.overallRiskLevel.toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Risk Assessment
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-200 dark:border-blue-700">
                  <h5 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                    Recommendation
                  </h5>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {datasetAnalysisState.ethicalAnalysis.overallRecommendation}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy Assessment Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        datasetAnalysisState.ethicalAnalysis.privacyEvaluation
                          .riskLevel === "low"
                          ? "bg-green-500/20 text-green-700 dark:text-green-300"
                          : datasetAnalysisState.ethicalAnalysis.privacyEvaluation
                              .riskLevel === "medium"
                          ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                          : "bg-red-500/20 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {datasetAnalysisState.ethicalAnalysis.privacyEvaluation.riskLevel.toUpperCase()}{" "}
                      PRIVACY RISK
                    </span>
                  </div>

                  {datasetAnalysisState.ethicalAnalysis.privacyEvaluation
                    .assessmentReasoning && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Assessment Reasoning:</strong>{" "}
                        {
                          datasetAnalysisState.ethicalAnalysis.privacyEvaluation
                            .assessmentReasoning
                        }
                      </p>
                    </div>
                  )}

                  {datasetAnalysisState.ethicalAnalysis.privacyEvaluation.concerns
                    .length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Privacy Concerns:
                      </p>
                      <ul className="text-sm space-y-1">
                        {datasetAnalysisState.ethicalAnalysis.privacyEvaluation.concerns.map(
                          (concern, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-orange-500 mt-1">•</span>
                              <span className="text-foreground">{concern}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {datasetAnalysisState.ethicalAnalysis.scoringBreakdown && (
                <div>
                  <h4 className="font-medium mb-3">
                    Detailed Scoring Breakdown
                  </h4>
                  <ScoringBreakdownCard
                    scoringBreakdown={
                      datasetAnalysisState.ethicalAnalysis.scoringBreakdown
                    }
                  />
                </div>
              )}

              {(datasetAnalysisState.ethicalAnalysis.biasAssessment.concerns.length >
                0 ||
                datasetAnalysisState.ethicalAnalysis.privacyEvaluation.concerns
                  .length > 0) && (
                <div>
                  <h4 className="font-medium mb-3">Key Concerns</h4>
                  <ul className="text-sm space-y-2">
                    {[
                      ...datasetAnalysisState.ethicalAnalysis.biasAssessment.concerns,
                      ...datasetAnalysisState.ethicalAnalysis.privacyEvaluation
                        .concerns,
                    ]
                      .slice(0, 5)
                      .map((concern, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span className="text-foreground">{concern}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {datasetAnalysisState.statistics &&
          !datasetAnalysisState.ethicalAnalysis &&
          datasetAnalysisState.stage === "complete" && (
            <Card className="mb-6 border-blue-200 dark:border-blue-200/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Statistical Analysis Only
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                      AI ethical analysis is temporarily unavailable. Your
                      dataset has been analyzed using statistical methods only.
                    </p>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 mt-3">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Privacy Assessment Limitation
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        Without AI analysis, privacy assessment is limited to
                        basic pattern detection. The statistical flagging may
                        include false positives.
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        For accurate privacy risk assessment considering your
                        humanitarian context, please try again when AI analysis
                        is available.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryAIAnalysis}
                    disabled={isRetryingAI}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRetryingAI ? "animate-spin" : ""
                      }`}
                    />
                    {isRetryingAI ? "Retrying..." : "Retry AI Analysis"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {datasetManualResults && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Manual Assessment Results</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    datasetManualResults.overallScore >= 70
                      ? "bg-green-500/20 text-green-700 dark:text-green-300"
                      : datasetManualResults.overallScore >= 50
                      ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                      : "bg-red-500/20 text-red-700 dark:text-red-300"
                  }`}
                >
                  {datasetManualResults.overallScore >= 70
                    ? "HIGH SUITABILITY"
                    : datasetManualResults.overallScore >= 50
                    ? "MEDIUM SUITABILITY"
                    : "LOW SUITABILITY"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Overall Assessment Score</span>
                  <span className="text-lg font-bold">
                    {datasetManualResults.overallScore}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      datasetManualResults.overallScore >= 70
                        ? "bg-green-500"
                        : datasetManualResults.overallScore >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${datasetManualResults.overallScore}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 dark:bg-muted/20 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4" />
                    <span className="font-medium">
                      Manual Assessment Calculation:
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-blue-700 dark:text-blue-300">
                        Dataset Quality
                      </div>
                      <div>{datasetManualResults.datasetScore}% × 70% weight</div>
                      <div className="font-medium">
                        = {Math.round(datasetManualResults.datasetScore * 0.7)} points
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-300">
                        Target Variable
                      </div>
                      <div>{datasetManualResults.targetLabelScore}% × 30% weight</div>
                      <div className="font-medium">
                        = {Math.round(datasetManualResults.targetLabelScore * 0.3)}{" "}
                        points
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-muted-foreground/30">
                    <div className="font-medium">
                      Total: {Math.round(datasetManualResults.datasetScore * 0.7)} +{" "}
                      {Math.round(datasetManualResults.targetLabelScore * 0.3)} ={" "}
                      {datasetManualResults.overallScore}%
                    </div>
                  </div>
                  <div className="text-xs opacity-75 mt-2">
                    Dataset quality weighted higher as it forms the foundation
                    for AI model training
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">
                    Dataset Assessment ({datasetManualResults.datasetScore}%)
                  </h4>
                  <div className="space-y-1">
                    {datasetManualResults.datasetChecks.map((check, index) => (
                      <div key={index} className="flex items-center text-sm">
                        {check.answer === "yes" ? (
                          <CheckCircle className="h-3 w-3 mr-2 text-green-600 dark:text-green-400" />
                        ) : check.answer === "unknown" ? (
                          <AlertTriangle className="h-3 w-3 mr-2 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-2 text-red-600 dark:text-red-400" />
                        )}
                        <span className="truncate text-foreground">
                          {check.question}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">
                    Target Variable ({datasetManualResults.targetLabelScore}%)
                  </h4>
                  <div className="space-y-1">
                    {datasetManualResults.targetLabelChecks.map((check, index) => (
                      <div key={index} className="flex items-center text-sm">
                        {check.answer === "yes" ? (
                          <CheckCircle className="h-3 w-3 mr-2 text-green-600 dark:text-green-400" />
                        ) : check.answer === "unknown" ? (
                          <AlertTriangle className="h-3 w-3 mr-2 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-2 text-red-600 dark:text-red-400" />
                        )}
                        <span className="truncate text-foreground">
                          {check.question}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 dark:bg-blue-500/10 dark:border-blue-500/30 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                  Assessment Summary
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {datasetManualResults.overallScore >= 80
                    ? "Your manual assessment indicates excellent suitability for AI development. Both your dataset and target variable show strong potential for successful humanitarian AI implementation."
                    : datasetManualResults.overallScore >= 60
                    ? "Your assessment shows good potential for AI development. Address any concerns identified in the questionnaire before proceeding to ensure optimal results."
                    : datasetManualResults.overallScore >= 40
                    ? "Your assessment indicates moderate suitability. Consider strengthening your dataset quality or refining your target variable definition before AI development."
                    : "Your assessment suggests significant preparation is needed. Focus on improving data quality and clarifying your target variable before attempting AI development."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {datasetAnalysisState.stage === "unsupported" &&
          datasetAnalysisState.formatDetection && (
            <Card className="mb-6 border-amber-200 dark:border-amber-200/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-6">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      Format Requires Conversion or Manual Analysis
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      The file format "
                      {datasetAnalysisState.formatDetection.detectedFormat}" cannot be
                      automatically analyzed.
                    </p>
                  </div>
                </div>

                {datasetAnalysisState.formatDetection.suggestions && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Suggestions:</h4>
                    <ul className="text-sm space-y-1">
                      {datasetAnalysisState.formatDetection.suggestions.map(
                        (suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-amber-500 mt-1">•</span>
                            {suggestion}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Upload className="h-5 w-5 text-primary" />
                        <h4 className="font-medium text-primary">
                          Convert & Re-upload
                        </h4>
                      </div>
                      <div className="space-y-2 mb-4">
                        <h5 className="text-xs font-medium text-muted-foreground">
                          Supported formats:
                        </h5>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {Object.values(SUPPORTED_FORMATS).map(
                            (format, index) => (
                              <div
                                key={index}
                                className="text-muted-foreground"
                              >
                                • {format.name}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => setDatasetAnalysisState({ stage: "upload" })}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Try Different File
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/20 dark:border-green-400/20 bg-green-500/5 dark:bg-green-400/5 hover:bg-green-500/10 dark:hover:bg-green-400/10 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h4 className="font-medium text-green-700 dark:text-green-300">
                          Manual Assessment
                        </h4>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                        Comprehensive evaluation that works with any data type,
                        including target variable assessment.
                      </p>
                      <Button
                        onClick={() => setDatasetAnalysisState({ stage: "manual" })}
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                      >
                        Continue with Manual Assessment
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}

        {datasetAnalysisState.stage === "manual" && (
          <ManualDatasetAssessment
            onComplete={handleManualAssessmentComplete}
            onPrevious={() => setDatasetAnalysisState({ stage: "upload" })}
          />
        )}

        {datasetAnalysisState.stage === "error" && (
          <Card className="border-destructive/20 bg-destructive/5 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-destructive">
                    Analysis Failed
                  </h4>
                  <p className="text-sm text-destructive/80 mt-1">
                    {datasetAnalysisState.error}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setDatasetAnalysisState({ stage: "upload" })}
                  variant="outline"
                  size="sm"
                >
                  Try Different File
                </Button>
                <Button
                  onClick={() => setDatasetAnalysisState({ stage: "manual" })}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                >
                  Switch to Manual Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (datasetAnalysisState.stage === "manual") {
              setDatasetAnalysisState({ stage: "upload" });
            } else {
              moveToPreviousStep();
            }
          }}
        >
          {datasetAnalysisState.stage === "manual" ? "Back to Upload" : "Previous"}
        </Button>

        <div className="flex gap-2">
          {datasetAnalysisState.stage === "complete" &&
            (datasetAnalysisState.ethicalAnalysis ||
              datasetAnalysisState.statistics ||
              datasetManualResults) && (
              <>
                <Button variant="outline" onClick={exportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button onClick={moveToNextStep}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
        </div>
      </CardFooter>
    </Card>
  );
};