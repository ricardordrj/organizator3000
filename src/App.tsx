import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/context/AppProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { TasksPage } from '@/pages/TasksPage'
import { TaskDetailPage } from '@/pages/TaskDetailPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { CadastrosPage } from '@/pages/CadastrosPage'
import { FinancesPage } from '@/pages/FinancesPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ComprasPage } from '@/pages/ComprasPage'
import { CommanderPage } from '@/pages/CommanderPage'
import { useTheme } from '@/hooks'

function AppToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme} richColors closeButton position="top-right" />
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/:id" element={<TaskDetailPage />} />
            <Route path="cadastros" element={<CadastrosPage />} />
            <Route path="financas" element={<FinancesPage />} />
            <Route path="compras" element={<ComprasPage />} />
            <Route path="projetos" element={<ProjectsPage />} />
            <Route path="mesao" element={<CommanderPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="roadmap" element={<Navigate to="/settings" replace />} />
            <Route path="upgrade-pc" element={<Navigate to="/compras" replace state={{ tab: 'upgrade-pc' }} />} />
            <Route path="dark-fantasy" element={<Navigate to="/projetos" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <AppToaster />
    </AppProvider>
  )
}

export default App
