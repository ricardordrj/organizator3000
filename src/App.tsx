import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { LockIcon, LogOutIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppProvider } from '@/context/AppProvider'
import { useAppContext } from '@/context'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { TasksPage } from '@/pages/TasksPage'
import { TaskDetailPage } from '@/pages/TaskDetailPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { CadastrosPage } from '@/pages/CadastrosPage'
import { FinancesPage } from '@/pages/FinancesPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ComprasPage } from '@/pages/ComprasPage'
import { useTheme } from '@/hooks'

function AppToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme} richColors closeButton position="top-right" />
}

const LOGOUT_URL = '/cdn-cgi/access/logout'

function NoAccess({ email }: { email: string }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <LockIcon className="size-8 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <p className="font-medium">Sem acesso</p>
        <p className="text-sm text-muted-foreground">{email} não tem permissão para usar este app.</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => window.location.assign(LOGOUT_URL)}>
        <LogOutIcon className="size-3.5" />
        Sair
      </Button>
    </div>
  )
}

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="cadastros" element={<CadastrosPage />} />
        <Route path="financas" element={<FinancesPage />} />
        <Route path="compras" element={<ComprasPage />} />
        <Route path="projetos" element={<ProjectsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="roadmap" element={<Navigate to="/settings" replace />} />
        <Route path="upgrade-pc" element={<Navigate to="/compras" replace state={{ tab: 'upgrade-pc' }} />} />
        <Route path="dark-fantasy" element={<Navigate to="/projetos" replace />} />
      </Route>
    </Routes>
  )
}

function AppRoutes() {
  const { user } = useAppContext()
  if (user && user.role !== 'admin') return <NoAccess email={user.email} />
  return <AdminRoutes />
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <AppToaster />
    </AppProvider>
  )
}

export default App
