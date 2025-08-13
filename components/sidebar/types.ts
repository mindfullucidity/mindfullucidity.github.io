interface SidebarItemType {
  id: string
  label: string
  icon: any // Using 'any' for the icon component type
  to: string
  staticColor?: string
}

export type { SidebarItemType }
