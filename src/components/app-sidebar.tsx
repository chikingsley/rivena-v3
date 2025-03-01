import * as React from "react"
import { Clock, Brain, Target, Command } from "lucide-react"

import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import { SearchForm } from "./search-form"
import { TimelineContent } from "./timeline-content"
import { GoalsContent } from "./goals-content"
import { MemoriesContent } from "./memories-content"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Rivena AI",
      logo: Command,
      plan: "Your Companion",
    },
  ],
}

export function AppSidebar() {
  const [activeTab, setActiveTab] = React.useState("timeline")

  return (
    <Sidebar className="border-r bg-gray-50/95">
      <SidebarHeader className="border-b border-gray-200 bg-white p-4">
        <TeamSwitcher teams={data.teams} />
        <SearchForm className="mt-4" />
      </SidebarHeader>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          className={`flex-1 py-2 px-3 text-sm font-medium flex items-center justify-center gap-1.5 ${
            activeTab === "timeline" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("timeline")}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Timeline</span>
        </button>
        <button
          className={`flex-1 py-2 px-3 text-sm font-medium flex items-center justify-center gap-1.5 ${
            activeTab === "goals" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("goals")}
        >
          <Target className="h-3.5 w-3.5" />
          <span>Goals</span>
        </button>
        <button
          className={`flex-1 py-2 px-3 text-sm font-medium flex items-center justify-center gap-1.5 ${
            activeTab === "memories" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("memories")}
        >
          <Brain className="h-3.5 w-3.5" />
          <span>Memories</span>
        </button>
      </div>

      <SidebarContent>
        {activeTab === "timeline" && <TimelineContent />}
        {activeTab === "goals" && <GoalsContent />}
        {activeTab === "memories" && <MemoriesContent />}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

