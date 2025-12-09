import { useState, useRef, useEffect } from "react";
import { Input, Button } from "@/components";
import { 
  Search, 
  SendIcon, 
  SparklesIcon,
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
const AGENTS = [
  { id: "general", name: "General Assistant", prompt: "" },
  { id: "project", name: "AI Project", prompt: "I need help planning a new project. Can you act as a project manager?" },
  { id: "slides", name: "AI Slides", prompt: "I need help creating a presentation slide deck. Can you help me outline it?" },
  { id: "spreadsheet", name: "AI Spreadsheet", prompt: "I need help with spreadsheets and data analysis. Can you act as a data analyst?" },
  { id: "meeting", name: "AI Meeting Advisor", prompt: "I have an important meeting coming up. Can you help me prepare and act as my advisor?" },
];

export const HomeInput = () => {
  const navigate = useNavigate();
  const { 
    hasActiveLicense, 
    screenshotConfiguration,
  } = useApp();
  
  const [inputValue, setInputValue] = useState("");
  // Removed unused isLoading
  const [isScreenshotLoading, setIsScreenshotLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isFilesPopoverOpen, setIsFilesPopoverOpen] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  
  // Removed unused fileInputRef
  const isProcessingScreenshotRef = useRef(false);
  const hasCheckedPermissionRef = useRef(false);
  const screenshotInitiatedByThisContext = useRef(false);

  // File handling
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string)?.split(",")[1] || "";
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      if (file.type.startsWith("image/") && attachedFiles.length < MAX_FILES) {
        try {
          const base64 = await fileToBase64(file);
          const newFile: AttachedFile = {
            id: Date.now().toString() + Math.random().toString(),
            name: file.name,
            type: file.type,
            base64,
            size: file.size,
          };
          setAttachedFiles(prev => [...prev, newFile]);
        } catch (error) {
          console.error("Failed to process file:", error);
        }
      }
    }
    
    // Reset input
    e.target.value = "";
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const onRemoveAllFiles = () => {
    setAttachedFiles([]);
    setIsFilesPopoverOpen(false);
  };

  // Screenshot handling
  const handleScreenshot = async (base64: string) => {
    if (attachedFiles.length >= MAX_FILES) return;

    const newFile: AttachedFile = {
      id: Date.now().toString(),
      name: `screenshot_${Date.now()}.png`,
      type: "image/png",
      base64,
      size: base64.length,
    };
    
    setAttachedFiles(prev => [...prev, newFile]);
  };

  const captureScreenshot = async () => {
    if (!hasActiveLicense) return;
    
    screenshotInitiatedByThisContext.current = true;
    setIsScreenshotLoading(true);

    try {
      // Check permissions on macOS (simplified logic from hooks)
      const platform = navigator.platform.toLowerCase();
      if (platform.includes("mac") && !hasCheckedPermissionRef.current) {
        const { checkScreenRecordingPermission, requestScreenRecordingPermission } = 
          await import("tauri-plugin-macos-permissions-api");
        
        if (!(await checkScreenRecordingPermission())) {
          await requestScreenRecordingPermission();
          // Wait and check again
          await new Promise(r => setTimeout(r, 2000));
          if (!(await checkScreenRecordingPermission())) {
            setIsScreenshotLoading(false);
            return; // Permission denied
          }
        }
        hasCheckedPermissionRef.current = true;
      }

      if (screenshotConfiguration.enabled) {
        const base64 = await invoke("capture_to_base64");
        await handleScreenshot(base64 as string);
        screenshotInitiatedByThisContext.current = false;
      } else {
        isProcessingScreenshotRef.current = false;
        await invoke("start_screen_capture");
      }
    } catch (error) {
      console.error("Screenshot failed:", error);
      setIsScreenshotLoading(false);
      screenshotInitiatedByThisContext.current = false;
    } finally {
      if (screenshotConfiguration.enabled) {
        setIsScreenshotLoading(false);
      }
    }
  };

  // Listeners for screenshot
  useEffect(() => {
    let unlisten: any;
    const setupListener = async () => {
      unlisten = await listen("captured-selection", async (event: any) => {
        if (!screenshotInitiatedByThisContext.current) return;
        if (isProcessingScreenshotRef.current) return;

        isProcessingScreenshotRef.current = true;
        const base64 = event.payload;
        await handleScreenshot(base64);
        
        setIsScreenshotLoading(false);
        screenshotInitiatedByThisContext.current = false;
        setTimeout(() => { isProcessingScreenshotRef.current = false; }, 100);
      });
    };
    setupListener();
    return () => { if (unlisten) unlisten(); };
  }, [attachedFiles]);

  useEffect(() => {
    const unlisten = listen("capture-closed", () => {
      setIsScreenshotLoading(false);
      isProcessingScreenshotRef.current = false;
      screenshotInitiatedByThisContext.current = false;
    });
    return () => { unlisten.then(fn => fn()); };
  }, []);

  // Start Conversation
  const handleStart = () => {
    if ((!inputValue.trim() && attachedFiles.length === 0)) return;
    
    const conversationId = generateConversationId("chat");
    
    // Construct initial input combining user text and agent prompt if needed
    // Or pass agent context separately. Here we follow the existing pattern.
    // If agent prompt is present and input is empty, use agent prompt.
    // If both present, prepend agent prompt? Or just let the Chat View handle context?
    // The prompt from SuperAgentGrid was used as 'initialInput'.
    // Let's respect the user's explicit input, but maybe prepend the agent instruction if it's not "General".
    
    let finalInput = inputValue;
    if (selectedAgent.id !== "general" && selectedAgent.prompt && !inputValue.trim()) {
      finalInput = selectedAgent.prompt;
    } else if (selectedAgent.id !== "general" && selectedAgent.prompt) {
      // Combine them intelligently or just pass context?
      // For simplicity, we'll append user input to agent prompt if both exist.
      finalInput = `${selectedAgent.prompt}\n\nUser Query: ${inputValue}`;
    }

    const state: RouterState = {
      initialInput: finalInput,
      initialFiles: attachedFiles
    };

    navigate(`/chats/view/${conversationId}`, { state });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleStart();
    }
  };

  return (
    <div className="w-full max-w-2xl relative mb-4 group">
      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex flex-col bg-card border border-input shadow-sm rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden">
        
        {/* Top Bar: Agent Selector & Input */}
        <div className="flex items-center px-4 pt-3">
          {/* Agent Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2 h-8 gap-1 px-2 text-muted-foreground hover:text-foreground"
              >
                {selectedAgent.id === "general" ? (
                  <Search className="size-4" />
                ) : (
                  <SparklesIcon className="size-4 text-primary" />
                )}
                <span className="text-xs font-medium max-w-[100px] truncate">
                  {selectedAgent.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {AGENTS.map(agent => (
                <DropdownMenuItem 
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="gap-2 cursor-pointer"
                >
                  {agent.id === selectedAgent.id && <Check className="size-3 text-primary" />}
                  <span className={agent.id === selectedAgent.id ? "font-medium" : "pl-5"}>
                    {agent.name}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${selectedAgent.name === "General Assistant" ? "anything" : selectedAgent.name}...`}
            className="border-none shadow-none focus-visible:ring-0 px-0 h-10 text-lg bg-transparent placeholder:text-muted-foreground/50 flex-1"
            autoFocus
            disabled={isRecording}
          />
        </div>

        {/* Recording View overlay */}
        {isRecording && (
          <div className="px-4 pb-3">
            <AudioRecorder 
              onTranscriptionComplete={(text) => {
                setInputValue(prev => prev ? `${prev} ${text}` : text);
                setIsRecording(false);
              }}
              onCancel={() => setIsRecording(false)}
            />
          </div>
        )}

        {/* Bottom Bar: Actions */}
        {!isRecording && (
          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            <div className="flex items-center gap-1">
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
            </div>

            <Button 
              size="icon" 
              className="size-8 rounded-xl"
              onClick={handleStart}
              disabled={!inputValue.trim() && attachedFiles.length === 0}
            >
              <SendIcon className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

