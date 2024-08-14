import { FaEye, FaPaw, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';
import { CustomError } from '../commons/Error';
import { useToast } from '../context/ToastManager';
import { ToastType } from '../enum/toast';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import BuyLicenseCard from '../components/LicenseBuy';

export default function LicensePage() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { setUser, fetchUserData } = useUser();
    return (
        <BuyLicenseCard/>
    )
}
