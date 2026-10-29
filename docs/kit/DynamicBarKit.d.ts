// DynamicBarKit typings. Add `/// <reference path="../DynamicBarKit.d.ts" />` to main.js
// (or open this folder in an editor) for autocompletion.

type Color = "white" | "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink" | "gray" | (string & {});
type Weight = "regular" | "medium" | "semibold" | "bold" | "heavy" | "black" | "light" | "thin" | "ultralight";

interface NodeBase {
  padding?: number; width?: number; height?: number;
  background?: Color; radius?: number; border?: Color; opacity?: number;
}
interface StackNode extends NodeBase { type: "vstack" | "hstack" | "zstack"; children?: UINode[]; spacing?: number; align?: "leading" | "center" | "trailing"; }
interface ScrollNode extends NodeBase { type: "scroll"; children?: UINode[]; spacing?: number; }
interface GridNode extends NodeBase { type: "grid"; children?: UINode[]; columns?: number; spacing?: number; }
interface TextNode extends NodeBase { type: "text"; text: string; size?: number; weight?: Weight; color?: Color; mono?: boolean; lines?: number; align?: "leading" | "center" | "trailing"; }
interface SymbolNode extends NodeBase { type: "symbol"; symbol: string; size?: number; weight?: Weight; color?: Color; }
interface ImageNode extends NodeBase { type: "image"; src: string; }
interface ProgressNode extends NodeBase { type: "progress"; value: number; color?: Color; }
interface RingNode extends NodeBase { type: "ring"; value: number; size?: number; color?: Color; text?: string; }
interface SparkNode extends NodeBase { type: "spark"; values: number[]; color?: Color; }
interface ButtonNode extends NodeBase { type: "button"; title?: string; symbol?: string; action: string; data?: string; color?: Color; }
interface ToggleNode extends NodeBase { type: "toggle"; title?: string; on: boolean; action: string; }
interface SliderNode extends NodeBase { type: "slider"; value: number; min?: number; max?: number; action: string; }
interface SpacerNode extends NodeBase { type: "spacer" | "divider"; }
type UINode = StackNode | ScrollNode | GridNode | TextNode | SymbolNode | ImageNode | ProgressNode | RingNode | SparkNode | ButtonNode | ToggleNode | SliderNode | SpacerNode;

interface Badge { symbol?: string; text?: string; tint?: Color; }

declare const DynamicBarKit: {
  kit: 2;
  addon: { id: string; version: string };
  page(tree: UINode, options?: { id?: string; height?: number; width?: number }): void;
  removePage(id: string): void;
  flash(options: Badge & { seconds?: number }): void;
  activity(options: Badge | null): void;
  every(seconds: number, fn: () => void): number;
  after(seconds: number, fn: () => void): number;
  cancel(timer: number): void;
  onAction(fn: (action: string, value: string | number | boolean | null) => void): void;
  onOpen(fn: () => void): void;
  onClose(fn: () => void): void;
  onSettings(fn: (key: string, value: string | number | boolean) => void): void;
  haptic(): void;
  openURL(url: string): void;
  storage: { get<T = any>(key: string): T | undefined; set(key: string, value: any): void; remove(key: string): void };
  settings: { get<T = string | number | boolean>(key: string): T | undefined };
  system: {
    battery(): { level: number; charging: boolean; plugged: boolean };
    cpu(): number;
    memory(): { used: number; total: number; fraction: number };
  };
  media: {
    nowPlaying(): { title: string; artist: string; playing: boolean; duration: number; position: number } | undefined;
    playPause(): void; next(): void; previous(): void;
    onChange(fn: (info: { title: string; artist: string; playing: boolean }) => void): void;
  };
  clipboard: { read(): string | undefined; write(text: string): void };
  island: {
    readonly isOpen: boolean;
    readonly notch: { width: number; height: number };
    readonly width: 378;
    safeArea(height?: number, width?: number): { x: number; y: number; width: number; height: number };
    open(pageId?: string): void;
    close(): void;
  };
  http: { get(url: string, callback: (error: string | null, response: { status: number; text: string; json(): any }) => void): void };
};

declare function setTimeout(fn: (...args: any[]) => void, ms?: number, ...args: any[]): number;
declare function setInterval(fn: (...args: any[]) => void, ms?: number, ...args: any[]): number;
declare function clearTimeout(timer: number): void;
declare function clearInterval(timer: number): void;
declare function fetch(url: string): Promise<{ ok: boolean; status: number; text(): Promise<string>; json(): Promise<any> }>;