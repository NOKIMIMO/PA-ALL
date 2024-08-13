import { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import AuthService from '../services/AuthService';
import { CustomError } from '../commons/Error';

interface ContactFormProps {
    short: boolean;
}

export default function ContactForm({ short }: ContactFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await AuthService.sendMessage(formData.name, formData.email, formData.message);
            if (result instanceof CustomError) {
                setError(result.message);
            } else {
                setSuccess('Votre message a été envoyé avec succès.');
                setFormData({ name: '', email: '', message: '' });
            }
        } catch (err) {
            setError('Une erreur s\'est produite lors de l\'envoi de votre message. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        (document.getElementById('my_modal') as HTMLDialogElement)!.close();
    };

    return (
        <div className='text-neutral'>
            <button className={`btn ${short ? 'btn-ghost btn-circle text-base-100' : 'btn-primary'}`} onClick={() => (document.getElementById('my_modal') as HTMLDialogElement)!.showModal()}>
                {short ? <FaEnvelope className="h-5 w-5 mr-2" /> : 'Nous Contacter'}
            </button>
            <dialog id="my_modal" className="modal" onClick={handleCloseModal}>
                <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                    <h3 className="font-bold text-lg">Contactez-nous</h3>
                    <p className="py-4">Remplissez le formulaire ci-dessous pour nous envoyer un message.</p>
                    <form onSubmit={handleSubmit} className="modal-backdrop text-neutral">
                        {error && <div className="text-red-500 mb-4">{error}</div>}
                        {success && <div className="text-green-500 mb-4">{success}</div>}
                        <div className="flex flex-col mb-4">
                            <label htmlFor="name" className="label-text mb-2">Name :</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                className='input input-bordered w-full max-w-xs' 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div className="flex flex-col mb-4">
                            <label htmlFor="email" className="label-text mb-2">Email :</label>
                            <input 
                                type="email" 
                                id="emailContactForm" 
                                name="email" 
                                className='input input-bordered w-full max-w-xs' 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div className="flex flex-col mb-4">
                            <label htmlFor="message" className="label-text mb-2">Message :</label>
                            <textarea 
                                className="textarea textarea-bordered h-24" 
                                id="message" 
                                name="message" 
                                value={formData.message} 
                                onChange={handleChange} 
                                rows={4} 
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Envoi...' : 'Envoyer'}
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    );
}
