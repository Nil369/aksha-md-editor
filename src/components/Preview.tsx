import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import type { ThemeMode } from "../types";
import "katex/dist/katex.css";
import "../../styles.css";

type PreviewProps = {
  content: string;
  theme?: ThemeMode;
  className?: string;
  onScrollContainerRef?: (el: HTMLDivElement | null) => void;
  showSidebar?: boolean;
  onToggleSidebar?: () => void;
  onContentChange?: (newContent: string) => void;
};

const Skeleton = ({
  className = "",
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={className}
    style={{
      backgroundColor: "rgba(156, 163, 175, 0.2)",
      borderRadius: "4px",
      animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      ...style,
    }}
  />
);

export const Preview = memo(function Preview({
  content,
  theme = "auto",
  className = "",
  onScrollContainerRef,
  showSidebar = false,
  onToggleSidebar,
  onContentChange,
}: PreviewProps) {
  const [html, setHtml] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const chartsRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<
    Array<{ id: string; text: string; level: number }>
  >([]);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );

  const resolvedTheme = useMemo(() => {
    if (theme !== "auto") return theme;
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, [theme]);

  // Dynamic theme loading for highlight.js
  useEffect(() => {
    if (typeof document === "undefined") return;
    
    // Load highlight.js theme
    const highlightLink = document.createElement("link");
    highlightLink.rel = "stylesheet";
    highlightLink.href =
      resolvedTheme === "dark"
        ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
        : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";
    document.head.appendChild(highlightLink);

    return () => {
      if (document.head.contains(highlightLink)) {
        document.head.removeChild(highlightLink);
      }
    };
  }, [resolvedTheme]);

  useEffect(() => {
    const controller = new AbortController();
    
    const render = async () => {
      if (!content) {
        setHtml("");
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true);
      
      try {
        const rehypeMacFigure = () => (tree: any) => {
          const visit = (node: any, index?: number, parent?: any) => {
            if (!node) return;
            if (Array.isArray(node.children)) {
              node.children.forEach((child: any, i: number) =>
                visit(child, i, node)
              );
            }
            if (node.type === "element" && node.tagName === "pre") {
              const codeEl = Array.isArray(node.children)
                ? node.children.find(
                    (c: any) => c.type === "element" && c.tagName === "code"
                  )
                : null;
              let lang = "";
              const cls = codeEl?.properties?.className;
              if (Array.isArray(cls)) {
                const found = cls.find(
                  (x: string) =>
                    typeof x === "string" && x.startsWith("language-")
                );
                if (found) lang = found.replace("language-", "");
              }
              const figure: any = {
                type: "element",
                tagName: "figure",
                properties: { "data-rehype-pretty-code-figure": "" },
                children: [],
              };
              if (lang) {
                figure.children.push({
                  type: "element",
                  tagName: "div",
                  properties: { "data-rehype-pretty-code-title": "" },
                  children: [{ type: "text", value: lang }],
                });
              }
              figure.children.push(node);
              if (parent && typeof index === "number")
                parent.children[index] = figure;
            }
          };
          visit(tree);
        };
        const rehypeMermaidEcharts = () => (tree: any) => {
          const visit = (node: any, index?: number, parent?: any) => {
            if (!node) return;
            if (Array.isArray(node.children)) {
              node.children.forEach((child: any, i: number) =>
                visit(child, i, node)
              );
            }
            if (node.type === "element" && node.tagName === "pre") {
              const codeEl = Array.isArray(node.children)
                ? node.children.find(
                    (c: any) => c.type === "element" && c.tagName === "code"
                  )
                : null;
              if (!codeEl) return;
              const classNames = codeEl.properties?.className || [];
              const langClass = Array.isArray(classNames)
                ? classNames.find(
                    (x: string) =>
                      typeof x === "string" && x.startsWith("language-")
                  )
                : "";
              const lang = langClass ? langClass.replace("language-", "") : "";
              const getText = (n: any): string => {
                if (!n) return "";
                if (typeof n.value === "string") return n.value;
                if (Array.isArray(n.children))
                  return n.children.map(getText).join("");
                return "";
              };
              const raw = getText(codeEl);
              if (lang === "mermaid") {
                const div = {
                  type: "element",
                  tagName: "div",
                  properties: { className: ["mermaid"] },
                  children: [{ type: "text", value: raw }],
                };
                if (parent && typeof index === "number")
                  parent.children[index] = div;
              }
              if (lang === "echarts") {
                const id = `echarts-${Math.random().toString(36).slice(2)}`;
                const div = {
                  type: "element",
                  tagName: "div",
                  properties: {
                    id,
                    className: ["aksha-echarts"],
                    "data-options-encoded": encodeURIComponent(raw),
                    style: "width:100%;height:300px",
                  },
                  children: [],
                };
                if (parent && typeof index === "number")
                  parent.children[index] = div;
              }
            }
          };
          visit(tree);
        };

        const file = await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeMermaidEcharts)
          .use(rehypeKatex)
          .use(rehypeHighlight)
          .use(rehypeMacFigure)
          .use(rehypeStringify, { allowDangerousHtml: true })
          .process(content);
        let htmlOutput = String(file);
        if (!controller.signal.aborted) {
          setHtml(htmlOutput);
          setIsProcessing(false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setHtml(
            `<div style="color:#ef4444;padding:12px;border:1px solid #fecdd3;border-radius:8px;background:#fef2f2;">Preview rendering error: ${String(
              error
            )}</div>`
          );
          setIsProcessing(false);
        }
      }
    };

    const timer = setTimeout(() => {
      render();
    }, 100);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [content]);

  // Handle window resize for responsive design
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Extract headings from content for navigation
  useEffect(() => {
    if (!html || !containerRef.current) return;

    const container = containerRef.current;
    const headingElements = container.querySelectorAll(
      "h1, h2, h3, h4, h5, h6"
    );
    const extractedHeadings: Array<{
      id: string;
      text: string;
      level: number;
    }> = [];

    headingElements.forEach((el, idx) => {
      const level = parseInt(el.tagName.charAt(1));
      const text = el.textContent || "";
      // Generate ID if not present
      let id = el.id;
      if (!id) {
        id = `heading-${idx}-${text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}`;
        el.id = id;
      }
      extractedHeadings.push({ id, text, level });
    });

    setHeadings(extractedHeadings);
  }, [html]);

  // Handle checkbox clicks in preview
  useEffect(() => {
    if (!html || !containerRef.current || !onContentChange) return;

    const container = containerRef.current;
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    const handleCheckboxChange = (e: Event) => {
      const checkbox = e.target as HTMLInputElement;
      const listItem = checkbox.closest("li");
      if (!listItem) return;

      // Get the text after the checkbox (excluding nested content)
      const checkboxText = Array.from(listItem.childNodes)
        .filter((node) => {
          if (node.nodeType === Node.TEXT_NODE) return true;
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            return el.tagName !== "UL" && el.tagName !== "OL";
          }
          return false;
        })
        .map((node) => node.textContent?.trim() || "")
        .join(" ")
        .trim();

      // Find the corresponding line in the markdown
      const lines = content.split("\n");
      let foundIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Match task list pattern: - [ ] or - [x] followed by text
        const taskMatch = line.match(/^(\s*)([-*+])\s\[([ xX])\]\s(.+)$/);
        if (taskMatch) {
          const lineText = taskMatch[4].trim();
          // Better matching: compare first few words or exact match
          const lineWords = lineText
            .toLowerCase()
            .split(/\s+/)
            .slice(0, 3)
            .join(" ");
          const checkboxWords = checkboxText
            .toLowerCase()
            .split(/\s+/)
            .slice(0, 3)
            .join(" ");

          if (
            lineText.toLowerCase() === checkboxText.toLowerCase() ||
            lineWords === checkboxWords ||
            checkboxText
              .toLowerCase()
              .startsWith(lineText.toLowerCase().substring(0, 10))
          ) {
            foundIndex = i;
            break;
          }
        }
      }

      if (foundIndex >= 0) {
        const line = lines[foundIndex];
        const taskMatch = line.match(/^(\s*)([-*+])\s\[([ xX])\]\s(.+)$/);
        if (taskMatch) {
          // Toggle the checkbox state
          const isChecked = checkbox.checked;
          const newState = isChecked ? "x" : " ";
          const newLine = `${taskMatch[1]}${taskMatch[2]} [${newState}] ${taskMatch[4]}`;
          lines[foundIndex] = newLine;

          // Update the content
          const newContent = lines.join("\n");
          onContentChange(newContent);
        }
      }
    };

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", handleCheckboxChange);
    });

    return () => {
      checkboxes.forEach((checkbox) => {
        checkbox.removeEventListener("change", handleCheckboxChange);
      });
    };
  }, [html, content, onContentChange]);

  // Initialize mermaid and echarts after html updates
  useEffect(() => {
    if (!html || !containerRef.current) return;

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (typeof document === "undefined") return resolve();
        const existing = Array.from(document.scripts).find((s) =>
          s.src.includes(src)
        );
      if (existing) return resolve();
        const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
        script.onerror = () => reject(new Error("failed to load " + src));
      document.head.appendChild(script);
    });

    const initMermaid = async () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      // Use container scope instead of document
      const container = containerRef.current;
      const mermaidElements = container.querySelectorAll(".mermaid");
      if (!mermaidElements.length) return;

      try {
        const prevDefine = (window as any).define;
        (window as any).define = undefined;
        await loadScript(
          "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"
        );
        const mermaid = (window as any).mermaid;
        if (mermaid) {
          mermaid.initialize({
            startOnLoad: false,
            theme: resolvedTheme === "dark" ? "dark" : "default",
            securityLevel: "loose",
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: "basis",
            },
            // Enable interactivity
            themeVariables: {
              primaryColor: resolvedTheme === "dark" ? "#8b5cf6" : "#7c3aed",
              primaryTextColor:
                resolvedTheme === "dark" ? "#e5e7eb" : "#1f2937",
              primaryBorderColor:
                resolvedTheme === "dark" ? "#a78bfa" : "#8b5cf6",
              lineColor: resolvedTheme === "dark" ? "#6b7280" : "#9ca3af",
              secondaryColor: resolvedTheme === "dark" ? "#374151" : "#f3f4f6",
              tertiaryColor: resolvedTheme === "dark" ? "#1f2937" : "#ffffff",
            },
          });

          // Re-run mermaid for all elements in this container
          mermaidElements.forEach((el) => {
            try {
              // Cleanup previous instance if exists
              if ((el as any).__mermaid_cleanup) {
                (el as any).__mermaid_cleanup();
              }
              
              // Clear any existing content
              const text = el.textContent || "";
              if (text.trim()) {
                // Generate unique ID if not present
                if (!el.id) {
                  el.id = `mermaid-${Math.random().toString(36).slice(2)}`;
                }
                // Re-initialize the diagram
                mermaid.run({
                  nodes: [el as HTMLElement],
                }).then(() => {
                  // Wait for SVG to be rendered
                  setTimeout(() => {
                    // Add interactivity - hover effects, panning, zoom, and controls
                    const svg = el.querySelector("svg");
                    if (svg && !(el as any).__mermaid_wrapped) {
                      (el as any).__mermaid_wrapped = true;
                    // Wrap SVG in a container for controls
                    const wrapper = document.createElement("div");
                    wrapper.style.position = "relative";
                    wrapper.style.display = "inline-block";
                    wrapper.style.width = "100%";
                    wrapper.style.overflow = "hidden";
                    wrapper.style.borderRadius = "8px";
                    wrapper.style.background = resolvedTheme === "dark" ? "#1f2937" : "#f9fafb";
                    wrapper.style.border = `1px solid ${resolvedTheme === "dark" ? "#374151" : "#e5e7eb"}`;
                    
                    // Create controls container (like GitHub)
                    const controlsContainer = document.createElement("div");
                    controlsContainer.style.position = "absolute";
                    controlsContainer.style.top = "8px";
                    controlsContainer.style.right = "8px";
                    controlsContainer.style.display = "flex";
                    controlsContainer.style.gap = "4px";
                    controlsContainer.style.zIndex = "10";
                    controlsContainer.style.opacity = "0.8";
                    controlsContainer.style.transition = "opacity 0.2s";
                    
                    wrapper.addEventListener("mouseenter", () => {
                      controlsContainer.style.opacity = "1";
                    });
                    wrapper.addEventListener("mouseleave", () => {
                      controlsContainer.style.opacity = "0.8";
                    });

                    // Zoom In button
                    const zoomInBtn = document.createElement("button");
                    zoomInBtn.innerHTML = "➕";
                    zoomInBtn.title = "Zoom In";
                    zoomInBtn.style.cssText = `
                      width: 32px;
                      height: 32px;
                      border: 1px solid ${resolvedTheme === "dark" ? "#4b5563" : "#d1d5db"};
                      border-radius: 6px;
                      background: ${resolvedTheme === "dark" ? "#374151" : "#ffffff"};
                      color: ${resolvedTheme === "dark" ? "#e5e7eb" : "#374151"};
                      cursor: pointer;
                      font-size: 16px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      transition: all 0.2s;
                    `;
                    zoomInBtn.onmouseenter = () => {
                      zoomInBtn.style.background = resolvedTheme === "dark" ? "#4b5563" : "#f3f4f6";
                    };
                    zoomInBtn.onmouseleave = () => {
                      zoomInBtn.style.background = resolvedTheme === "dark" ? "#374151" : "#ffffff";
                    };

                    // Zoom Out button
                    const zoomOutBtn = document.createElement("button");
                    zoomOutBtn.innerHTML = "➖";
                    zoomOutBtn.title = "Zoom Out";
                    zoomOutBtn.style.cssText = zoomInBtn.style.cssText;

                    // Reset button
                    const resetBtn = document.createElement("button");
                    resetBtn.innerHTML = "↻";
                    resetBtn.title = "Reset View";
                    resetBtn.style.cssText = zoomInBtn.style.cssText;

                    controlsContainer.appendChild(zoomInBtn);
                    controlsContainer.appendChild(zoomOutBtn);
                    controlsContainer.appendChild(resetBtn);

                    // Insert wrapper before SVG
                    el.parentNode?.insertBefore(wrapper, el);
                    wrapper.appendChild(el);
                    wrapper.appendChild(controlsContainer);

                    // Transform state
                    let currentScale = 1;
                    let currentTranslate = { x: 0, y: 0 };
                    const minScale = 0.5;
                    const maxScale = 3;
                    const scaleStep = 0.2;

                    const applyTransform = () => {
                      svg.style.transform = `translate(${currentTranslate.x}px, ${currentTranslate.y}px) scale(${currentScale})`;
                      svg.style.transformOrigin = "center center";
                    };

                    // Enable panning
                    let isPanning = false;
                    let startX = 0;
                    let startY = 0;
                    let panStartTranslate = { x: 0, y: 0 };

                    svg.style.cursor = "grab";
                    svg.style.userSelect = "none";
                    svg.style.transition = "transform 0.1s";

                    svg.addEventListener("mousedown", (e) => {
                      if (e.button === 0) { // Left mouse button
                        isPanning = true;
                        startX = e.clientX;
                        startY = e.clientY;
                        panStartTranslate = { ...currentTranslate };
                        svg.style.cursor = "grabbing";
                        e.preventDefault();
                      }
                    });

                    const handleMouseMove = (e: MouseEvent) => {
                      if (isPanning) {
                        const dx = e.clientX - startX;
                        const dy = e.clientY - startY;
                        currentTranslate = {
                          x: panStartTranslate.x + dx,
                          y: panStartTranslate.y + dy,
                        };
                        applyTransform();
                      }
                    };

                    const handleMouseUp = () => {
                      isPanning = false;
                      svg.style.cursor = "grab";
                    };

                    document.addEventListener("mousemove", handleMouseMove);
                    document.addEventListener("mouseup", handleMouseUp);

                    // Zoom with mouse wheel
                    const handleWheel = (e: WheelEvent) => {
                      e.preventDefault();
                      const delta = e.deltaY > 0 ? -scaleStep : scaleStep;
                      const newScale = Math.max(minScale, Math.min(maxScale, currentScale + delta));
                      
                      // Zoom towards mouse position
                      const rect = svg.getBoundingClientRect();
                      const mouseX = e.clientX - rect.left - rect.width / 2;
                      const mouseY = e.clientY - rect.top - rect.height / 2;
                      
                      const scaleChange = newScale / currentScale;
                      currentTranslate.x = mouseX - (mouseX - currentTranslate.x) * scaleChange;
                      currentTranslate.y = mouseY - (mouseY - currentTranslate.y) * scaleChange;
                      currentScale = newScale;
                      applyTransform();
                    };

                    wrapper.addEventListener("wheel", handleWheel, { passive: false });

                    // Button handlers
                    zoomInBtn.addEventListener("click", (e) => {
                      e.stopPropagation();
                      if (currentScale < maxScale) {
                        currentScale = Math.min(maxScale, currentScale + scaleStep);
                        applyTransform();
                      }
                    });

                    zoomOutBtn.addEventListener("click", (e) => {
                      e.stopPropagation();
                      if (currentScale > minScale) {
                        currentScale = Math.max(minScale, currentScale - scaleStep);
                        applyTransform();
                      }
                    });

                    resetBtn.addEventListener("click", (e) => {
                      e.stopPropagation();
                      currentScale = 1;
                      currentTranslate = { x: 0, y: 0 };
                      applyTransform();
                    });

                    // Add hover effects to nodes
                    const nodes = svg.querySelectorAll("g.node, g.edgeLabel, g.edgePath");
                    nodes.forEach((node) => {
                      (node as SVGElement).style.transition = "opacity 0.2s, filter 0.2s";
                      node.addEventListener("mouseenter", () => {
                        (node as SVGElement).style.opacity = "0.9";
                        (node as SVGElement).style.filter = "brightness(1.1)";
                      });
                      node.addEventListener("mouseleave", () => {
                        (node as SVGElement).style.opacity = "1";
                        (node as SVGElement).style.filter = "none";
                      });
                    });

                      // Cleanup on re-render
                      (el as any).__mermaid_cleanup = () => {
                        document.removeEventListener("mousemove", handleMouseMove);
                        document.removeEventListener("mouseup", handleMouseUp);
                        wrapper.removeEventListener("wheel", handleWheel);
                        (el as any).__mermaid_wrapped = false;
                      };
                    }
                  }, 200); // Wait for mermaid to render SVG
                }).catch((err) => {
                  console.warn("Mermaid render error:", err);
                });
              }
            } catch (err) {
              console.warn("Mermaid render error:", err);
            }
          });
        }
        (window as any).define = prevDefine;
      } catch (err) {
        console.warn("Mermaid initialization error:", err);
      }
    };

    const initECharts = async () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      // Use container scope instead of document
      const container = containerRef.current;
      const containers = Array.from(
        container.querySelectorAll(".aksha-echarts")
      ) as HTMLDivElement[];
      if (!containers.length) return;

      try {
        const prevDefine = (window as any).define;
        (window as any).define = undefined;
        await loadScript(
          "https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"
        );
        const echarts = (window as any).echarts;

        // Dispose old charts
        chartsRef.current.forEach((c) => c?.dispose?.());
        chartsRef.current = [];

        if (echarts) {
          containers.forEach((el) => {
            // Skip if already initialized
            if ((el as any).__echarts_instance__) {
              const existingChart = echarts.getInstanceByDom(el);
              if (existingChart) {
                chartsRef.current.push(existingChart);
                return;
              }
            }

            const enc = el.getAttribute("data-options-encoded") || "";
            const rawAttr = enc
              ? decodeURIComponent(enc)
              : el.getAttribute("data-options") || "{}";
            const raw = (rawAttr || "").trim();
          let opts: any = {};
          try {
            opts = JSON.parse(raw);
          } catch {
            try {
              // Fallback for JS object notation with single quotes
                const fn = new Function("return (" + raw + ")");
              opts = fn();
            } catch {
              opts = {};
            }
          }

            const chart = echarts.init(
              el,
              resolvedTheme === "dark" ? "dark" : undefined
            );

            // Enhanced options with interactivity
            const hasXAxis =
              opts.xAxis ||
              (Array.isArray(opts.xAxis) && opts.xAxis.length > 0);
            const enhancedOpts = {
              ...opts,
              // Enable data zoom for panning (only if xAxis exists)
              ...(hasXAxis && !opts.dataZoom
                ? {
                    dataZoom: [
                      {
                        type: "slider",
                        show: true,
                        xAxisIndex: [0],
                        start: 0,
                        end: 100,
                      },
                      {
                        type: "inside",
                        xAxisIndex: [0],
                        start: 0,
                        end: 100,
                      },
                    ],
                  }
                : {}),
              // Enhanced tooltip
              tooltip: {
                ...opts.tooltip,
                trigger: opts.tooltip?.trigger || "axis",
                axisPointer: {
                  type: "cross",
                  crossStyle: {
                    color: resolvedTheme === "dark" ? "#8b5cf6" : "#7c3aed",
                  },
                },
                backgroundColor:
                  resolvedTheme === "dark"
                    ? "rgba(31, 41, 55, 0.95)"
                    : "rgba(255, 255, 255, 0.95)",
                borderColor: resolvedTheme === "dark" ? "#4b5563" : "#e5e7eb",
                textStyle: {
                  color: resolvedTheme === "dark" ? "#e5e7eb" : "#1f2937",
                },
              },
              // Enable brush for selection
              brush: opts.brush || {
                toolbox: ["rect", "polygon", "lineX", "lineY", "keep", "clear"],
                xAxisIndex: 0,
              },
              // Enable toolbox with more features
              toolbox: opts.toolbox || {
                show: true,
                feature: {
                  dataZoom: {
                    yAxisIndex: "none",
                  },
                  restore: {},
                  saveAsImage: {},
                },
                iconStyle: {
                  borderColor: resolvedTheme === "dark" ? "#9ca3af" : "#6b7280",
                },
                emphasis: {
                  iconStyle: {
                    borderColor:
                      resolvedTheme === "dark" ? "#a78bfa" : "#7c3aed",
                  },
                },
              },
            };

            chart.setOption(enhancedOpts, true);

            // Add hover effects
            chart.on("mouseover", (params: any) => {
              // Highlight on hover
              chart.dispatchAction({
                type: "highlight",
                dataIndex: params.dataIndex,
                seriesIndex: params.seriesIndex,
              });
            });

            chart.on("mouseout", (params: any) => {
              // Remove highlight
              chart.dispatchAction({
                type: "downplay",
                dataIndex: params.dataIndex,
                seriesIndex: params.seriesIndex,
              });
            });

            // Make charts interactive with resize handler
            const resizeObserver = new ResizeObserver(() => {
              chart.resize();
            });
            resizeObserver.observe(el);

          chartsRef.current.push(chart);
        });
        }
        (window as any).define = prevDefine;
      } catch (err) {
        console.warn("ECharts initialization error:", err);
      }
    };

    // Use a small delay to ensure DOM is ready, especially in split view
    const timer = setTimeout(() => {
    initMermaid();
    initECharts();
    }, 100);

    return () => {
      clearTimeout(timer);
      chartsRef.current.forEach((c) => c?.dispose?.());
      chartsRef.current = [];
    };
  }, [html, resolvedTheme]);

  const isDark = resolvedTheme === "dark";

  if (!content) {
    return (
      <div
        className={`preview-pane ${className}`}
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isDark ? "#111827" : "#ffffff",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: isDark ? "#9ca3af" : "#6b7280",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
          <p style={{ fontSize: "18px", fontWeight: 500, marginBottom: "8px" }}>
            No content to preview
          </p>
          <p style={{ fontSize: "14px" }}>
            Start typing in the editor to see the preview
          </p>
        </div>
      </div>
    );
  }

  const scrollToHeading = useCallback((id: string) => {
    // Use a small delay to ensure DOM is ready
    setTimeout(() => {
      const element = containerRef.current?.querySelector(`#${id}`);
      if (!element) return;

      // Find the scrollable container - it's the parent div with overflow: auto
      let scrollContainer: HTMLElement | null = null;
      let current: HTMLElement | null = element.parentElement;

      // Walk up the DOM tree to find the scrollable container
      while (current) {
        const style = window.getComputedStyle(current);
        if (
          style.overflow === "auto" ||
          style.overflowY === "auto" ||
          style.overflow === "scroll" ||
          style.overflowY === "scroll"
        ) {
          scrollContainer = current;
          break;
        }
        current = current.parentElement;
      }

      if (scrollContainer) {
        // Calculate scroll position relative to the scroll container
        const elementRect = element.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const scrollOffset =
          elementRect.top - containerRect.top + scrollContainer.scrollTop - 20; // 20px offset from top

        scrollContainer.scrollTo({
          top: Math.max(0, scrollOffset),
          behavior: "smooth",
        });
      } else {
        // Fallback to standard scrollIntoView
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, []);

  return (
    <div
      className={`preview-pane ${className}`}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: isMobile && showSidebar ? "column" : "row",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Heading Navigation Sidebar */}
      {showSidebar && headings.length > 0 && (
        <div
          style={{
            width: isMobile ? "100%" : "250px",
            maxWidth: isMobile ? "100%" : "250px",
            height: isMobile ? "200px" : "auto",
            maxHeight: isMobile ? "200px" : "none",
            borderRight: isMobile
              ? "none"
              : `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
            borderBottom: isMobile
              ? `1px solid ${isDark ? "#374151" : "#e5e7eb"}`
              : "none",
            background: isDark ? "#1f2937" : "#f9fafb",
            overflowY: "auto",
            overflowX: "hidden",
            padding: isMobile ? "8px" : "12px",
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: isMobile ? "11px" : "12px",
              fontWeight: 600,
              color: isDark ? "#9ca3af" : "#6b7280",
              marginBottom: isMobile ? "8px" : "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Table of Contents</span>
            {isMobile && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                style={{
                  background: "transparent",
                  border: "none",
                  color: isDark ? "#9ca3af" : "#6b7280",
                  cursor: "pointer",
                  padding: "2px 6px",
                  fontSize: "12px",
                }}
                title="Close"
              >
                ✕
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHeading(heading.id);
                  // On mobile, close sidebar after clicking
                  if (isMobile && onToggleSidebar) {
                    setTimeout(() => onToggleSidebar(), 300);
                  }
                }}
                style={{
                  padding: isMobile ? "4px 6px" : "6px 8px",
                  paddingLeft: `${
                    isMobile
                      ? 4
                      : 8 + (heading.level - 1) * (isMobile ? 12 : 16)
                  }px`,
                  fontSize:
                    heading.level === 1
                      ? isMobile
                        ? "13px"
                        : "14px"
                      : heading.level === 2
                      ? isMobile
                        ? "12px"
                        : "13px"
                      : isMobile
                      ? "11px"
                      : "12px",
                  fontWeight: heading.level <= 2 ? 600 : 500,
                  border: "none",
                  borderRadius: "4px",
                  background: "transparent",
                  color: isDark ? "#d1d5db" : "#374151",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left",
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = isDark
                      ? "#374151"
                      : "#e5e7eb";
                    e.currentTarget.style.color = isDark
                      ? "#f3f4f6"
                      : "#111827";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = isDark
                      ? "#d1d5db"
                      : "#374151";
                  }
                }}
                onTouchStart={(e) => {
                  // Mobile touch feedback
                  e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb";
                }}
                onTouchEnd={(e) => {
                  setTimeout(() => {
                    e.currentTarget.style.background = "transparent";
                  }, 200);
                }}
                title={heading.text}
              >
                {heading.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: isMobile ? "12px" : "16px",
          background: isDark ? "#111827" : "#ffffff",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // Important for flexbox overflow
        }}
        ref={(el) => {
          if (onScrollContainerRef) onScrollContainerRef(el);
          if (el) containerRef.current = el;
        }}
      >
        {isProcessing || !html ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <Skeleton
              style={{ height: "32px", width: "75%", margin: "0 auto" }}
            />
            <Skeleton style={{ height: "16px", width: "100%" }} />
            <Skeleton style={{ height: "16px", width: "85%" }} />
            <Skeleton style={{ height: "16px", width: "80%" }} />
            <div style={{ marginTop: "24px" }}>
              <Skeleton style={{ height: "24px", width: "50%" }} />
              <div style={{ marginTop: "8px" }}>
                <Skeleton style={{ height: "16px", width: "100%" }} />
                <Skeleton
                  style={{ height: "16px", width: "90%", marginTop: "8px" }}
                />
                <Skeleton
                  style={{ height: "16px", width: "80%", marginTop: "8px" }}
                />
              </div>
            </div>
            <div style={{ marginTop: "24px" }}>
              <Skeleton style={{ height: "24px", width: "65%" }} />
              <Skeleton
                style={{ height: "128px", width: "100%", marginTop: "8px" }}
              />
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className={`markdown-body ${isDark ? "dark" : ""}`}
            data-theme={resolvedTheme}
            data-color-mode={resolvedTheme}
            style={{ 
              wordBreak: "break-word", 
              overflowWrap: "break-word",
              color: isDark ? "#e2e8f0" : "#0f172a",
              maxWidth: "100%",
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
});
