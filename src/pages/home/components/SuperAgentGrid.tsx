import { 
  Briefcase, 
  Presentation, 
  Table, 
  Users, 
  LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SuperAgent {
  icon: LucideIcon;
  name: string;
  description: string;
  prompt: string;
}

const agents: SuperAgent[] = [
  {
    icon: Briefcase,
    name: "AI Project",
    description: "Plan and manage projects",
    prompt: "I need help planning a new project. Can you act as a project manager?",
  },
  {
    icon: Presentation,
    name: "AI Slides",
    description: "Create presentation outlines",
    prompt: "I need help creating a presentation slide deck. Can you help me outline it?",
  },
  {
    icon: Table,
    name: "AI Spreadsheet",
    description: "Analyze data and formulas",
    prompt: "I need help with spreadsheets and data analysis. Can you act as a data analyst?",
  },
  {
    icon: Users,
    name: "AI Meeting Advisor",
    description: "Prepare for meetings",
    prompt: "I have an important meeting coming up. Can you help me prepare and act as my advisor?",
  },
];

interface SuperAgentGridProps {
  onAgentClick: (agent: SuperAgent) => void;
}

export const SuperAgentGrid = ({ onAgentClick }: SuperAgentGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full max-w-4xl mx-auto">
      {agents.map((agent) => (
        <button
          key={agent.name}
          onClick={() => onAgentClick(agent)}
          className={cn(
            "flex flex-col items-center justify-center gap-3 p-6 rounded-xl",
            "bg-card border border-border/50 hover:border-primary/50 transition-all duration-300",
            "hover:shadow-lg hover:bg-accent/50 group cursor-pointer text-center"
          )}
        >
          <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <agent.icon className="size-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-sm">{agent.name}</h3>
          </div>
        </button>
      ))}
    </div>
  );
};

