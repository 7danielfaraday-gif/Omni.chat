"use client";

import { useState, useCallback, useRef } from "react";
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
import {
  ImageOff,
  Upload,
  Download,
  Trash2,
  FileImage,
  FileVideo,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

interface ProcessedFile {
  id: string;
  originalName: string;
  originalSize: number;
  cleanedSize: number;
  type: "image" | "video";
  status: "processing" | "done" | "error";
  downloadUrl?: string;
  errorMessage?: string;
  metadataRemoved: string[];
}

/**
 * Remove metadados EXIF de imagens usando Canvas API (client-side).
 * O Canvas redesenha a imagem sem EXIF, GPS, camera, datas etc.
 */
async function cleanImageMetadata(file: File): Promise<{
  blob: Blob;
  removed: string[];
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D nao disponivel"));
        return;
      }
      ctx.drawImage(img, 0, 0);

      // Determina formato de saida
      let mimeType = "image/png";
      let quality = 1.0;
      if (file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg")) {
        mimeType = "image/jpeg";
        quality = 0.95; // alta qualidade mantendo sem EXIF
      } else if (file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp")) {
        mimeType = "image/webp";
        quality = 0.95;
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Falha ao gerar imagem limpa"));
            return;
          }
          resolve({
            blob,
            removed: [
              "Dados GPS / Localizacao",
              "Modelo da Camera",
              "Data de Criacao",
              "Data de Modificacao",
              "Software de Edicao",
              "Orientacao EXIF",
              "Thumbnail embutida",
              "Comentarios e notas",
            ],
          });
        },
        mimeType,
        quality
      );
    };
    img.onerror = () => reject(new Error("Falha ao carregar imagem"));
    img.src = URL.createObjectURL(file);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MetadataCleaner() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) return;

    const newFile: ProcessedFile = {
      id,
      originalName: file.name,
      originalSize: file.size,
      cleanedSize: 0,
      type: isImage ? "image" : "video",
      status: "processing",
      metadataRemoved: [],
    };

    setFiles((prev) => [...prev, newFile]);

    try {
      if (isImage) {
        const result = await cleanImageMetadata(file);
        const downloadUrl = URL.createObjectURL(result.blob);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: "done" as const,
                  cleanedSize: result.blob.size,
                  downloadUrl,
                  metadataRemoved: result.removed,
                }
              : f
          )
        );
      } else {
        // Video: simula processamento (necessita backend com FFmpeg)
        await new Promise((r) => setTimeout(r, 1500));
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: "error" as const,
                  errorMessage:
                    "Videos requerem processamento no servidor (FFmpeg). " +
                    "Configure a rota POST /api/clean-video no backend. " +
                    "Comando: ffmpeg -i input.mp4 -map_metadata -1 -c copy output.mp4",
                }
              : f
          )
        );
      }
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "error" as const,
                errorMessage: err instanceof Error ? err.message : "Erro desconhecido",
              }
            : f
        )
      );
    }
  }, []);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      Array.from(fileList).forEach(processFile);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.downloadUrl) URL.revokeObjectURL(file.downloadUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const downloadFile = (file: ProcessedFile) => {
    if (!file.downloadUrl) return;
    const a = document.createElement("a");
    a.href = file.downloadUrl;
    const ext = file.originalName.split(".").pop() || "png";
    a.download = `limpo_${file.originalName.replace(`.${ext}`, "")}.${ext}`;
    a.click();
  };

  const clearAll = () => {
    files.forEach((f) => {
      if (f.downloadUrl) URL.revokeObjectURL(f.downloadUrl);
    });
    setFiles([]);
  };

  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <ImageOff className="h-7 w-7" />
          Limpador de Metadados
        </h1>
        <p className="text-muted-foreground mt-1">
          Remova dados EXIF, GPS, camera e datas de criacao dos seus criativos
          para evitar bloqueios em plataformas de trafego.
        </p>
      </div>

      {/* Drop Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
              transition-all duration-200
              ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              }
            `}
          >
            <Upload
              className={`h-12 w-12 mx-auto mb-4 ${
                isDragging ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <h3 className="text-lg font-semibold">
              {isDragging
                ? "Solte os arquivos aqui"
                : "Arraste e solte seus arquivos"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Suporta JPEG, PNG, WebP e MP4. Imagens sao processadas no
              navegador.
            </p>
            <Button variant="outline" className="mt-4" type="button">
              Selecionar Arquivos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Arquivos Processados</h2>
              <Badge variant="secondary">
                {doneCount}/{files.length} concluidos
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={clearAll} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Limpar Tudo
            </Button>
          </div>

          <div className="grid gap-3">
            {files.map((file) => (
              <Card key={file.id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Icone */}
                    <div className="p-2 rounded-lg bg-muted shrink-0">
                      {file.type === "image" ? (
                        <FileImage className="h-6 w-6 text-blue-500" />
                      ) : (
                        <FileVideo className="h-6 w-6 text-purple-500" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {file.originalName}
                        </span>
                        {file.status === "processing" && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        {file.status === "done" && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {file.status === "error" && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>

                      {file.status === "processing" && (
                        <Progress value={60} className="h-1.5 mt-2 [&>div]:bg-primary" />
                      )}

                      {file.status === "done" && (
                        <div className="mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.originalSize)} →{" "}
                            {formatFileSize(file.cleanedSize)}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {file.metadataRemoved.map((m, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {file.status === "error" && (
                        <p className="text-xs text-red-400 mt-1">
                          {file.errorMessage}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {file.status === "done" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile(file)}
                          className="gap-1"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Baixar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Backend API Info */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Nota: Processamento de Video (Backend)
          </CardTitle>
          <CardDescription className="text-xs">
            Para videos MP4, configure uma rota de API no backend com FFmpeg.
            Exemplo de rota Node.js:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto font-mono">{`// api/clean-video/route.ts (Next.js App Router)
import { exec } from "child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("video") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const id = randomUUID();
  const inputPath = path.join("/tmp", \`\${id}-input.mp4\`);
  const outputPath = path.join("/tmp", \`\${id}-output.mp4\`);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(inputPath, buffer);

  await new Promise((resolve, reject) => {
    exec(
      \`ffmpeg -i \${inputPath} -map_metadata -1 -c copy \${outputPath}\`,
      (err) => (err ? reject(err) : resolve(null))
    );
  });

  const cleaned = await readFile(outputPath);
  await unlink(inputPath);
  await unlink(outputPath);

  return new NextResponse(cleaned, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": \`attachment; filename="limpo_\${file.name}"\`,
    },
  });
}`}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
