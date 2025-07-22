"use client"

import { Button } from "@/components/ui/button"
import { Home, Users, Settings, LogOut, Plus, Palette } from "lucide-react"
import type { User, Child } from "@/app/page"
import { useState } from "react"
import { ArtworkGallery } from "@/components/artwork-gallery"
import { EnhancedChildCard } from "@/components/enhanced-child-card"
import { GalleryAnalysisInterface } from "@/components/gallery-analysis-interface"
import { ParentSettings } from "@/components/parent-settings"
import { AddChildModal } from "@/components/add-child-modal"
import { AnalysisQuickActions } from "@/components/analysis-quick-actions"
import { FamilyArtJourneyWidget } from "@/components/family-art-journey-widget"

interface ParentDashboardProps {
  user: User
  children: Child[]
  onStartSession: (child: Child) => void
  onLogout: () => void
  onAddChild: (child: Omit<Child, "id">) => void
}

export function ParentDashboard({ user, children, onStartSession, onLogout, onAddChild }: ParentDashboardProps) {
  const [showGallery, setShowGallery] = useState<Child | null>(null)
  const [showAnalysis, setShowAnalysis] = useState<Child | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showAddChild, setShowAddChild] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleViewArtwork = (child: Child) => {
    setShowAnalysis(child)
  }

  const handleAddChild = (childData: Omit<Child, "id">) => {
    onAddChild(childData)
    setShowAddChild(false)
  }

  if (showSettings) {
    return <ParentSettings onBack={() => setShowSettings(false)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Family Art Therapy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout} className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              size="sm"
              className="flex items-center space-x-2"
              onClick={() => setActiveTab("dashboard")}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Button>
          </div>
        </nav>

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">Manage your children's art therapy sessions and view their creative progress.</p>
        </div>

        {/* My Children Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">My Children</h3>
            <Button
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setShowAddChild(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Add New Child</span>
            </Button>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Children Added Yet</h3>
              <p className="text-gray-600 mb-4">Add your first child to start their art therapy journey</p>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowAddChild(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Child
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <EnhancedChildCard
                  key={child.id}
                  child={child}
                  onStartSession={onStartSession}
                  onViewArtwork={handleViewArtwork}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Child Modal */}
        <AddChildModal isOpen={showAddChild} onClose={() => setShowAddChild(false)} onAddChild={handleAddChild} />

        {/* Gallery View */}
        {showGallery && (
          <div className="fixed inset-0 z-50">
            <ArtworkGallery
              child={showGallery}
              children={children}
              onBack={() => setShowGallery(null)}
              isParentView={true}
            />
          </div>
        )}

        {/* Analysis Interface */}
        {showAnalysis && (
          <div className="fixed inset-0 z-50 bg-white">
            <GalleryAnalysisInterface child={showAnalysis} onBack={() => setShowAnalysis(null)} />
          </div>
        )}
      </div>
    </div>
  )
}
