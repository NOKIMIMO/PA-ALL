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
    // {
    //     path: '/preview/:fileId',
    //     name: 'fileName',
    //     component: FilePreviewPage,
    //     exact: true
    // },
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
        path:'/vault',
        name: 'Vault Page',
        component: VaultPage,
        exact: true
    },
    {
        path: '*',
        name: 'Not Found',
        component: NotFound,
        exact: true
    },
    {
        path: '/eventList',
        name: 'Event List',
        component: EventListPage,
        exact: true
    },
    {
        path: '/event/eventPage/:eventId',
        name: 'Event Page',
        component: EventPage,
        exact: true
    },
    {
        path: '/postList',
        name: 'Post List',
        component: PostListPage,
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
        component: VoteListPage,
        exact: true
    },
    {
        path: '/votes/:voteId',
        name: 'Vote Page',
        component: VoteDetailPage,
        exact: true
    },
    {
        path: '/donate',
        name: 'Donate',
        component: DonationPage,
        exact: true
    }
]

export default routes;