"use client";

import { cn } from "@/lib/utils";
import {
  Fingerprint,
  ImageOff,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
} from "lucide-react";
import { useState } from "react";
import type { ToolId } from "@/app/page";

const tools = [
  {
    id: "scanner" as ToolId,
    label: "Browser Scanner",
    description: "Auditoria de navegador",
    icon: Fingerprint,
  },
  {
    id: "metadata" as ToolId,
    label: "Limpador de Metadados",
    description: "Remover EXIF de criativos",
    icon: ImageOff,
  },
  {
    id: "whatsapp" as ToolId,
    label: "Scripts WhatsApp",
    description: "Gerador de mensagens",
    icon: MessageSquareText,
  },
];

interface SidebarProps {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
}

export function Sidebar({ activeTool, onSelectTool }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-300 shrink-0",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">Omni MKT</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <div className="text-left">
                  <div>{tool.label}</div>
                  <div
                    className={cn(
                      "text-xs",
                      isActive
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {tool.description}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Omni MKT v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
