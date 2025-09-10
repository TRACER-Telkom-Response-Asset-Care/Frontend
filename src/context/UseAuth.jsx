import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Impor context dari file aslinya

// Hook ini sekarang berada di filenya sendiri
const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default useAuth;
