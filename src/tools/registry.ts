import { lazy } from 'react';

export interface ToolInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  component: React.LazyExoticComponent<React.ComponentType>;
  category: string;
  isNew?: boolean;
  comingSoon?: boolean;
}

const tools: ToolInfo[] = [
  {
    id: 'mockup-generator',
    name: 'Mockup Generator',
    description: 'Place designs onto t-shirt mockups in batch',
    icon: '\uD83D\uDC55',
    path: '/mockup-generator',
    component: lazy(() => import('./mockup-generator')),
    category: 'Mockup',
  },
  {
    id: 'image-prompt-generator',
    name: 'Image Prompt Generator',
    description: 'AI phân tích thiết kế POD, tự động tạo ảnh tương tự qua DALL-E',
    icon: '🧠',
    path: '/image-prompt-generator',
    component: lazy(() => import('./image-prompt-generator')),
    category: 'AI',
    isNew: true,
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    description: 'Remove image backgrounds automatically',
    icon: '\u2702\uFE0F',
    path: '/background-remover',
    component: lazy(() => import('./background-remover')),
    category: 'Image',
    comingSoon: true,
  },
  {
    id: 'image-resizer',
    name: 'Batch Resizer',
    description: 'Resize images for Etsy, Shopee, Amazon...',
    icon: '\uD83D\uDCD0',
    path: '/image-resizer',
    component: lazy(() => import('./image-resizer')),
    category: 'Image',
    comingSoon: true,
  },
  {
    id: 'color-separator',
    name: 'Color Separator',
    description: 'Separate colors for screen printing / DTG',
    icon: '\uD83C\uDFA8',
    path: '/color-separator',
    component: lazy(() => import('./color-separator')),
    category: 'Print',
    comingSoon: true,
  },
  {
    id: 'listing-generator',
    name: 'Listing Generator',
    description: 'Generate titles & tags for Etsy, Shopee, Amazon',
    icon: '\uD83D\uDCDD',
    path: '/listing-generator',
    component: lazy(() => import('./listing-generator')),
    category: 'Marketing',
    comingSoon: true,
  },
];

export default tools;

export const categories = [...new Set(tools.map((t) => t.category))];
