import { SparklesIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useMenuItems, useVersion } from "@/hooks";
import type { MenuItem } from "@/hooks";
import { useState, useEffect } from "react";

export const Sidebar = () => {
  const { version, isLoading } = useVersion();
  const { menu, footerLinks, footerItems } = useMenuItems();
  const navigate = useNavigate();
  const activeRoute = useLocation().pathname;
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-expand Settings if any of its children are active
  useEffect(() => {
    const hasActiveChild = menu.some((item) => {
      if (item.children) {
        return item.children.some((child) =>
          activeRoute === child.href || activeRoute.startsWith(child.href + "/")
        );
      }
      return false;
    });

    if (hasActiveChild) {
      menu.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some(
            (child) =>
              activeRoute === child.href ||
              activeRoute.startsWith(child.href + "/")
          );
          if (hasActiveChild) {
            setExpandedItems((prev) => {
              if (prev.has(item.label)) return prev;
              const next = new Set(prev);
              next.add(item.label);
              return next;
            });
          }
        }
      });
    }
  }, [activeRoute, menu]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isItemActive = (item: MenuItem) => {
    if (item.children) {
      return item.children.some(
        (child) =>
          activeRoute === child.href || activeRoute.startsWith(child.href + "/")
      );
    }
    return (
      activeRoute === item.href || activeRoute.startsWith(item.href + "/")
    );
  };

  const isChildActive = (item: MenuItem) => {
    return (
      activeRoute === item.href || activeRoute.startsWith(item.href + "/")
    );
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.label);
    const isActive = isItemActive(item);

    const handleParentClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Parent clicked:', item.label, 'hasChildren:', hasChildren, 'target:', e.target);
      if (hasChildren) {
        const willBeExpanded = !expandedItems.has(item.label);
        toggleExpanded(item.label);
        // Only navigate to parent href if expanding and no child is currently active
        if (willBeExpanded && item.href && !isActive) {
          navigate(item.href);
        }
      } else {
        console.log('Navigating to:', item.href, 'Current route:', activeRoute);
        if (activeRoute !== item.href) {
          navigate(item.href);
        }
      }
    };

    const handleChildClick = (e: React.MouseEvent, childHref: string) => {
      e.stopPropagation();
      if (activeRoute !== childHref) {
        navigate(childHref);
      }
    };

    return (
      <div key={`${item.label}-${index}`}>
        <button
          type="button"
          onClick={handleParentClick}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs lg:text-sm text-sidebar-foreground/70 transition-all duration-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer",
            isActive && !hasChildren
              ? "font-medium bg-sidebar-accent text-sidebar-accent-foreground"
              : "",
            isActive && hasChildren
              ? "font-medium text-sidebar-accent-foreground"
              : ""
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="size-3 lg:size-4 transition-all duration-300" />
            {item.label}
          </div>
          <div className="flex items-center gap-2">
            {item.count ? (
              <span className="flex size-5 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                {item.count}
              </span>
            ) : null}
            {hasChildren && (
              <ChevronRight
                className={cn(
                  "size-3 lg:size-4 transition-all duration-300",
                  isExpanded && "rotate-90"
                )}
              />
            )}
          </div>
        </button>
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 mb-1 space-y-1 border-l border-sidebar-accent pl-2">
            {item.children!.map((child, childIndex) => {
              const childIsActive = isChildActive(child);
              return (
                <button
                  key={`${child.label}-${childIndex}`}
                  type="button"
                  onClick={(e) => {
                    handleChildClick(e, child.href);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-xs lg:text-sm text-sidebar-foreground/60 transition-all duration-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer",
                    childIsActive
                      ? "font-medium bg-sidebar-accent text-sidebar-accent-foreground"
                      : ""
                  )}
                >
                  <div className="flex items-center gap-3">
                    <child.icon className="size-3 lg:size-4 transition-all duration-300" />
                    {child.label}
                  </div>
                  {child.count ? (
                    <span className="flex size-5 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                      {child.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="flex w-56 flex-col select-none pt-2">
      {/* Logo */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate("/home");
        }}
        className="flex h-16 items-center px-4 pt-10 gap-1.5 cursor-pointer"
      >
        <div className="flex size-6 lg:size-7 items-center justify-center rounded-lg bg-primary">
          <SparklesIcon className="size-4 lg:size-5 text-primary-foreground transition-all duration-300" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xs lg:text-md font-semibold text-foreground transition-all duration-300">
            PocketCrew
          </h1>
          <span className="text-[8px] lg:text-[10px] text-muted-foreground -mt-1 block">
            {isLoading ? "Loading..." : `(v${version})`}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
        {menu.map((item, index) => renderMenuItem(item, index))}
      </nav>

      <div className="flex flex-col space-y-1 px-3  pb-3">
        <div className="flex flex-row justify-evenly items-center gap-2 mb-3">
          {footerLinks.map((item, index) => (
            <Button
              key={`${item.title}-${index}`}
              title={item.title}
              size="sm"
              variant="outline"
              onClick={() => openUrl(item.link)}
            >
              <item.icon className="size-3 lg:size-4 transition-all duration-300" />
            </Button>
          ))}
        </div>

        {footerItems.map((item, index) => (
          <a
            href={item.href}
            onClick={item.action}
            target="_blank"
            rel="noopener noreferrer"
            key={`${item.label}-${index}`}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs lg:text-sm text-sidebar-foreground/70 transition-all duration-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="size-3 lg:size-4 transition-all duration-300" />
              {item.label}
            </div>
          </a>
        ))}
      </div>
    </aside>
  );
};
