import {
  Settings,
  Code,
  MessagesSquare,
  WandSparkles,
  AudioLinesIcon,
  SquareSlashIcon,
  MonitorIcon,
  HomeIcon,
  PowerIcon,
  MailIcon,
  CoffeeIcon,
  GlobeIcon,
  BugIcon,
  MessageSquareTextIcon,
  LayoutDashboard,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useApp } from "@/contexts";
import { XIcon, GithubIcon } from "@/components";
import { useMemo } from "react";

export type MenuItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  count?: number;
  children?: MenuItem[];
};

export const useMenuItems = () => {
  const { hasActiveLicense } = useApp();

  const menu: MenuItem[] = useMemo(
    () => [
      {
        icon: HomeIcon,
        label: "Home",
        href: "/home",
      },
      {
        icon: MessagesSquare,
        label: "Chats",
        href: "/chats",
      },
      {
        icon: Settings,
        label: "Settings",
        href: "/settings",
        children: [
          {
            icon: LayoutDashboard,
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            icon: Settings,
            label: "App Settings",
            href: "/settings",
          },
          {
            icon: MessageSquareTextIcon,
            label: "Responses",
            href: "/responses",
          },
          {
            icon: MonitorIcon,
            label: "Screenshot",
            href: "/screenshot",
          },
          {
            icon: AudioLinesIcon,
            label: "Audio",
            href: "/audio",
          },
          {
            icon: SquareSlashIcon,
            label: "Shortcuts",
            href: "/shortcuts",
          },
          {
            icon: Code,
            label: "Dev space",
            href: "/dev-space",
          },
          {
            icon: WandSparkles,
            label: "System prompts",
            href: "/system-prompts",
          },
        ],
      },
    ],
    []
  );

  const footerItems = [
    ...(hasActiveLicense
      ? [
          {
            icon: MailIcon,
            label: "Contact Support",
            href: "mailto:support@pluely.com",
          },
        ]
      : []),
    {
      icon: BugIcon,
      label: "Report a bug",
      href: "https://github.com/iamsrikanthnani/pluely/issues/new?template=bug-report.yml",
    },
    {
      icon: PowerIcon,
      label: "Quit pluely",
      action: async () => {
        await invoke("exit_app");
      },
    },
  ];

  const footerLinks: {
    title: string;
    icon: React.ElementType;
    link: string;
  }[] = [
    {
      title: "Website",
      icon: GlobeIcon,
      link: "https://pluely.com",
    },
    {
      title: "Github",
      icon: GithubIcon,
      link: "https://github.com/iamsrikanthnani/pluely",
    },
    {
      title: "Buy Me a Coffee",
      icon: CoffeeIcon,
      link: "https://buymeacoffee.com/srikanthnani",
    },
    {
      title: "Follow on X",
      icon: XIcon,
      link: "https://x.com/truly_sn",
    },
  ];

  return {
    menu,
    footerItems,
    footerLinks,
  };
};
