import IRoute from '../interfaces/route';
import AboutPage from '../pages/AboutPage';
import UserPage from '../pages/UserPage';
import HomePage from '../pages/MainPage';
import LoginPage from '../pages/LogginPage';
import NotFound from '../pages/404';
import AdminPage from '../pages/Admin/AdminPage';
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
        exact: true,
        keywords: { home: 5, main: 3, welcome: 2 },
    },
    {
        path: '/login',
        name: 'Login Page',
        component: LoginPage,
        exact: true,
        keywords: { login: 5, signIn: 4, access: 3 },
    },
    {
        path: '/about',
        name: 'About Page',
        component: AboutPage,
        exact: true,
        keywords: { about: 5, info: 3, information: 3 },
    },
    {
        path: '/admin',
        name: 'Admin Page',
        component: AdminPage,
        exact: true,
        keywords: { admin: 5, management: 4, dashboard: 3 },
    },
    {
        path: '/user/self',
        name: 'Your User Page',
        component: () => (
            <ProtectedRoute
                requiredRole={[
                    user_access_type.LICENSED,
                    user_access_type.ADMIN,
                    user_access_type.EMPLOYEE,
                    user_access_type.SUPER_ADMIN,
                    user_access_type.USER,
                ]}
            >
                <UserPage />
            </ProtectedRoute>
        ),
        exact: false,
        keywords: { user: 5, profile: 4, account: 3, my: 1, self: 1 },
    },
    {
        path: '/user/:number',
        name: 'User Page',
        component: UserPage,
        exact: false,
    },
    {
        path: '/vault',
        name: 'Vault Page',
        component: () => (
            <ProtectedRoute
                requiredRole={[
                    user_access_type.LICENSED,
                    user_access_type.ADMIN,
                    user_access_type.EMPLOYEE,
                    user_access_type.SUPER_ADMIN,
                ]}
            >
                <VaultPage />
            </ProtectedRoute>
        ),
        exact: true,
        keywords: { vault: 5, secure: 4, storage: 3 },
    },
    {
        path: '/eventList',
        name: 'Event List',
        component: () => (
            <ProtectedRoute
                requiredRole={[
                    user_access_type.LICENSED,
                    user_access_type.ADMIN,
                    user_access_type.EMPLOYEE,
                    user_access_type.SUPER_ADMIN,
                ]}
            >
                <EventListPage />
            </ProtectedRoute>
        ),
        exact: true,
        keywords: { event: 5, list: 4, schedule: 3 },
    },
    {
        path: '/event/eventPage/:eventId',
        name: 'Event Page',
        component: () => (
            <ProtectedRoute
                requiredRole={[
                    user_access_type.LICENSED,
                    user_access_type.ADMIN,
                    user_access_type.EMPLOYEE,
                    user_access_type.SUPER_ADMIN,
                ]}
            >
                <EventPage />
            </ProtectedRoute>
        ),
        exact: true,
    },
    {
        path: '/postList',
        name: 'Post List',
        component: () => (
            <ProtectedRoute>
                <PostListPage />
            </ProtectedRoute>
        ),
        exact: true,
        keywords: { post: 5, list: 4, blog: 3 },
    },
    {
        path: '/post/postPage/:postId',
        name: 'Post Page',
        component: PostPage,
        exact: true,
    },
    {
        path: '/voteList',
        name: 'Vote List',
        component: () => (
            <ProtectedRoute
                requiredRole={[
                    user_access_type.LICENSED,
                    user_access_type.ADMIN,
                    user_access_type.EMPLOYEE,
                    user_access_type.SUPER_ADMIN,
                ]}
            >
                <VoteListPage />
            </ProtectedRoute>
        ),
        exact: true,
        keywords: { vote: 5, list: 4, election: 3 },
    },
    {
        path: '/votes/:voteId',
        name: 'Vote Page',
        component: () => (
            <ProtectedRoute
                requiredRole={[
                    user_access_type.LICENSED,
                    user_access_type.ADMIN,
                    user_access_type.EMPLOYEE,
                    user_access_type.SUPER_ADMIN,
                ]}
            >
                <VoteDetailPage />
            </ProtectedRoute>
        ),
        exact: true,
    },
    {
        path: '/donate',
        name: 'Donate',
        component: () => (
            <ProtectedRoute
                requiredRole={[
                    user_access_type.LICENSED,
                    user_access_type.ADMIN,
                    user_access_type.EMPLOYEE,
                    user_access_type.SUPER_ADMIN,
                ]}
            >
                <DonationPage />
            </ProtectedRoute>
        ),
        exact: true,
        keywords: { donate: 5, charity: 4, contribution: 3 },
    },
    {
        path: '/licenses',
        name: 'License',
        component: LicensePage,
        exact: true,
        keywords: { license: 5, agreement: 4, permission: 3 },
    },
    {
        path: '/payment-redirect',
        name: 'Stripe Redirect',
        component: PaymentRedirectPage,
        exact: true,
        keywords: { payment: 5, redirect: 4, stripe: 3 },
    },
    {
        path: '/not-authorized',
        name: 'Not Authorized',
        component: NotAuthorizedPage,
        exact: true,
        keywords: { unauthorized: 5, forbidden: 4, noAccess: 3 },
    },
    {
        path: '*',
        name: 'Not Found',
        component: NotFound,
        exact: true,
        keywords: { notFound: 5, error: 4, missing: 3 },
    },
];

export default routes;