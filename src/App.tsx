import { Route, Routes } from 'react-router-dom'
import AdminDashboard from './pages/Admin/Dashboard'
import StaffTable from './pages/Admin/StaffTable';


import './App.css'
import LoginPage from './pages/Login';
import { lazy, Suspense } from 'react';
import Loading from './components/Loading';

import Inventory from './pages/Admin/Inventory';
import PaymentsPage from './pages/Admin/Transactions';
import Update from './pages/Admin/Products';
import ViewTransaction from './pages/SeeTransaction';

const SalesHomePage = lazy(() => import('./pages/Sales/Home').then(module => ({ default: module.default })))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.default })));


const ProductionsPage = lazy(() => import('./pages/Production/Productions').then(module => ({ default: module.default })))


function App() {

  return (
    <Suspense fallback={<Loading/>}>
      <Routes>
        <Route index path="/" element={<LoginPage/>}/>
        <Route index path="/login" element={<LoginPage/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>

        <Route path="/transaction/:id" element={<ViewTransaction/>}/>
        
        <Route path='/admin' element={<AdminDashboard/>}>  
          <Route path='users' index element={<StaffTable/>}/>
          <Route path="payments" element={<PaymentsPage/>}/>
          <Route path="inventory" element={<Inventory/>} />
          <Route path="update" element={<Update/>} />
        </Route>

        
        <Route path="/sales" element={<SalesHomePage/>}/>
        <Route path="/productions" element={<ProductionsPage/>}/>
      </Routes>
    </Suspense>
      
  )
}

export default App
