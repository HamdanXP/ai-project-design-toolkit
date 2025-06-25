export const safeString = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if ((value as any).example && (value as any).outcome) {
      return `${(value as any).example} ${(value as any).outcome}`;
    }
    if ((value as any).description) {
      return String((value as any).description);
    }
    return JSON.stringify(value);
  }
  return String(value);
};

export const safeArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value))
    return value.map((item) => safeString(item)).filter(Boolean);
  if (typeof value === "string") return [value];
  return [safeString(value)];
};

import {
  Stethoscope,
  Wheat,
  GraduationCap,
  Droplet,
  AlertCircle,
  Home,
  TrendingUp,
  Target,
  Zap,
  Eye,
  BarChart,
  FileText,
  Image,
  Globe,
  Database,
  HelpCircle,
} from "lucide-react";
import type { ReactNode } from "react";

export const getCategoryIcon = (
  category?: string,
  type?: string,
): ReactNode => {
  const categoryLower = category?.toLowerCase() || "";
  const typeLower = type?.toLowerCase() || "";

  if (
    categoryLower.includes("health") ||
    categoryLower.includes("medical") ||
    categoryLower.includes("diagnosis")
  ) {
    return <Stethoscope size={16} className="text-red-500" />;
  }
  if (
    categoryLower.includes("food") ||
    categoryLower.includes("agriculture") ||
    categoryLower.includes("crop")
  ) {
    return <Wheat size={16} className="text-green-500" />;
  }
  if (
    categoryLower.includes("education") ||
    categoryLower.includes("learning")
  ) {
    return <GraduationCap size={16} className="text-blue-500" />;
  }
  if (categoryLower.includes("water") || categoryLower.includes("resource")) {
    return <Droplet size={16} className="text-cyan-500" />;
  }
  if (
    categoryLower.includes("disaster") ||
    categoryLower.includes("emergency")
  ) {
    return <AlertCircle size={16} className="text-orange-500" />;
  }
  if (categoryLower.includes("shelter") || categoryLower.includes("housing")) {
    return <Home size={16} className="text-purple-500" />;
  }
  if (
    categoryLower.includes("prediction") ||
    categoryLower.includes("forecasting")
  ) {
    return <TrendingUp size={16} className="text-blue-600" />;
  }
  if (
    categoryLower.includes("classification") ||
    categoryLower.includes("detection")
  ) {
    return <Target size={16} className="text-green-600" />;
  }
  if (categoryLower.includes("optimization")) {
    return <Zap size={16} className="text-yellow-600" />;
  }
  if (categoryLower.includes("monitoring")) {
    return <Eye size={16} className="text-purple-600" />;
  }
  if (categoryLower.includes("analysis")) {
    return <BarChart size={16} className="text-indigo-600" />;
  }
  if (typeLower.includes("text") || typeLower.includes("language")) {
    return <FileText size={16} className="text-secondary" />;
  }
  if (typeLower.includes("image") || typeLower.includes("vision")) {
    return <Image size={16} className="text-secondary" />;
  }
  if (typeLower.includes("geospatial")) {
    return <Globe size={16} className="text-secondary" />;
  }
  if (typeLower.includes("tabular") || typeLower.includes("database")) {
    return <Database size={16} className="text-secondary" />;
  }
  return <HelpCircle size={16} className="text-muted-foreground" />;
};
