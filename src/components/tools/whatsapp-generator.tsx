"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquareText,
  Copy,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  Check,
  User,
  Phone,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  body: string;
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Boas-vindas",
    body: "Ola [NOME], tudo bem? Vi que voce se interessou pelo nosso produto. Posso te ajudar com mais informacoes?",
  },
  {
    id: "2",
    name: "Follow-up",
    body: "Oi [NOME]! Passando aqui pra saber se ficou alguma duvida sobre a nossa proposta. Estou a disposicao!",
  },
  {
    id: "3",
    name: "Oferta Especial",
    body: "Fala [NOME]! Temos uma condicao especial valida so ate hoje. Quer que eu te explique os detalhes?",
  },
  {
    id: "4",
    name: "Pos-venda",
    body: "Oi [NOME], tudo certo? Queria saber como esta sendo sua experiencia com o nosso produto. Qualquer coisa, conta comigo!",
  },
];

const STORAGE_KEY = "omni-mkt-whatsapp-templates";

function loadTemplates(): Template[] {
  if (typeof window === "undefined") return DEFAULT_TEMPLATES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return DEFAULT_TEMPLATES;
}

function saveTemplates(templates: Template[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // ignore
  }
}

function replaceVariables(text: string, name: string): string {
  return text.replace(/\[NOME\]/gi, name || "[NOME]");
}

function formatPhoneForWhatsApp(phone: string): string {
  // Remove tudo que nao e digito
  const digits = phone.replace(/\D/g, "");
  // Se ja comeca com 55 (Brasil), usa direto; senao, adiciona 55
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

function TemplateCard({
  template,
  clientName,
  clientPhone,
  onEdit,
  onDelete,
}: {
  template: Template;
  clientName: string;
  clientPhone: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const resolvedText = replaceVariables(template.body, clientName);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resolvedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = resolvedText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(resolvedText);
    const phoneParam = clientPhone.trim()
      ? formatPhoneForWhatsApp(clientPhone)
      : "";
    window.open(`https://wa.me/${phoneParam}?text=${encoded}`, "_blank");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{template.name}</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Template de mensagem
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-4 text-sm leading-relaxed mb-4">
          {clientName ? (
            <span>
              {resolvedText.split(clientName).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="font-bold text-primary bg-primary/10 px-1 rounded">
                      {clientName}
                    </span>
                  )}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-muted-foreground">{template.body}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5 flex-1"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copiar Texto
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleWhatsApp}
            className="gap-1.5 flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Enviar para WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  onSave: (data: { name: string; body: string }) => void;
}) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (template) {
      setName(template.name);
      setBody(template.body);
    } else {
      setName("");
      setBody("");
    }
  }, [template, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;
    onSave({ name: name.trim(), body: body.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {template ? "Editar Template" : "Novo Template"}
          </DialogTitle>
          <DialogDescription>
            Use [NOME] no texto para substituir pelo nome do cliente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tpl-name">Nome do Template</Label>
            <Input
              id="tpl-name"
              placeholder="Ex: Boas-vindas"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tpl-body">Mensagem</Label>
            <Textarea
              id="tpl-body"
              placeholder="Ola [NOME], tudo bem? ..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || !body.trim()}>
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function WhatsAppGenerator() {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [templates, setTemplates] = useState<Template[]>(() => loadTemplates());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Persist templates
  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  const handleSave = (data: { name: string; body: string }) => {
    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id ? { ...t, ...data } : t
        )
      );
    } else {
      const newTemplate: Template = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ...data,
      };
      setTemplates((prev) => [...prev, newTemplate]);
    }
    setEditingTemplate(null);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleNew = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <MessageSquareText className="h-7 w-7" />
          Gerador de Scripts WhatsApp
        </h1>
        <p className="text-muted-foreground mt-1">
          Gere mensagens personalizadas com templates pre-salvos para
          atendimento rapido e conversao.
        </p>
      </div>

      {/* Inputs do Cliente */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="client-name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome do Cliente
              </Label>
              <Input
                id="client-name"
                placeholder="Digite o nome do cliente..."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="text-lg h-12"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="client-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone (WhatsApp)
              </Label>
              <Input
                id="client-phone"
                placeholder="(11) 99999-9999"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="text-lg h-12"
              />
            </div>
            <Button onClick={handleNew} className="gap-2 h-12 shrink-0">
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          </div>
          {(clientName || clientPhone) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {clientName && (
                <Badge variant="secondary" className="gap-1">
                  <User className="h-3 w-3" />
                  {clientName}
                </Badge>
              )}
              {clientPhone && (
                <Badge variant="secondary" className="gap-1">
                  <Phone className="h-3 w-3" />
                  {clientPhone}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                — Os templates abaixo serao atualizados em tempo real
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid de Templates */}
      {templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              clientName={clientName}
              clientPhone={clientPhone}
              onEdit={() => handleEdit(template)}
              onDelete={() => handleDelete(template.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquareText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Nenhum template criado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em &quot;Novo Template&quot; para comecar.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Edicao/Criacao */}
      <TemplateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        onSave={handleSave}
      />
    </div>
  );
}
