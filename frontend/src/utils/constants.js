// Color palette from design
export const COLORS = {
  primary: '#E07A5F',
  backgroundLight: '#F5F5DC',
  textCharcoal: '#36454F',
  textForest: '#3D403D',
  accentSage: '#B2AC88',
};

// Icon mappings from Material Icons to Lucide React
export const ICON_MAP = {
  local_library: 'BookOpen',
  library_books: 'Library',
  psychology: 'Brain',
  recommend: 'ThumbsUp',
  hub: 'Network',
  notifications_active: 'Bell',
  theater_comedy: 'Smile',
  travel_explore: 'Compass',
  grid_view: 'Grid',
  view_list: 'List',
  expand_more: 'ChevronDown',
  arrow_forward: 'ArrowRight',
};

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  books: {
    list: '/books',
    detail: (id) => `/books/${id}`,
    scan: '/books/scan',
  },
  library: {
    get: '/library',
    add: '/library/add',
    remove: (id) => `/library/${id}`,
  },
  recommendations: {
    get: '/recommendations',
    refresh: '/recommendations/refresh',
  },
};

export default {
  COLORS,
  ICON_MAP,
  API_ENDPOINTS,
};
