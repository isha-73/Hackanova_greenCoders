import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Configuration, OpenAIApi } from 'openai';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Button,
    Input,
    Textarea,
    Box,
    Code,
    Text,
    useToast,
    useDisclosure
} from '@chakra-ui/react';
import { mutate } from 'swr';

import { createProject, updateProject } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import fetcher from '@/utils/fetcher';

const AddProjectModal = ({ children }) => {
    const initialRef = useRef();
    const toast = useToast();
    const auth = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { handleSubmit, register } = useForm();
    // const configuration = new Configuration({
    //     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    // });
    // const openai = new OpenAIApi(configuration);

    // openai.createCompletion({
    //     model: 'text-davinci-003',
    //     prompt: `AI/ML, Blockchain, Web Development, App Development. From the description, what is the domain of this project?`,
    //     maxTokens: 5,
    //     temperature: 0.9,
    //     topP: 1,
    //     presencePenalty: 0,
    //     frequencyPenalty: 0,
    // }).then((data) => {

    // }).catch((error) => {
    //     console.error(error);
    // })

    async function onCreateProject({ name, desc, github }) {

        // get username/reponame from github url
        const repo = github.split('github.com/')[ 1 ]
        const res = await fetch(`https://api.github.com/repos/${repo}/languages`)
        const data = await res.json()

        // calculate the total number of lines of code
        let total = 0
        for (let key in data) {
            total += data[ key ]
        }

        // calculate the percentage of each language
        const languages = {}
        Object.keys(data).forEach((key) => {
            languages[ key ] = ((data[ key ] / total) * 100).toFixed(2)
        })

        const newProject = {
            authorId: auth.user.uid,
            createdAt: new Date().toISOString(),
            name,
            desc,
            github,
            languages_used: languages,
            language_lines: data,
        };

        const { id } = await createProject(newProject);
        getOpenAidata(newProject, desc, id)
    }

    async function getOpenAidata(newProject, desc, id) {
        const configuration = new Configuration({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        openai.createCompletion({
            model: "text-davinci-003",
            prompt: `AI/ML, Blockchain, Web Development, App Development. From these given options choose what suits best for the below description. ${desc}`,
            temperature: 0.7,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }).then((data) => {
            console.log(data.data.choices[ 0 ].text + "Hello")
            const domain = data.data.choices[ 0 ].text
            updateProject(id, { domain })
            mutate(
                '/api/projects',
                async (data) => ({
                    projects: [ { id, ...newProject, domain: domain }, ...data.projects ],
                }),
                false
            );
            onClose();
            toast({
                title: 'Success!',
                description: "We've added your project.",
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        })
    }

    // const onCreateProject = ({ name, desc, github }) => {

    //     // Get the languages used in the project from GitHub
    //     // get username/reponame from github url
    //     const repo = github.split('github.com/')[ 1 ]
    //     fetch(`https://api.github.com/repos/${repo}/languages`)
    //         .then(res => res.json())
    //         .then(async (data) => {
    //             setGithubData(data)
    //             // calculate the total number of lines of code
    //             let total = 0
    //             for (let key in data) {
    //                 total += data[ key ]
    //             }
    //             // calculate the percentage of each language
    //             let languages = {}
    //             Object.keys(data).forEach(key => {
    //                 languages[ key ] = (data[ key ] / total * 100).toFixed(2)
    //             })
    //             setLanguages(languages)

    //             // pass the description to OpenAI and get the domain
    //             await setOpenaiData(openai.createCompletion({
    //                 model: "text-davinci-003",
    //                 prompt: `AI/ML, Blockchain, Web Development, App Development. From these given options choose what suits best for the below description. ${desc}`,
    //                 temperature: 0.7,
    //                 max_tokens: 5,
    //                 top_p: 1,
    //                 frequency_penalty: 0,
    //                 presence_penalty: 0,
    //             }))
    //         })


    //     const newProject = {
    //         authorId: auth.user.uid,
    //         createdAt: new Date().toISOString(),
    //         name,
    //         desc,
    //         github,
    //         language_lines: githubData,
    //         languages_used: languages,
    //         domain: openaiData
    //     };

    //     createProject(newProject);
    //     toast({
    //         title: 'Success!',
    //         description: "We've added your project.",
    //         status: 'success',
    //         duration: 5000,
    //         isClosable: true
    //     });
    //     mutate(
    //         '/api/projects',
    //         async (data) => ({
    //             projects: [ newProject, ...data.projects ]
    //         }),
    //         false
    //     );
    //     onClose();
    // };



    return <>
        <Button
            onClick={onOpen}
            backgroundColor="gray.900"
            color="white"
            fontWeight="medium"
            _hover={{ bg: 'gray.700' }}
            _active={{
                bg: 'gray.800',
                transform: 'scale(0.95)'
            }}
        >
            {children}
        </Button>
        {/* {githubData &&
            <Box>
                <Text>GitHub Data</Text>
                <Code>{JSON.stringify(githubData)}</Code><br />
                <Code>{JSON.stringify(languages)}</Code><br />
                <Code>{openaiData}</Code>
            </Box>
        } */}
        <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent as="form" onSubmit={handleSubmit(onCreateProject)}>
                <ModalHeader fontWeight="bold">Add Project</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <FormControl>
                        <FormLabel>Project Name</FormLabel>
                        <Input
                            ref={initialRef}
                            placeholder="Project Name"
                            {...register('name', { required: true })}
                        />
                    </FormControl>

                    <FormControl mt={4}>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                            ref={initialRef}
                            placeholder="Explain what your project does in a few sentences"
                            {...register('desc', { required: true })}
                        />
                    </FormControl>

                    <FormControl mt={4}>
                        <FormLabel>GitHub Link</FormLabel>
                        <Input
                            placeholder="https://github.com/username/repo"
                            {...register('github', { required: true })}
                        />
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button onClick={onClose} mr={3} fontWeight="medium">
                        Cancel
                    </Button>
                    <Button
                        backgroundColor="#99FFFE"
                        color="#194D4C"
                        fontWeight="medium"
                        type="submit"
                    >
                        Submit
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
};

export default AddProjectModal;