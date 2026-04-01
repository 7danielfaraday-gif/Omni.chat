"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Fingerprint,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  collectFingerprint,
  type FingerprintResult,
  type FingerprintCategory,
} from "@/lib/fingerprint-engine";

function StatusIcon({ status }: { status: "ok" | "warning" | "error" }) {
  if (status === "ok") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === "warning") return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  return <XCircle className="h-5 w-5 text-red-500" />;
}

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const getColor = () => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 55) return "text-orange-500";
    return "text-red-500";
  };

  const getProgressColor = () => {
    if (score >= 85) return "[&>div]:bg-green-500";
    if (score >= 70) return "[&>div]:bg-yellow-500";
    if (score >= 55) return "[&>div]:bg-orange-500";
    return "[&>div]:bg-red-500";
  };

  const getShield = () => {
    if (score >= 70) return <ShieldCheck className="h-16 w-16 text-green-500" />;
    if (score >= 55) return <ShieldAlert className="h-16 w-16 text-yellow-500" />;
    return <ShieldX className="h-16 w-16 text-red-500" />;
  };

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {getShield()}
      <div className="text-center">
        <div className={`text-5xl font-bold ${getColor()}`}>{score}%</div>
        <div className="text-sm text-muted-foreground mt-1">
          Score de Autenticidade
        </div>
        <Badge
          variant={score >= 70 ? "default" : "destructive"}
          className="mt-2 text-base px-3 py-1"
        >
          Grade {grade}
        </Badge>
      </div>
      <div className="w-full max-w-xs">
        <Progress value={score} className={`h-3 ${getProgressColor()}`} />
      </div>
    </div>
  );
}

function CategoryCard({
  category,
}: {
  category: FingerprintCategory;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusLabel = {
    ok: "Normal",
    warning: "Atenção",
    error: "Problema",
  };

  const statusBadgeVariant = {
    ok: "outline" as const,
    warning: "secondary" as const,
    error: "destructive" as const,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon status={category.status} />
            <div>
              <CardTitle className="text-base">{category.name}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {category.score}/{category.maxScore} pontos
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusBadgeVariant[category.status]}>
              {statusLabel[category.status]}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <Progress
          value={(category.score / category.maxScore) * 100}
          className={`h-1.5 mt-2 ${
            category.status === "ok"
              ? "[&>div]:bg-green-500"
              : category.status === "warning"
              ? "[&>div]:bg-yellow-500"
              : "[&>div]:bg-red-500"
          }`}
        />
      </CardHeader>
      {expanded && category.details.length > 0 && (
        <CardContent className="pt-0">
          <Separator className="mb-3" />
          <ul className="space-y-2">
            {category.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{detail}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
      {expanded && category.details.length === 0 && (
        <CardContent className="pt-0">
          <Separator className="mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhuma anomalia detectada nesta categoria.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

function RawDataSection({ data }: { data: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Dados Brutos Coletados</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Ocultar" : "Mostrar"}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-80 font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      )}
    </Card>
  );
}

export function BrowserScanner() {
  const [result, setResult] = useState<FingerprintResult | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    setResult(null);
    try {
      // Delay artificial para mostrar progresso visual
      await new Promise((r) => setTimeout(r, 800));
      const data = await collectFingerprint();
      setResult(data);
    } catch (err) {
      console.error("Erro no scan:", err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Fingerprint className="h-7 w-7" />
          Browser Scanner
        </h1>
        <p className="text-muted-foreground mt-1">
          Auditoria avancada de fingerprinting do navegador com deteccao de
          anomalias, lies e automacao.
        </p>
      </div>

      {/* Botao de Scan */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              onClick={handleScan}
              disabled={scanning}
              className="gap-2 px-8"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Escaneando navegador...
                </>
              ) : (
                <>
                  <Fingerprint className="h-5 w-5" />
                  Iniciar Scan Completo
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center max-w-md">
              O scanner analisa User-Agent, GPU, WebRTC, Canvas, WebGL e
              variaveis de automacao para gerar um score de autenticidade.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      {result && (
        <>
          {/* Score Principal */}
          <Card>
            <CardContent>
              <ScoreGauge score={result.overallScore} grade={result.grade} />
            </CardContent>
          </Card>

          {/* Categorias */}
          <div className="grid gap-4 md:grid-cols-2">
            <CategoryCard category={result.categories.identity} />
            <CategoryCard category={result.categories.hardware} />
            <CategoryCard category={result.categories.leaks} />
            <CategoryCard category={result.categories.automation} />
          </div>

          {/* Dados Brutos */}
          <RawDataSection data={result.rawData} />
        </>
      )}
    </div>
  );
}
