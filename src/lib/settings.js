// Accent color themes
export const ACCENT_THEMES = {
  teal: {
    label: 'Teal (default)',
    hex: '#1D9E75',
    vars: {
      '--teal-50': '#E1F5EE',
      '--teal-100': '#9FE1CB',
      '--teal-200': '#5DCAA5',
      '--teal-400': '#1D9E75',
      '--teal-600': '#0F6E56',
      '--teal-800': '#085041',
      '--teal-900': '#04342C',
    }
  },
  blue: {
    label: 'Blue',
    hex: '#2563EB',
    vars: {
      '--teal-50': '#EFF6FF',
      '--teal-100': '#BFDBFE',
      '--teal-200': '#93C5FD',
      '--teal-400': '#2563EB',
      '--teal-600': '#1D4ED8',
      '--teal-800': '#1E40AF',
      '--teal-900': '#1E3A8A',
    }
  },
  red: {
    label: 'Red',
    hex: '#DC2626',
    vars: {
      '--teal-50': '#FEF2F2',
      '--teal-100': '#FECACA',
      '--teal-200': '#FCA5A5',
      '--teal-400': '#DC2626',
      '--teal-600': '#B91C1C',
      '--teal-800': '#991B1B',
      '--teal-900': '#7F1D1D',
    }
  },
  pink: {
    label: 'Pink',
    hex: '#DB2777',
    vars: {
      '--teal-50': '#FDF2F8',
      '--teal-100': '#FCE7F3',
      '--teal-200': '#FBCFE8',
      '--teal-400': '#DB2777',
      '--teal-600': '#BE185D',
      '--teal-800': '#9D174D',
      '--teal-900': '#831843',
    }
  },
  grey: {
    label: 'Grey',
    hex: '#4B5563',
    vars: {
      '--teal-50': '#F9FAFB',
      '--teal-100': '#E5E7EB',
      '--teal-200': '#D1D5DB',
      '--teal-400': '#4B5563',
      '--teal-600': '#374151',
      '--teal-800': '#1F2937',
      '--teal-900': '#111827',
    }
  }
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('nurseiq_settings') || '{"accent":"teal","userName":"Nursing Student"}')
  } catch {
    return { accent: 'teal', userName: 'Nursing Student' }
  }
}

export function saveSettings(settings) {
  localStorage.setItem('nurseiq_settings', JSON.stringify(settings))
}

export function applyAccentTheme(accentKey) {
  const theme = ACCENT_THEMES[accentKey] || ACCENT_THEMES.teal
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([key, val]) => {
    root.style.setProperty(key, val)
  })
}

export function loadOnboarded() {
  return localStorage.getItem('nurseiq_onboarded') === 'true'
}

export function setOnboarded() {
  localStorage.setItem('nurseiq_onboarded', 'true')
}
