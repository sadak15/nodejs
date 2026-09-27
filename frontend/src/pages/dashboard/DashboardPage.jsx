import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import DashboardWelcome from '../../components/dashboard/DashboardWelcome'
import TaskForm from '../../components/task/TaskForm'
import TaskList from '../../components/task/TaskList'
import api from '../../lib/api/apiClient'
import { getActionableErrorMessage } from '../../util/errorUtils'

const DashboardPage = () => {

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingTask, setEditingTask] = useState(null)

    const queryClient = useQueryClient()


    const handleFormClose = () => {
        setShowCreateForm(false)
        setEditingTask(null)
    }

    const handleCreateTaskClick = () => {
        setShowCreateForm(true)
    }


    const tasksQuery = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await api.get('/tasks');
            return response.data;
        },
        retry: 1,
    })



    const handleEditTask = (task) => {
        setEditingTask(task)
        setShowCreateForm(true)
    }


    const statusMutation = useMutation({
        mutationFn: async ({ taskId, statusData }) => {
            const response = await api.put(`/tasks/${taskId}`, statusData);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Task status updated');
        },
        onError: (error) => {
            const message = getActionableErrorMessage(error);
            if (message) {
                toast.error(`Error updating task status: ${message}`);
            } else {
                toast.warning('Connection dropped before we heard back', { description: 'Checking your task list for the latest state…' });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    })

    const handleStatusChange = (taskId, statusData) => {
        statusMutation.mutate({ taskId, statusData })
    }

    if (tasksQuery.isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader className='animate-spin' />
            </div>
        )
    }

    if (tasksQuery.isError) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <p className='text-red-500'>Error loading tasks: {tasksQuery.error.message}</p>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-background'>

            {/* header */}

            <DashboardHeader />

            {/* Main content */}
            <main className='max-w-7xl mx-auto  px-4 py-8 space-y-6'>

                {/* Welcome Section */}
                <DashboardWelcome
                    showCreateForm={showCreateForm}
                    onCreateTask={handleCreateTaskClick}
                />
                {/* Tasks Section */}
                <div>
                    <TaskList
                        tasks={tasksQuery.data || []}
                        isLoading={tasksQuery.isLoading}
                        onEdit={handleEditTask}
                        onStatusChange={handleStatusChange}
                    />
                </div>
            </main>

            {/* Task Dialog Form */}

            <TaskForm
                task={editingTask}
                open={showCreateForm || !!editingTask}
                onOpenChange={handleFormClose}
            />

        </div>
    )
}

export default DashboardPage
