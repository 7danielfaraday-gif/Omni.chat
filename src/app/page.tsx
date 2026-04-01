"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { BrowserScanner } from "@/components/tools/browser-scanner";
import { MetadataCleaner } from "@/components/tools/metadata-cleaner";
import { WhatsAppGenerator } from "@/components/tools/whatsapp-generator";

export type ToolId = "scanner" | "metadata" | "whatsapp";

export default function Home() {
  const [activeTool, setActiveTool] = useState<ToolId>("scanner");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeTool={activeTool} onSelectTool={setActiveTool} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {activeTool === "scanner" && <BrowserScanner />}
          {activeTool === "metadata" && <MetadataCleaner />}
          {activeTool === "whatsapp" && <WhatsAppGenerator />}
        </div>
      </main>
    </div>
  );
}
