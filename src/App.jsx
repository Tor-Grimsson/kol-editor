import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { generateFileId } from './utils/fileStorage'
import HomeScreen from './pages/HomeScreen'
import KolEditor from './pages/KolEditor'
import AtomsPage from './pages/AtomsPage'
import MoleculesPage from './pages/MoleculesPage'
import OrganismsPage from './pages/OrganismsPage'

const HomeWrapper = () => {
  const navigate = useNavigate()

  const handleNewFile = () => {
    const fileId = generateFileId()
    navigate(`/editor/${fileId}`)
  }

  const handleOpenFile = (fileId) => {
    navigate(`/editor/${fileId}`)
  }

  return <HomeScreen onNewFile={handleNewFile} onOpenFile={handleOpenFile} />
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeWrapper />} />
        <Route path="/editor/:fileId" element={<KolEditor />} />
        <Route path="/components" element={<Navigate to="/components/atoms" replace />} />
        <Route path="/components/atoms" element={<AtomsPage />} />
        <Route path="/components/molecules" element={<MoleculesPage />} />
        <Route path="/components/organisms" element={<OrganismsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
