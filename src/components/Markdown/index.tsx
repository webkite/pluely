import React, { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { openUrl } from "@tauri-apps/plugin-opener";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

interface MarkdownRendererProps {
  children: string;
}

export function Markdown({ children }: MarkdownRendererProps) {
  const fixedMarkdown = children
    .replace(/\\\[(.*?)\\\]/gs, "$$$1$$") // display math
    .replace(/\\\((.*?)\\\)/gs, "$$$1$"); // inline math

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        rehypeRaw,
        [
          rehypeSanitize,
          {
            ...defaultSchema,
            attributes: {
              ...defaultSchema.attributes,
              code: [
                ...(defaultSchema.attributes?.code || []),
                ["className", /^language-./],
              ],
            },
          },
        ],
        rehypeKatex,
      ]}
      components={COMPONENTS as any}
    >
      {fixedMarkdown}
    </ReactMarkdown>
  );
}

interface HighlightedPre extends React.HTMLAttributes<HTMLPreElement> {
  children: string;
  language: string;
}

interface Resource<T> {
  read(): T;
}

function createResource<T>(promise: Promise<T>): Resource<T> {
  let status = "pending";
  let result: T | Error | undefined;
  const suspender = promise.then(
    (r) => {
      status = "success";
      result = r;
    },
    (e) => {
      status = "error";
      result = e;
    }
  );
  return {
    read() {
      if (status === "pending") throw suspender;
      if (status === "error") throw result;
      return result as T;
    },
  };
}

// Singleton highlighter instance
let highlighterPromise: Promise<any> | null = null;

async function getHighlighter() {
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = (async () => {
    try {
      const { createHighlighterCore } = await import("shiki/core");
      const { createJavaScriptRegexEngine } = await import("shiki/engine/javascript");
      const { bundledThemes } = await import("shiki/themes");

      return await createHighlighterCore({
        themes: [
          await bundledThemes["github-light"](),
          await bundledThemes["github-dark"](),
        ],
        langs: [], // Initialize with no languages, load on demand
        engine: createJavaScriptRegexEngine(),
      });
    } catch (e) {
      console.error("Failed to initialize highlighter:", e);
      highlighterPromise = null; // Reset on failure
      throw e;
    }
  })();

  return highlighterPromise;
}

const HighlightedPre = React.memo(
  ({ children, language, ...props }: HighlightedPre) => {
    const resource = React.useMemo(
      () =>
        createResource(
          (async () => {
            try {
              const { bundledLanguages } = await import("shiki/langs");
              
              // Normalize language name to handle potential case issues
              const normalizedLang = language.toLowerCase();
              
              // Find the language module in bundled languages
              // We cast to any because keys might not perfectly match string type
              const langModule = bundledLanguages[normalizedLang as keyof typeof bundledLanguages];

              // If language is not supported/bundled, return null to fallback to plain text
              if (!langModule) {
                 return null;
              }

              const highlighter = await getHighlighter();
              
              // Load the language if it hasn't been loaded yet
              if (!highlighter.getLoadedLanguages().includes(normalizedLang)) {
                 await highlighter.loadLanguage(await langModule());
              }
              
              const { tokens } = highlighter.codeToTokens(children, {
                lang: normalizedLang,
                themes: {
                  light: "github-light",
                  dark: "github-dark",
                },
              });

              return { tokens };
            } catch (e) {
              console.warn("Failed to highlight code:", e);
              return null;
            }
          })()
        ),
      [children, language]
    );

    const data = resource.read();

    if (!data) {
      return <pre {...props}>{children}</pre>;
    }

    const { tokens } = data;

    return (
      <pre {...props}>
        <code>
          {tokens.map((line: any, lineIndex: number) => (
            <React.Fragment key={lineIndex}>
              <span>
                {line.map((token: any, tokenIndex: number) => {
                  const style: any = {};
                  
                  if (token.variants) {
                    const light = token.variants.light;
                    const dark = token.variants.dark;
                    
                    if (light) {
                      style["--shiki-light"] = light.color;
                      if (light.fontStyle) {
                        if (light.fontStyle & 1) style["--shiki-light-font-style"] = "italic";
                        if (light.fontStyle & 2) style["--shiki-light-font-weight"] = "bold";
                        if (light.fontStyle & 4) style["--shiki-light-text-decoration"] = "underline";
                      }
                    }
                    
                    if (dark) {
                      style["--shiki-dark"] = dark.color;
                      if (dark.fontStyle) {
                        if (dark.fontStyle & 1) style["--shiki-dark-font-style"] = "italic";
                        if (dark.fontStyle & 2) style["--shiki-dark-font-weight"] = "bold";
                        if (dark.fontStyle & 4) style["--shiki-dark-text-decoration"] = "underline";
                      }
                    }
                  } else if (token.color) {
                    style.color = token.color;
                  }

                  return (
                    <span
                      key={tokenIndex}
                      className="shiki-token"
                      style={style}
                    >
                      {token.content}
                    </span>
                  );
                })}
              </span>
              {lineIndex !== tokens.length - 1 && "\n"}
            </React.Fragment>
          ))}
        </code>
      </pre>
    );
  }
);
HighlightedPre.displayName = "HighlightedCode";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode;
  className?: string;
  language: string;
}

const CodeBlock = ({
  children,
  className,
  language,
  ...restProps
}: CodeBlockProps) => {
  const code =
    typeof children === "string"
      ? children
      : childrenTakeAllStringContents(children);

  const preClass = cn(
    "w-full whitespace-pre-wrap rounded-md border bg-background/50 p-4 font-mono text-sm [scrollbar-width:none]",
    className
  );

  return (
    <div className="group/code relative">
      <Suspense
        fallback={
          <pre className={preClass} {...restProps}>
            {children}
          </pre>
        }
      >
        <HighlightedPre language={language} className={preClass}>
          {code}
        </HighlightedPre>
      </Suspense>
      <div className="invisible absolute right-2 top-2 flex space-x-1 rounded-lg p-1 opacity-0 transition-all duration-200 group-hover/code:visible group-hover/code:opacity-100">
        <CopyButton content={code} copyMessage="Copied code to clipboard" />
      </div>
    </div>
  );
};

function childrenTakeAllStringContents(element: any): string {
  if (typeof element === "string") {
    return element;
  }

  if (element?.props?.children) {
    const children = element.props.children;

    if (Array.isArray(children)) {
      return children
        .map((child) => childrenTakeAllStringContents(child))
        .join("");
    } else {
      return childrenTakeAllStringContents(children);
    }
  }

  return "";
}

const COMPONENTS = {
  h1: withClass("h1", "text-xl font-semibold mb-2 mt-2"),
  h2: withClass("h2", "font-semibold text-lg mb-2 mt-2"),
  h3: withClass("h3", "font-semibold text-base mb-1 mt-1"),
  h4: withClass("h4", "font-semibold text-sm mb-1 mt-2"),
  h5: withClass("h5", "font-medium mb-1 mt-1"),
  strong: withClass("strong", "font-semibold"),
  a: ({ children, href, ...props }: any) => {
    const handleClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (href) {
        try {
          await openUrl(href);
        } catch (error) {
          console.error("Failed to open URL:", error);
        }
      }
    };

    return (
      <a
        href={href}
        className="text-gray-600 underline underline-offset-2 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 cursor-pointer"
        onClick={handleClick}
        {...props}
      >
        {children}
      </a>
    );
  },
  blockquote: withClass(
    "blockquote",
    "border-l-4 border-primary pl-4 my-2 italic"
  ),
  code: ({ children, className, ...rest }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <CodeBlock className={className} language={match[1].toLowerCase()} {...rest}>
        {children}
      </CodeBlock>
    ) : (
      <code
        className={cn(
          "font-mono [:not(pre)>&]:rounded-md [:not(pre)>&]:bg-background/50 [:not(pre)>&]:px-1 [:not(pre)>&]:py-0.5"
        )}
        {...rest}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => children,
  ol: withClass("ol", "list-decimal pl-6 my-1 space-y-1"),
  ul: withClass("ul", "list-disc pl-6 my-1 space-y-1"),
  li: withClass("li", "my-0 leading-tight"),
  table: withClass(
    "table",
    "w-full border-collapse overflow-y-auto rounded-md border border-foreground/20 my-2"
  ),
  thead: withClass("thead", "bg-foreground/10"),
  th: withClass(
    "th",
    "border border-foreground/20 px-4 py-1 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
  ),
  td: withClass(
    "td",
    "border border-foreground/20 px-4 py-1 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
  ),
  tr: withClass("tr", "m-0 border-t p-0 even:bg-muted/50"),
  p: withClass("p", "mb-2"),
  hr: withClass("hr", "border-foreground/20 my-4"),
  img: withClass("img", "max-w-full h-auto rounded-md my-2"),
  // Support for task lists
  input: ({ node, ...props }: any) => {
    if (node.properties.type === "checkbox") {
      return <input type="checkbox" className="mr-2" {...props} disabled />;
    }
    return <input {...props} />;
  },
};

function withClass(Tag: any, classes: string) {
  const Component = ({ ...props }: any) => (
    <Tag className={classes} {...props} />
  );
  Component.displayName = Tag;
  return Component;
}
