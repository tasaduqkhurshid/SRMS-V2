import Login from '../pages/login/Login.js';
import AdminLayout from '../pages/layout/AdminLayout.js';

import Dashboard from '../pages/dashboard/Dashboard.js';
import SchoolList from '../components/pages/school/SchoolList.js';
import Gateways from '../pages/gateways/Gateways.js';
import TicketList from '../pages/support/TicketList.js';
import SupportTicketDetailAdmin from '../components/pages/support/SupportTicketDetailAdmin.js';

export const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: Dashboard
      },
      {
        path: 'schools',
        name: 'schools',
        component: SchoolList
      },
      {
        path: 'payment-gateways',
        name: 'payment-gateways',
        component: Gateways
      },
      {
        path: 'support/dashboard',
        name: 'support-dashboard',
        component: TicketList
      },
      {
        path: 'support/tickets',
        name: 'support-tickets',
        component: TicketList
      },
      {
        path: 'support/tickets/:id',
        name: 'support-ticket-detail',
        component: SupportTicketDetailAdmin,
        props: (route) => {
          const ticket = route.query.ticket ? JSON.parse(route.query.ticket) : null
          return { ticketId: route.params.id, ticket }
        }
      }
    ]
  }
];