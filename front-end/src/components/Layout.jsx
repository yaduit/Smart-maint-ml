import Navbar from './Navbar.jsx'

const Layout = ({ children }) => (
  <div className="min-h-screen bg-[#f6f8fa]">
    <Navbar />
    <main className="max-w-[1200px] mx-auto px-4 py-5">
      {children}
    </main>
  </div>
)

export default Layout