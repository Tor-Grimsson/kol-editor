import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import KolEditor from './pages/KolEditor'
import AtomsPage from './pages/AtomsPage'
import MoleculesPage from './pages/MoleculesPage'
import OrganismsPage from './pages/OrganismsPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<KolEditor />} />
        <Route path="/components" element={<Navigate to="/components/atoms" replace />} />
        <Route path="/components/atoms" element={<AtomsPage />} />
        <Route path="/components/molecules" element={<MoleculesPage />} />
        <Route path="/components/organisms" element={<OrganismsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
