import { createRouter, createWebHistory } from 'vue-router';
import ReporterDashboard from '../views/ReporterDashboard.vue';
import MaintenanceDashboard from '../views/MaintenanceDashboard.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import LoginView from '../views/LoginView.vue';
import SignupView from '../views/SignupView.vue';
import StaffingBoard from '../views/StaffingBoard.vue';
import { currentUser, homeForRole } from '../services/auth';

const router = createRouter({ history:createWebHistory(), routes:[
  { path:'/', redirect:'/login' },
  { path:'/login', component:LoginView, meta:{ public:true } },
  { path:'/signup', component:SignupView, meta:{ public:true } },
  { path:'/reporter', component:ReporterDashboard, meta:{ role:'REPORTER' } },
  { path:'/maintenance', component:MaintenanceDashboard, meta:{ role:'MAINTENANCE' } },
  { path:'/admin', component:AdminDashboard, meta:{ role:'ADMIN' } },
  { path:'/admin/staffing', component:StaffingBoard, meta:{ role:'ADMIN' } }
]});

router.beforeEach(to => {
  const user = currentUser();
  if (to.meta.public) return user ? homeForRole(user.role) : true;
  if (!user) return '/login';
  if (to.meta.role && to.meta.role !== user.role) return homeForRole(user.role);
  return true;
});

export default router;
