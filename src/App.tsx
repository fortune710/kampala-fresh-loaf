import { Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react';
import Loading from './components/Loading';
import './App.css'


//import ViewTransaction from './pages/SeeTransaction';
const LoginPage = lazy(() => import('./pages/Login').then(module => ({ default: module.default })))
const SalesHomePage = lazy(() => import('./pages/Sales/Home').then(module => ({ default: module.default })))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.default })));
const ProductionsPage = lazy(() => import('./pages/Production/Productions').then(module => ({ default: module.default })))

//Admin Pages
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard').then(module => ({ default: module.default })))
const StaffTable = lazy(() => import('./pages/Admin/StaffTable').then(module => ({ default: module.default })))
const PaymentsPage = lazy(() => import('./pages/Admin/Transactions').then(module => ({ default: module.default })))
const Products = lazy(() => import('./pages/Admin/Products').then(module => ({ default: module.default })))
const Inventory = lazy(() => import('./pages/Admin/Inventory').then(module => ({ default: module.default })))
const AdminLogin = lazy(() => import('./pages/Admin/Login').then(module => ({ default: module.default })))


function App() {

  return (
    <Suspense fallback={<Loading/>}>
      <Routes>
        <Route index path="/" element={<LoginPage/>}/>
        <Route index path="/login" element={<LoginPage/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        
        <Route path='/admin' element={<AdminDashboard/>}>  
          <Route path='users' index element={<StaffTable/>}/>
          <Route path="payments" element={<PaymentsPage/>}/>
          <Route path="inventory" element={<Inventory/>} />
          <Route path="update" element={<Products/>} />
        </Route>

        <Route path="/admin-login" element={<AdminLogin/>}/>
        
        <Route path="/sales" element={<SalesHomePage/>}/>
        <Route path="/productions" element={<ProductionsPage/>}/>
      </Routes>
    </Suspense>
      
  )
}

export default App
