import IRoute from '../interfaces/route';
import AboutPage from '../pages/AboutPage';
import UserPage from '../pages/UserPage';
import HomePage from '../pages/MainPage';
import LoginPage from '../pages/LogginPage';
import NotFound from '../pages/404';
import AdminPage from '../pages/Admin/AdminPage';
import UserLayout from '../layouts/UserOutlet';
import VaultPage from '../pages/VaultPage'
import EventListPage from '../pages/EventListPage';
import EventPage from '../pages/Event/EventPage';
import PostListPage from '../pages/PostListPage';
import PostPage from '../pages/Post/PostPage';
import VoteListPage from '../pages/VoteListPage';
import VoteDetailPage from '../pages/VoteDetailPage';
import DonationPage from '../pages/DonationPage';
import LicensePage from '../pages/LicensePage';
import PaymentRedirectPage from '../pages/PaymentRedirectPage';
import ProtectedRoute from '../components/ProtectedRoute';
import { user_access_type } from '../commons/user_access_type';
import NotAuthorizedPage from '../pages/403';

const routes: IRoute[] = [
    {
        path: '/',
        name: 'Home Page',
        component: HomePage,
        exact: true
    },
    {
        path: '/login',
        name: 'Login Page',
        component: LoginPage,
        exact: true
    },
    {
        path: '/about',
        name: 'About Page',
        component: AboutPage,
        exact: true
    },
    {
        path: '/admin',
        name: 'Admin Page',
        component: AdminPage,
        exact: true
    },
    {
        path: '/user/:number',
        name: 'User Layout',
        component: UserLayout,
        exact: false, // Set to false to allow nesting
        children: [
            {
                path: '',
                name: 'User Page',
                component: UserPage,
                exact: true
            }
        ]
    },
    {
        path: '/vault',
        name: 'Vault Page',
        component: () => (
            <ProtectedRoute requiredRole={[user_access_type.LICENSED, user_access_type.ADMIN, user_access_type.EMPLOYEE, user_access_type.SUPER_ADMIN]}>
                <VaultPage />
            </ProtectedRoute>
        ),
        exact: true
    },
    {
        path: '/eventList',
        name: 'Event List',
        component: () => (
            <ProtectedRoute requiredRole={[user_access_type.LICENSED, user_access_type.ADMIN, user_access_type.EMPLOYEE, user_access_type.SUPER_ADMIN]}>
                <EventListPage />
            </ProtectedRoute>
        ),
        exact: true
    },
    {
        path: '/event/eventPage/:eventId',
        name: 'Event Page',
        component: () => (
            <ProtectedRoute requiredRole={[user_access_type.LICENSED, user_access_type.ADMIN, user_access_type.EMPLOYEE, user_access_type.SUPER_ADMIN]}>
                <EventPage />
            </ProtectedRoute>
        ),
        exact: true
    },
    {
        path: '/postList',
        name: 'Post List',
        component:() =>
            (<ProtectedRoute>
                <PostListPage />
            </ProtectedRoute>),
        exact: true
    },
    {
        path: '/post/postPage/:postId',
        name: 'Post Page',
        component: PostPage,
        exact: true
    },
    {
        path: '/voteList',
        name: 'Vote List',
        component: () => (
            <ProtectedRoute requiredRole={[user_access_type.LICENSED, user_access_type.ADMIN, user_access_type.EMPLOYEE, user_access_type.SUPER_ADMIN]}>
                <VoteListPage />
            </ProtectedRoute>
        ),
        exact: true
    },
    {
        path: '/votes/:voteId',
        name: 'Vote Page',
        component: () => (
            <ProtectedRoute requiredRole={[user_access_type.LICENSED, user_access_type.ADMIN, user_access_type.EMPLOYEE, user_access_type.SUPER_ADMIN]}>
                <VoteDetailPage />
            </ProtectedRoute>
        ),
        exact: true
    },
    {
        path: '/donate',
        name: 'Donate',
        component: () => (
            <ProtectedRoute requiredRole={[user_access_type.LICENSED, user_access_type.ADMIN, user_access_type.EMPLOYEE, user_access_type.SUPER_ADMIN]}>
                <DonationPage />
            </ProtectedRoute>
        ),
        exact: true
    },
    {
        path: '/licenses',
        name: 'License',
        component: LicensePage,
        exact: true
    },
    {
        path: '/payment-redirect',
        name: 'Stripe Redirect',
        component: PaymentRedirectPage,
        exact: true
    },
    {
        path: '/not-authorized',
        name: 'Not Authorized',
        component: NotAuthorizedPage,
        exact: true
    },
    {
        path: '*',
        name: 'Not Found',
        component: NotFound,
        exact: true
    },
]

export default routes;