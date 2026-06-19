import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Machines  from './pages/Machines.jsx'
import Alerts    from './pages/Alerts.jsx'
import History   from './pages/History.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/machines" element={<Machines />}  />
        <Route path="/alerts"   element={<Alerts />}    />
        <Route path="/history"  element={<History />}   />
      </Routes>
    </BrowserRouter>
  )
}

export default App