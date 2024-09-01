import { FaDog, FaCat, FaDove, FaDragon, FaStar, FaUsers, FaChalkboardTeacher, FaBusinessTime, FaRegCalendarAlt, FaQuestion} from 'react-icons/fa';


interface CardProps {
    title: string;
    content: string;
    category_animal: category_animal
    category_event: category_event
    subtext: string | null;
    pageLink: string;
    showActions?: boolean | null;
    onEdit?: () => void;
    onDelete?: () => void;
}

enum category_animal {
    ALL = 'ALL',
    CAT = 'CAT',
    DOG = 'DOG',
    BIRD = 'BIRD',
    HORSE = 'HORSE',
    REPTILE = 'REPTILE',
}

enum category_event {
    SHOW = 'SHOW',
    MEETING = 'MEETING',
    WORKSHOP = 'WORKSHOP',
    SEMINAR = 'SEMINAR',
    CONFERENCE = 'CONFERENCE',
}



const getCategoryAnimalIcon = (category: category_animal) => {
    switch (category) {
        case category_animal.ALL:
            return <FaStar />;
        case category_animal.DOG:
            return <FaDog />;
        case category_animal.CAT:
            return <FaCat />;
        case category_animal.BIRD:
            return <FaDove />;
        case category_animal.REPTILE:
            return <FaDragon />;
        default:
            return <FaQuestion />;
    }
};

const getCategoryEventIcon = (category: category_event) => {
    switch (category) {
        case category_event.SHOW:
            return <FaStar />;
        case category_event.MEETING:
            return <FaUsers />;
        case category_event.WORKSHOP:
            return <FaChalkboardTeacher  />;
        case category_event.SEMINAR:
            return <FaBusinessTime  />;
        case category_event.CONFERENCE:
            return <FaRegCalendarAlt />;
        default:
            return <FaQuestion />;
    }
};

export function Card({ title, content, category_animal, category_event, subtext, pageLink, showActions, onEdit, onDelete }: CardProps) {
    return (
        <div className="relative max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow">
            <a href="#">
                {getCategoryAnimalIcon(category_animal)}
                {getCategoryEventIcon(category_event)}
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{title}</h5>
            </a>
            <p className="mb-3 font-normal text-gray-700">{content}</p>
            <span className="text-gray-400">{subtext}</span>
            <br />
            <a href={pageLink} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                En Savoir Plus
                <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                </svg>
            </a>
            {showActions && (
                <div className="mt-3 flex space-x-2">
                    <button
                        onClick={onEdit}
                        className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
