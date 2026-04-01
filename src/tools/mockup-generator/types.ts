export interface Point {
  x: number;
  y: number;
}

export interface PrintArea {
  // 4 corners in order: top-left, top-right, bottom-right, bottom-left
  corners: [Point, Point, Point, Point];
  displayWidth: number;
  displayHeight: number;
}

export interface MockupFile {
  id: string;
  name: string;
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  printArea: PrintArea | null;
}

export interface DesignFile {
  id: string;
  name: string;
  folder: string; // folder name (empty string if no folder)
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

export interface CompositeResult {
  id: string;
  name: string;
  folder: string; // folder from design
  src: string;
  mockupId: string;
  designId: string;
  mockupName: string;
  designName: string;
}
