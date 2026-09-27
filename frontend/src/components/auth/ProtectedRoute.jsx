import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import React, { useEffect } from 'react'
import { Navigate } from 'react-router'
import api from '../../lib/api/apiClient'
import useAuthStore from '../../lib/store/authStore'

const ProtectedRoute = ({ children }) => {

    const { user, setAuth, clearAuth, token } = useAuthStore();
    const queryClient = useQueryClient();


    const { data, error, isLoading, isError, isSuccess } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const response = await api.get('/users/me');
            return response.data.user
        },
        retry: 1
    })

    // error case: session/login no longer valid, clear everything and bounce to /login

    useEffect(() => {

        if (error) {
            clearAuth();
            queryClient.clear();
        }

    }, [error, clearAuth, queryClient]);

    // success case
    useEffect(() => {
        if (isSuccess && data) {
            setAuth(data, token)
        }

    }, [isSuccess, data, setAuth, token])


    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader className='animate-spin' />
            </div>
        )
    }


    if (isError) {
        console.log("error here", error);
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!user) {
        console.log("user not found", user);
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

export default ProtectedRoute
