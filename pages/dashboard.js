import Head from 'next/head'
import useSWR from 'swr'
import { Box, Button, Code, Flex, Heading, Text } from '@chakra-ui/react'

import { useAuth } from '@/lib/auth'
import EmptyState from '@/components/EmptyState'
import DashboardShell from '@/components/DashboardShell'
import fetcher from '@/utils/fetcher'
import ProjectTable from '@/components/ProjectTable'

export default function Dashboard() {
    const auth = useAuth()
    const { data } = useSWR('/api/projects', fetcher)

    if (!auth.user) {
        return 'Loading...';
    }

    return <DashboardShell>
        {!data ? 'Loading...' : data?.projects ? <ProjectTable projects={data.projects} /> : <EmptyState />}
    </DashboardShell>
}