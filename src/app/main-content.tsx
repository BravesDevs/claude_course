"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileSystemProvider } from "@/lib/contexts/file-system-context";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { FileTree } from "@/components/editor/FileTree";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeaderActions } from "@/components/HeaderActions";
import { Zap } from "lucide-react";

interface MainContentProps {
  user?: {
    id: string;
    email: string;
  } | null;
  project?: {
    id: string;
    name: string;
    messages: any[];
    data: any;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function MainContent({ user, project }: MainContentProps) {
  const [activeView, setActiveView] = useState<"preview" | "code">("preview");
  const [mobilePanel, setMobilePanel] = useState<"chat" | "preview">("chat");

  const previewCodeContent = (
    <div className="h-full overflow-hidden bg-white">
      {activeView === "preview" ? (
        <PreviewFrame />
      ) : (
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={28} minSize={20} maxSize={50}>
            <div className="h-full bg-neutral-50 border-r border-neutral-200">
              <FileTree />
            </div>
          </ResizablePanel>
          <ResizableHandle className="w-px bg-neutral-200 hover:bg-neutral-300 transition-colors" />
          <ResizablePanel defaultSize={72}>
            <CodeEditor />
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );

  return (
    <FileSystemProvider initialData={project?.data}>
      <ChatProvider projectId={project?.id} initialMessages={project?.messages}>
        <div className="h-screen w-screen overflow-hidden flex flex-col bg-white">

          {/* Unified header */}
          <header className="h-14 flex items-center px-4 border-b border-neutral-200 bg-white flex-shrink-0 gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-neutral-900 text-sm hidden sm:block">UIGen</span>
            </div>

            {/* Mobile panel toggle */}
            <div className="flex md:hidden ml-1 rounded-lg border border-neutral-200 p-0.5 bg-neutral-50">
              <button
                onClick={() => setMobilePanel("chat")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  mobilePanel === "chat"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setMobilePanel("preview")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  mobilePanel === "preview"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500"
                }`}
              >
                Preview
              </button>
            </div>

            {/* Desktop: Preview / Code tabs — centered */}
            <div className="hidden md:flex flex-1 justify-center">
              <Tabs
                value={activeView}
                onValueChange={(v) => setActiveView(v as "preview" | "code")}
              >
                <TabsList className="h-8 bg-neutral-100 border border-neutral-200 p-0.5 gap-0.5">
                  <TabsTrigger
                    value="preview"
                    className="h-7 px-4 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-500 transition-all"
                  >
                    Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value="code"
                    className="h-7 px-4 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-500 transition-all"
                  >
                    Code
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Auth actions */}
            <div className="ml-auto flex-shrink-0">
              <HeaderActions user={user} projectId={project?.id} />
            </div>
          </header>

          {/* Desktop layout — resizable panels */}
          <div className="hidden md:flex flex-1 min-h-0">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
                <div className="h-full flex flex-col bg-white border-r border-neutral-200">
                  <ChatInterface />
                </div>
              </ResizablePanel>

              <ResizableHandle className="w-px bg-neutral-200 hover:bg-blue-400 transition-colors" />

              <ResizablePanel defaultSize={65}>
                {previewCodeContent}
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          {/* Mobile layout — single panel at a time */}
          <div className="flex md:hidden flex-1 min-h-0 flex-col overflow-hidden">
            {mobilePanel === "chat" ? (
              <div className="flex-1 min-h-0 bg-white">
                <ChatInterface />
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col">
                {/* Mobile Preview/Code sub-tabs */}
                <div className="flex border-b border-neutral-200 bg-white px-3 py-2 gap-1">
                  <button
                    onClick={() => setActiveView("preview")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      activeView === "preview"
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-500"
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveView("code")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      activeView === "code"
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-500"
                    }`}
                  >
                    Code
                  </button>
                </div>
                <div className="flex-1 min-h-0">
                  {previewCodeContent}
                </div>
              </div>
            )}
          </div>

        </div>
      </ChatProvider>
    </FileSystemProvider>
  );
}
