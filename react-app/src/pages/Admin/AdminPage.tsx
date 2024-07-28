import PostTable from '../../components/AdminPage/PostTable';
import UserTable from '../../components/AdminPage/UsersTable';
import EventTable from '../../components/AdminPage/EventTable';
import MessageListPage from '../MessageListPage';
import VoteTable from '../../components/AdminPage/VoteTable';

export default function AdminPage() {
    return (
        <div className='flex-grow pt-16'>
            <UserTable/>
            <PostTable/>
            <EventTable/>
            <MessageListPage/>
            <VoteTable/>
        </div>
    );
}