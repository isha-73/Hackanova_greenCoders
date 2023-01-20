import React from "react";
import { Table, Tr, Td, Th } from "@/components/Table";
import { Box, Code } from "@chakra-ui/react";
import { parseISO, format } from 'date-fns'

const ProjectTable = ({ projects }) => {
    return <Table>
        <thead>
            <Tr>
                <Th>Name</Th>
                <Th>Github Link</Th>
                <Th>Languages Used</Th>
                <Th>Domain</Th>
            </Tr>
        </thead>
        <tbody>
            {projects.map(project => (
                <Box as="tr" key={project.github}>
                    <Td fontWeight="medium">{project.name}</Td>
                    <Td>{project.github}</Td>
                    <Td>
                        <Code>{JSON.stringify(project.languages_used)}</Code>
                    </Td>
                    <Td>{project.domain}</Td>
                </Box>
            ))}
        </tbody>
    </Table>
}

export default ProjectTable;