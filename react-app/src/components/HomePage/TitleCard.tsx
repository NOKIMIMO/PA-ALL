import { FaPaw} from 'react-icons/fa';

export default function TitleCard() {
    return (
        <div 
        className='hero min-h-screen flex flex-col justify-center items-center text-center'
        style={{backgroundImage: 'url(https://art.pixilart.com/994947da85a835f.png)'}}>
            <div className='relative z-10'>
                <h1 className='text-6xl text-white font-bold drop-shadow-md flex items-center'>
                    Pattes et partage <FaPaw className="ml-2 inline-block"/>
                </h1>            
            </div>
            <div className='absolute inset-0 bg-black opacity-50'></div>
        </div>
        
    )
}