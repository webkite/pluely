import { PageLayout } from "@/layouts";
import { useNavigate } from "react-router-dom";
import { SparklesIcon } from "lucide-react";
import { generateConversationId } from "@/lib";
import { SuperAgentGrid } from "./components/SuperAgentGrid";
import { HomeInput } from "./components/HomeInput";

const Home = () => {
  const navigate = useNavigate();

  const handleStartConversation = (initialInput: string) => {
    if (!initialInput.trim()) return;
    
    const conversationId = generateConversationId("chat");
    navigate(`/chats/view/${conversationId}`, {
      state: { initialInput },
    });
  };

  return (
    <PageLayout
      title="Welcome to PocketCrew"
      description="Your privacy-first AI assistant"
      isMainTitle={false}
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-in fade-in duration-500">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-6 mb-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-2">
            <SparklesIcon className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            How can I help you today?
          </h1>
        </div>

        {/* Central Input */}
        <HomeInput />

        {/* Super Agents Grid */}
        <SuperAgentGrid 
          onAgentClick={(agent) => handleStartConversation(agent.prompt)} 
        />
        
      </div>
    </PageLayout>
  );
};

export default Home;
