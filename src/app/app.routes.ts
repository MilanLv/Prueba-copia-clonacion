import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: '',
        loadComponent: () => import('./shared/components/layout/layout.component'),
        canActivate: [AuthGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./business/dashboard/dashboard.component')
            },
            {
                path: 'profile',
                loadComponent: () => import('./business/profile/profile.component')
            },
            {
                path: 'tables',
                loadComponent: () => import('./business/tables/tables.component')
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./business/usuarios/usuarios-list/usuarios-list.component').then(m => m.UsuariosListComponent)
            },
            {
                path: 'usuarios/nuevo',
                loadComponent: () => import('./business/usuarios/usuarios-form/usuarios-form.component').then(m => m.UsuariosFormComponent)
            },
            {
                path: 'usuarios/editar/:id',
                loadComponent: () => import('./business/usuarios/usuarios-form/usuarios-form.component').then(m => m.UsuariosFormComponent)
            },
            {
                path: 'usuarios/detalle/:id',
                loadComponent: () => import('./business/usuarios/usuarios-detail/usuarios-detail.component').then(m => m.UsuariosDetailComponent)
            },
            {
                path: 'roles',
                loadComponent: () => import('./business/roles/roles-list/roles-list.component').then(m => m.RolesListComponent)
            },
            {
                path: 'roles/nuevo',
                loadComponent: () => import('./business/roles/roles-form/roles-form.component').then(m => m.RolesFormComponent)
            },
            {
                path: 'roles/editar/:id',
                loadComponent: () => import('./business/roles/roles-form/roles-form.component').then(m => m.RolesFormComponent)
            },
                   {
                       path: 'roles/detalle/:id',
                       loadComponent: () => import('./business/roles/roles-detail/roles-detail.component').then(m => m.RolesDetailComponent)
                   },
                   {
                       path: 'modulos',
                       loadComponent: () => import('./business/modulos/modulos-list/modulos-list.component').then(m => m.ModulosListComponent)
                   },
                   {
                       path: 'modulos/nuevo',
                       loadComponent: () => import('./business/modulos/modulos-form/modulos-form.component').then(m => m.ModulosFormComponent)
                   },
                   {
                       path: 'modulos/editar/:id',
                       loadComponent: () => import('./business/modulos/modulos-form/modulos-form.component').then(m => m.ModulosFormComponent)
                   },
                   {
                       path: 'modulos/detalle/:id',
                       loadComponent: () => import('./business/modulos/modulos-detail/modulos-detail.component').then(m => m.ModulosDetailComponent)
                   },
                   {
                       path: 'permisos',
                       loadComponent: () => import('./business/permisos/permisos-list/permisos-list.component').then(m => m.PermisosListComponent)
                   },
                   {
                       path: 'permisos/nuevo',
                       loadComponent: () => import('./business/permisos/permisos-form/permisos-form.component').then(m => m.PermisosFormComponent)
                   },
                   {
                       path: 'permisos/editar/:id',
                       loadComponent: () => import('./business/permisos/permisos-form/permisos-form.component').then(m => m.PermisosFormComponent)
                   },
                   {
                       path: 'permisos/detalle/:id',
                       loadComponent: () => import('./business/permisos/permisos-detail/permisos-detail.component').then(m => m.PermisosDetailComponent)
                   },
                   {
                       path: 'productos',
                       loadComponent: () => import('./business/productos/productos-list/productos-list.component').then(m => m.ProductosListComponent)
                   },
                   {
                       path: 'productos/nuevo',
                       loadComponent: () => import('./business/productos/productos-form/productos-form.component').then(m => m.ProductosFormComponent)
                   },
                   {
                       path: 'productos/editar/:id',
                       loadComponent: () => import('./business/productos/productos-form/productos-form.component').then(m => m.ProductosFormComponent)
                   },
                   {
                       path: 'productos/detalle/:id',
                       loadComponent: () => import('./business/productos/productos-detail/productos-detail.component').then(m => m.ProductosDetailComponent)
                   },
                   {
                       path: 'cotizaciones',
                       loadComponent: () => import('./business/cotizaciones/cotizaciones.component').then(m => m.CotizacionesComponent)
                   },
                   {
                       path: 'cotizaciones/lista',
                       loadComponent: () => import('./business/cotizaciones/cotizaciones-list/cotizaciones-list.component').then(m => m.CotizacionesListComponent)
                   },
                   {
                       path: 'cotizaciones/detalle/:id',
                       loadComponent: () => import('./business/cotizaciones/cotizaciones-detail/cotizaciones-detail.component').then(m => m.CotizacionesDetailComponent)
                   },
                   {
                       path: 'ventas',
                       loadComponent: () => import('./business/ventas/ventas.component').then(m => m.VentasComponent)
                   },
                   {
                       path: 'ventas/lista',
                       loadComponent: () => import('./business/ventas/ventas-list/ventas-list.component').then(m => m.VentasListComponent)
                   },
                   {
                       path: 'ventas/detalle/:id',
                       loadComponent: () => import('./business/ventas/ventas-detail/ventas-detail.component').then(m => m.VentasDetailComponent)
                   },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }

        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
