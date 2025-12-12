import {
  Badge,
  Card,
  Empty,
  Button,
  Markdown,
  Textarea,
  GetLicense,
  Switch,
} from "@/components";
import { getConversationById } from "@/lib";
import { ChatConversation, RouterState } from "@/types";
import {
  MessageCircleIcon,
  SparklesIcon,
  UserIcon,
  SendIcon,
  Loader2,
  Brain,
  Globe,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import moment from "moment";
import { useParams, useLocation } from "react-router-dom";
import { PageLayout } from "@/layouts";
import { useChatCompletion } from "@/hooks";
import { useApp } from "@/contexts";
import {
  ChatAudio,
  ChatScreenshot,
  ChatFiles,
  AudioRecorder,
} from ".";

const View = () => {
  const { conversationId } = useParams();
  const location = useLocation(); // Import useLocation from react-router-dom
  const { hasActiveLicense } = useApp();
  const [messages, setMessages] = useState<ChatConversation | null>(null);
  const hasAutoSubmittedRef = useRef(false); // Import useRef

  const completion = useChatCompletion(
    conversationId as string,
    messages,
    setMessages
  );

  // Handle auto-submit from navigation state (e.g. from Home page)
  useEffect(() => {
    const state = location.state as RouterState | null;
    
    if (
      (state?.initialInput || state?.initialFiles?.length) && 
      !hasAutoSubmittedRef.current && 
      !completion.isLoading && 
      !messages?.messages.length
    ) {
      hasAutoSubmittedRef.current = true;

      // Initialize toggle states if provided
      if (typeof state.initialDeepThinkingEnabled === "boolean") {
        completion.setIsDeepThinkingEnabled(state.initialDeepThinkingEnabled);
      }
      if (typeof state.initialWebSearchEnabled === "boolean") {
        completion.setIsWebSearchEnabled(state.initialWebSearchEnabled);
      }
      
      // Initialize with files if present
      if (state.initialFiles?.length) {
        completion.setState(prev => ({
          ...prev,
          attachedFiles: state.initialFiles || []
        }));
      }

      // Submit with input text if present, or just set files and wait if no text
      // But usually we want to submit if there is input OR files + auto-submit intent
      // Here we assume if we navigated here with state, we want to submit
      if (state.initialInput) {
        // Small delay to ensure state update for files has processed if needed
        setTimeout(() => {
          completion.submit(state.initialInput);
        }, 100);
      }
      
      // Clear the state so refreshing doesn't re-submit
      window.history.replaceState({}, document.title);
    }
  }, [
    location.state,
    completion.submit,
    completion.isLoading,
    messages,
    completion.setState,
    completion.setIsDeepThinkingEnabled,
    completion.setIsWebSearchEnabled,
  ]);

  useEffect(() => {
    const getMessages = async () => {
      const conversation = await getConversationById(conversationId as string);
      setMessages(conversation || null);
    };
    getMessages();
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom when messages load
    if (messages?.messages.length) {
      setTimeout(() => {
        completion.messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages?.messages.length]);


  return (
    <PageLayout
      isMainTitle={false}
      allowBackButton={true}
      title={messages?.title || ""}
      description={`${messages?.messages.length} messages in this conversation`}
    >
      {messages?.messages.length === 0 ? (
        <Empty
          isLoading={false}
          icon={MessageCircleIcon}
          title="No messages found"
          description="Start a new message to get started"
        />
      ) : (
        <div className="flex flex-col gap-4 pb-24 px-2">
          {messages?.messages.map((message, index, array) => {
            const isUser = message.role === "user";
            const showDate =
              index === 0 ||
              moment(message.timestamp).format("YYYY-MM-DD") !==
                moment(array[index - 1]?.timestamp).format("YYYY-MM-DD");

            return (
              <div key={message.id}>
                {/* Date separator */}
                {showDate && (
                  <Badge
                    variant={"outline"}
                    className="flex items-center justify-center my-4 w-fit mx-auto"
                  >
                    {moment(message.timestamp).format("ddd, MMM D")}
                  </Badge>
                )}

                {/* Message */}
                <div
                  className={`flex gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Avatar - Left side for bot */}
                  {!isUser && (
                    <div className="flex-shrink-0">
                      <div className="size-7 lg:size-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <SparklesIcon className="size-3 lg:size-4 text-primary" />
                      </div>
                    </div>
                  )}

                  {/* Message content */}
                  <div
                    className={`flex flex-col gap-1 max-w-[70%] ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    {!isUser && message.reasoning_content && (
                      <div className="mb-2 pl-4 border-l-2 border-primary/30 text-xs text-muted-foreground w-full">
                        <div className="flex items-center gap-2 mb-1 font-semibold opacity-70 select-none">
                          <Brain className={`size-3 ${
                            completion.isLoading && 
                            index === array.length - 1 && 
                            !message.content 
                              ? "animate-pulse" 
                              : ""
                          }`} />
                          <span>Thinking Process</span>
                          {completion.isLoading && 
                            index === array.length - 1 && 
                            !message.content && (
                            <span className="animate-pulse">...</span>
                          )}
                        </div>
                        <div className="italic">
                          <Markdown>{message.reasoning_content}</Markdown>
                          {completion.isLoading && 
                            index === array.length - 1 && 
                            !message.content && (
                            <span className="inline-block w-1.5 h-3 bg-primary/50 animate-pulse ml-0.5" />
                          )}
                        </div>
                      </div>
                    )}
                    {message.content && (
                      <Card
                        className={`px-4 text-xs lg:text-sm py-2 transition-all select-none shadow-none [&_p:last-child]:mb-0 ${
                          isUser
                            ? "!bg-primary text-primary-foreground !border-primary rounded-tr-sm"
                            : "!bg-muted/50 dark:!bg-muted/30 rounded-tl-sm"
                        }`}
                      >
                        <Markdown className={isUser ? "prose-headings:text-primary-foreground prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-li:text-primary-foreground prose-ol:text-primary-foreground prose-ul:text-primary-foreground prose-code:text-primary-foreground" : ""}>{message.content}</Markdown>
                      </Card>
                    )}
                    
                    {/* Citations - show if available */}
                    {!isUser && (message.citations?.length || (index === array.length - 1 && completion.currentCitations.length > 0)) ? (
                      <div className="mt-2 p-2 bg-muted/30 rounded-md border border-muted/50 text-xs">
                        <div className="flex items-center gap-1 mb-1 text-muted-foreground font-medium">
                          <Globe className="size-3" />
                          <span>Sources</span>
                        </div>
                        <div className="space-y-1">
                          {(message.citations || completion.currentCitations).map((citation, citationIndex) => (
                            <div key={citationIndex} className="flex items-start gap-1">
                              <span className="text-muted-foreground">[{citationIndex + 1}]</span>
                              <a 
                                href={citation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline truncate max-w-[250px]"
                                title={citation.url}
                              >
                                {citation.title || citation.url}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    
                    <Badge
                      variant="outline"
                      className={`text-[10px] lg:text-xs bg-transparent border-none ${
                        isUser ? "-mr-1" : "-ml-1"
                      }`}
                    >
                      {moment(message.timestamp).format("hh:mm A")}
                    </Badge>
                  </div>

                  {/* Avatar - Right side for user */}
                  {isUser && (
                    <div className="flex-shrink-0">
                      <div className="size-7 lg:size-8 rounded-full bg-primary flex items-center justify-center">
                        <UserIcon className="size-3 lg:size-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Web Search Indicator */}
          {completion.isSearching && (
            <div className="flex gap-3 justify-start px-2 mb-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex-shrink-0">
                <div className="size-7 lg:size-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Globe className="size-3 lg:size-4 text-blue-500 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground animate-pulse font-medium">
                  Searching the web...
                </span>
              </div>
            </div>
          )}
          
          {/* Waiting Animation for Deep Thinking - shown while streaming reasoning */}
          {completion.isLoading &&
            completion.isDeepThinkingEnabled && (() => {
              const lastMessage = messages?.messages[messages.messages.length - 1];
              // Show thinking indicator if:
              // 1. Last message is from user (waiting for response)
              // 2. Or assistant message has reasoning but no content yet (still thinking)
              const isWaitingForResponse = lastMessage?.role === "user";
              const isThinking = lastMessage?.role === "assistant" && 
                lastMessage?.reasoning_content && 
                !lastMessage?.content;
              
              if (isWaitingForResponse || isThinking) {
                return (
                  <div className="flex gap-3 justify-start px-2 mb-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex-shrink-0">
                      <div className="size-7 lg:size-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="size-3 lg:size-4 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground animate-pulse font-medium">
                        {isThinking ? "Deep thinking..." : "Thinking..."}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
          <div ref={completion.messagesEndRef} />
        </div>
      )}

      {/* Sticky Footer Input */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/10 backdrop-blur">
        {completion.error && (
          <div className="px-4 pt-3 pb-0">
            <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
              <strong>Error:</strong> {completion.error}
            </div>
          </div>
        )}

        <div className="relative flex items-start gap-2 p-4">
          {!hasActiveLicense && (
            <div className="select-none p-5 z-100 bg-primary/5 border border-primary/20 rounded-xl absolute top-4 left-4 right-4">
              <div className="max-w-sm mx-auto">
                <p className="text-sm font-medium text-center">
                  You need an active license to use this feature.
                </p>

                <GetLicense
                  buttonText="Get License"
                  buttonClassName="w-full mt-2"
                />
              </div>
            </div>
          )}
          <div className="flex-1 relative">
            {completion.isRecording ? (
              <AudioRecorder
                onTranscriptionComplete={(text) => {
                  completion.setIsRecording(false);
                  completion.submit(text);
                }}
                onCancel={() => completion.setIsRecording(false)}
              />
            ) : (
              <>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 z-10">
                  <ChatFiles
                    attachedFiles={completion.attachedFiles}
                    handleFileSelect={completion.handleFileSelect}
                    removeFile={completion.removeFile}
                    onRemoveAllFiles={completion.onRemoveAllFiles}
                    isLoading={completion.isLoading}
                    isFilesPopoverOpen={completion.isFilesPopoverOpen}
                    setIsFilesPopoverOpen={completion.setIsFilesPopoverOpen}
                    disabled={!hasActiveLicense}
                  />
                  <ChatAudio
                    micOpen={completion.micOpen}
                    setMicOpen={completion.setMicOpen}
                    isRecording={completion.isRecording}
                    setIsRecording={completion.setIsRecording}
                    disabled={!hasActiveLicense}
                  />
                  <ChatScreenshot
                    screenshotConfiguration={completion.screenshotConfiguration}
                    attachedFiles={completion.attachedFiles}
                    isLoading={completion.isLoading}
                    captureScreenshot={completion.captureScreenshot}
                    isScreenshotLoading={completion.isScreenshotLoading}
                    disabled={!hasActiveLicense}
                  />
                  
                  {/* Deep Thinking Toggle */}
                  <div className="flex items-center gap-1 ml-1 bg-muted/20 p-1 rounded-md border border-white/5 h-9">
                    <Switch
                      checked={completion.isDeepThinkingEnabled}
                      onCheckedChange={completion.setIsDeepThinkingEnabled}
                      className="scale-75 origin-center"
                      title="Enable Deep Thinking"
                      disabled={completion.isLoading}
                    />
                    <Brain
                      className={`size-3 lg:size-4 ${
                        completion.isDeepThinkingEnabled
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  
                  {/* Web Search Toggle */}
                  <div className="flex items-center gap-1 ml-1 bg-muted/20 p-1 rounded-md border border-white/5 h-9">
                    <Switch
                      checked={completion.isWebSearchEnabled}
                      onCheckedChange={completion.setIsWebSearchEnabled}
                      className="scale-75 origin-center"
                      title="Enable Web Search"
                      disabled={completion.isLoading}
                    />
                    <Globe
                      className={`size-3 lg:size-4 ${
                        completion.isWebSearchEnabled
                          ? "text-blue-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                </div>

                <Textarea
                  ref={completion.inputRef}
                  placeholder="Type a message..."
                  className="pr-12 pl-2 resize-none pb-12 pt-3"
                  rows={2}
                  value={completion.input}
                  onChange={(e) => completion.setInput(e.target.value)}
                  onKeyDown={completion.handleKeyPress}
                  onPaste={completion.handlePaste}
                  disabled={completion.isLoading || !hasActiveLicense}
                />
                <Button
                  size="icon"
                  className="size-7 lg:size-9 rounded-lg lg:rounded-xl absolute right-2 bottom-2"
                  title="Send message"
                  onClick={() => completion.submit()}
                  disabled={
                    completion.isLoading ||
                    !completion.input.trim() ||
                    !hasActiveLicense
                  }
                >
                  {completion.isLoading ? (
                    <Loader2 className="size-3 lg:size-4 animate-spin" />
                  ) : (
                    <SendIcon className="size-3 lg:size-4" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

    </PageLayout>
  );
};

export default View;
