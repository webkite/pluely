import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, GetLicense, Switch, Textarea } from "@/components";
import { 
  SendIcon, 
  SparklesIcon,
  Briefcase,
  Presentation,
  Table,
  Users,
  Brain,
  Globe,
  type LucideIcon,
  Check 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateConversationId } from "@/lib";
import { AttachedFile, RouterState } from "@/types";
import { ChatFiles, ChatAudio, ChatScreenshot, AudioRecorder } from "@/pages/chats/components";
import { useApp } from "@/contexts";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { MAX_FILES } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components";

// Define Super Agents data
type HomeAgent = {
  id: "general" | "project" | "slides" | "sheet" | "meeting";
  name: string;
  prompt: string;
  icon: LucideIcon;
};

const AGENTS: HomeAgent[] = [
  { id: "general", name: "Super Agent", prompt: "", icon: SparklesIcon },
  {
    id: "project",
    name: "AI Project",
    prompt: "I need help planning a new project. Can you act as a project manager?",
    icon: Briefcase,
  },
  {
    id: "slides",
    name: "AI Slides",
    prompt: "I need help creating a presentation slide deck. Can you help me outline it?",
    icon: Presentation,
  },
  {
    id: "sheet",
    name: "AI Sheet",
    prompt: "I need help with spreadsheets and data analysis. Can you act as a data analyst?",
    icon: Table,
  },
  {
    id: "meeting",
    name: "AI Meeting",
    prompt: "I have an important meeting coming up. Can you help me prepare and act as my advisor?",
    icon: Users,
  },
];

export const HomeInput = () => {
  const navigate = useNavigate();
  const { 
    hasActiveLicense, 
    screenshotConfiguration,
  } = useApp();
  
  const [inputValue, setInputValue] = useState("");
  const [isScreenshotLoading, setIsScreenshotLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isFilesPopoverOpen, setIsFilesPopoverOpen] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [isDeepThinkingEnabled, setIsDeepThinkingEnabled] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const isProcessingScreenshotRef = useRef(false);
  const hasCheckedPermissionRef = useRef(false);
  const screenshotInitiatedByThisContext = useRef(false);

  const canSubmit = useMemo(() => {
    return Boolean(inputValue.trim() || attachedFiles.length > 0);
  }, [attachedFiles.length, inputValue]);

  const fileToBase64 = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string)?.split(",")[1] || "";
        resolve(base64);
      };
      reader.onerror = reject;
    });
  }, []);

  const addFile = useCallback(
    async (file: File) => {
      try {
        const base64 = await fileToBase64(file);
        const newFile: AttachedFile = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          base64,
          size: file.size,
        };
        setAttachedFiles((prev) => [...prev, newFile]);
      } catch (error) {
        console.error("Failed to process file:", error);
      }
    },
    [fileToBase64]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      files.forEach((file) => {
        if (
          file.type.startsWith("image/") &&
          attachedFiles.length < MAX_FILES
        ) {
          addFile(file);
        }
      });

      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [addFile, attachedFiles.length]
  );

  const removeFile = useCallback((fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const onRemoveAllFiles = useCallback(() => {
    setAttachedFiles([]);
    setIsFilesPopoverOpen(false);
  }, []);

  const makeScreenshotFile = useCallback((base64: string): AttachedFile => {
    return {
      id: Date.now().toString(),
      name: `screenshot_${Date.now()}.png`,
      type: "image/png",
      base64,
      size: base64.length,
    };
  }, []);

  const buildInitialInput = useCallback(
    (userText: string) => {
      const trimmed = userText.trim();
      if (selectedAgent.id === "general" || !selectedAgent.prompt) {
        return trimmed;
      }
      if (!trimmed) return selectedAgent.prompt;
      return `${selectedAgent.prompt}\n\nUser Query: ${trimmed}`;
    },
    [selectedAgent]
  );

  const startConversation = useCallback(
    ({
      initialInput,
      initialFiles,
    }: {
      initialInput?: string;
      initialFiles?: AttachedFile[];
    }) => {
      const conversationId = generateConversationId("chat");

      const state: RouterState = {
        initialDeepThinkingEnabled: isDeepThinkingEnabled,
        initialWebSearchEnabled: isWebSearchEnabled,
        agentContext:
          selectedAgent.id === "general"
            ? undefined
            : { name: selectedAgent.name, prompt: selectedAgent.prompt },
      };
      if (initialInput && initialInput.trim()) state.initialInput = initialInput;
      if (initialFiles?.length) state.initialFiles = initialFiles;

      navigate(`/chats/view/${conversationId}`, { state });
    },
    [isDeepThinkingEnabled, isWebSearchEnabled, navigate, selectedAgent]
  );

  const captureScreenshot = useCallback(async () => {
    if (!hasActiveLicense) return;

    screenshotInitiatedByThisContext.current = true;
    setIsScreenshotLoading(true);

    try {
      // Check screen recording permission on macOS
      const platform = navigator.platform.toLowerCase();
      if (platform.includes("mac") && !hasCheckedPermissionRef.current) {
        const {
          checkScreenRecordingPermission,
          requestScreenRecordingPermission,
        } = await import("tauri-plugin-macos-permissions-api");

        const hasPermission = await checkScreenRecordingPermission();
        if (!hasPermission) {
          await requestScreenRecordingPermission();
          await new Promise((r) => setTimeout(r, 2000));
          const hasPermissionNow = await checkScreenRecordingPermission();
          if (!hasPermissionNow) {
            return;
          }
        }
        hasCheckedPermissionRef.current = true;
      }

      if (screenshotConfiguration.enabled) {
        const base64 = (await invoke("capture_to_base64")) as string;
        const screenshotFile = makeScreenshotFile(base64);

        if (screenshotConfiguration.mode === "auto") {
          const prompt = screenshotConfiguration.autoPrompt || "";
          startConversation({
            initialInput: buildInitialInput(prompt),
            initialFiles: [...attachedFiles, screenshotFile],
          });
        } else {
          // manual mode: just attach
          if (attachedFiles.length < MAX_FILES) {
            setAttachedFiles((prev) => [...prev, screenshotFile]);
          }
        }
        screenshotInitiatedByThisContext.current = false;
      } else {
        // Selection mode: open overlay
        isProcessingScreenshotRef.current = false;
        await invoke("start_screen_capture");
      }
    } catch (error) {
      console.error("Screenshot failed:", error);
      screenshotInitiatedByThisContext.current = false;
    } finally {
      setIsScreenshotLoading(false);
    }
  }, [
    attachedFiles,
    buildInitialInput,
    hasActiveLicense,
    makeScreenshotFile,
    screenshotConfiguration.autoPrompt,
    screenshotConfiguration.enabled,
    screenshotConfiguration.mode,
    startConversation,
  ]);

  // Listeners for screenshot
  useEffect(() => {
    let unlisten: any;
    const setupListener = async () => {
      unlisten = await listen("captured-selection", async (event: any) => {
        if (!screenshotInitiatedByThisContext.current) return;
        if (isProcessingScreenshotRef.current) return;

        isProcessingScreenshotRef.current = true;
        const base64 = event.payload;
        const screenshotFile = makeScreenshotFile(base64);

        try {
          if (screenshotConfiguration.mode === "auto") {
            const prompt = screenshotConfiguration.autoPrompt || "";
            startConversation({
              initialInput: buildInitialInput(prompt),
              initialFiles: [...attachedFiles, screenshotFile],
            });
          } else {
            if (attachedFiles.length < MAX_FILES) {
              setAttachedFiles((prev) => [...prev, screenshotFile]);
            }
          }
        } finally {
          setIsScreenshotLoading(false);
          screenshotInitiatedByThisContext.current = false;
          setTimeout(() => {
            isProcessingScreenshotRef.current = false;
          }, 100);
        }
      });
    };
    setupListener();
    return () => { if (unlisten) unlisten(); };
  }, [
    attachedFiles,
    buildInitialInput,
    makeScreenshotFile,
    screenshotConfiguration.autoPrompt,
    screenshotConfiguration.mode,
    startConversation,
  ]);

  useEffect(() => {
    const unlisten = listen("capture-closed", () => {
      setIsScreenshotLoading(false);
      isProcessingScreenshotRef.current = false;
      screenshotInitiatedByThisContext.current = false;
    });
    return () => { unlisten.then(fn => fn()); };
  }, []);

  const handleStart = useCallback(() => {
    if (!canSubmit) return;
    startConversation({
      initialInput: buildInitialInput(inputValue),
      initialFiles: attachedFiles,
    });
  }, [attachedFiles, buildInitialInput, canSubmit, inputValue, startConversation]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (hasActiveLicense && canSubmit && !isRecording) {
          handleStart();
        }
      }
    },
    [canSubmit, handleStart, hasActiveLicense, isRecording]
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const hasImages = Array.from(items).some((item) =>
        item.type.startsWith("image/")
      );
      if (!hasImages) return;

      e.preventDefault();
      const processedFiles: File[] = [];
      Array.from(items).forEach((item) => {
        if (
          item.type.startsWith("image/") &&
          attachedFiles.length + processedFiles.length < MAX_FILES
        ) {
          const f = item.getAsFile();
          if (f) processedFiles.push(f);
        }
      });

      await Promise.all(processedFiles.map((f) => addFile(f)));
    },
    [addFile, attachedFiles.length]
  );

  return (
    <div className="w-full max-w-2xl relative mb-4 group">
      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex flex-col bg-card border border-input shadow-sm rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden">
        {!hasActiveLicense && (
          <div className="select-none p-5 z-50 bg-primary/5 border border-primary/20 rounded-xl absolute top-4 left-4 right-4">
            <div className="max-w-sm mx-auto">
              <p className="text-sm font-medium text-center">
                You need an active license to use this feature.
              </p>

              <GetLicense buttonText="Get License" buttonClassName="w-full mt-2" />
            </div>
          </div>
        )}

        {/* Recording View overlay */}
        {isRecording && (
          <div className="px-4 pb-3">
            <AudioRecorder 
              onTranscriptionComplete={(text) => {
                setInputValue((prev) => (prev ? `${prev} ${text}` : text));
                setIsRecording(false);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              onCancel={() => setIsRecording(false)}
            />
          </div>
        )}

        {!isRecording && (
          <div className="relative px-4 pb-3 pt-3">
            <div className="absolute bottom-5 left-5 flex items-center gap-1 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-7 lg:size-9 rounded-lg lg:rounded-xl"
                    title={`Super Agent: ${selectedAgent.name}`}
                    disabled={!hasActiveLicense}
                  >
                    <selectedAgent.icon
                      className={`size-3 lg:size-4 ${
                        selectedAgent.id === "general"
                          ? "text-muted-foreground"
                          : "text-primary"
                      }`}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-56">
                  {AGENTS.map((agent) => (
                    <DropdownMenuItem
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className="gap-2 cursor-pointer"
                    >
                      {agent.id === selectedAgent.id && (
                        <Check className="size-3 text-primary" />
                      )}
                      <span
                        className={
                          agent.id === selectedAgent.id ? "font-medium" : "pl-5"
                        }
                      >
                        {agent.name}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <ChatFiles
                attachedFiles={attachedFiles}
                handleFileSelect={handleFileSelect}
                removeFile={removeFile}
                onRemoveAllFiles={onRemoveAllFiles}
                isLoading={false}
                isFilesPopoverOpen={isFilesPopoverOpen}
                setIsFilesPopoverOpen={setIsFilesPopoverOpen}
                disabled={!hasActiveLicense}
              />
              
              <ChatScreenshot 
                screenshotConfiguration={screenshotConfiguration}
                attachedFiles={attachedFiles}
                isLoading={false}
                captureScreenshot={captureScreenshot}
                isScreenshotLoading={isScreenshotLoading}
                disabled={!hasActiveLicense}
              />

              <ChatAudio 
                micOpen={micOpen}
                setMicOpen={setMicOpen}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                disabled={!hasActiveLicense}
              />

              {/* Deep Thinking Toggle */}
              <div className="flex items-center gap-1 ml-1 bg-muted/20 p-1 rounded-md border border-white/5 h-9">
                <Switch
                  checked={isDeepThinkingEnabled}
                  onCheckedChange={setIsDeepThinkingEnabled}
                  className="scale-75 origin-center"
                  title="Enable Deep Thinking"
                  disabled={!hasActiveLicense}
                />
                <Brain
                  className={`size-3 lg:size-4 ${
                    isDeepThinkingEnabled ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>

              {/* Web Search Toggle */}
              <div className="flex items-center gap-1 ml-1 bg-muted/20 p-1 rounded-md border border-white/5 h-9">
                <Switch
                  checked={isWebSearchEnabled}
                  onCheckedChange={setIsWebSearchEnabled}
                  className="scale-75 origin-center"
                  title="Enable Web Search"
                  disabled={!hasActiveLicense}
                />
                <Globe
                  className={`size-3 lg:size-4 ${
                    isWebSearchEnabled ? "text-blue-500" : "text-muted-foreground"
                  }`}
                />
              </div>
            </div>

            <Textarea
              ref={inputRef}
              placeholder={`Ask ${selectedAgent.id === "general" ? "anything" : selectedAgent.name}...`}
              className="pr-12 pl-2 resize-none pb-12 pt-3 text-base bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={2}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onPaste={handlePaste}
              autoFocus
              disabled={!hasActiveLicense}
            />

            <Button 
              size="icon" 
              className="size-7 lg:size-9 rounded-lg lg:rounded-xl absolute right-5 bottom-5"
              onClick={handleStart}
              disabled={!hasActiveLicense || !canSubmit}
            >
              <SendIcon className="size-3 lg:size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

