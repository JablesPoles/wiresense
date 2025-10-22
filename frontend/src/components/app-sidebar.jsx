import * as React from "react";
import {
  BookOpen,
  Bot,
  ChartSpline,
  Command,
  Frame,
  GitGraph,
  GraduationCap,
  LifeBuoy,
  Map,
  PieChart,
  PieChartIcon,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

// Componentes de navegação e UI
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Dados estáticos do sidebar
const data = {
  user: {
    name: "Matheus",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Monitoramento",
      url: "#",
      icon: ChartSpline,
      isActive: true,
    },
    {
      title: "Documentação",
      url: "#",
      icon: GraduationCap,
      items: [
        {
          title: "Github",
          url: "https://github.com/JablesPoles/wiresense",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        {
          title: "Tutorial",
          url: "#",
        },
      ],
    },
    {
      title: "Configurações",
      url: "#",
      icon: Settings2,
    },
  ],
  navSecondary: [
    {
      title: "Suporte",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
};

// Sidebar principal da aplicação
export function AppSidebar({ ...props }) {
  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      {/* Cabeçalho do Sidebar */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">WireSense</span>
                  <span className="truncate text-xs">Energy Monitor</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Conteúdo principal do Sidebar */}
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* Footer do Sidebar */}
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
