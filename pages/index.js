// 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

import { Box, Button, Code, Flex, Heading, Text, FormControl, FormLabel, Input, Textarea } from '@chakra-ui/react'
import Head from 'next/head'
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Configuration, OpenAIApi } from 'openai';

import { useAuth } from '@/lib/auth'

export default function Home() {
  const auth = useAuth()
  const initialRef = useRef();
  const [ githubData, setGithubData ] = useState([])
  const [ languages, setLanguages ] = useState([])
  const [ openaiData, setOpenaiData ] = useState()
  const { handleSubmit, register } = useForm();

  const processProject = (data) => {
    console.log(data);

    // Open AI
    const configuration = new Configuration({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    openai
      .createCompletion({
        model: "text-davinci-003",
        prompt: `AI/ML, Blockchain, Web Development, App Development. From these given options choose what suits best for the below description. ${data.name} - ${data.desc}`,
        max_tokens: 5,
        temperature: 0.8,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      })
      .then((response) => {
        console.log(response?.data?.choices?.[ 0 ]?.text);
        setOpenaiData(response?.data?.choices?.[ 0 ]?.text);
      });

    // Github

    // extract username/reponame from https://github.com/username/reponame
    const repo = data.url.split('/').slice(-2).join('/');
    fetch(`https://api.github.com/repos/${repo}/languages`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
      }
    }).then((response) => (response.json())).then((data) => setGithubData(data));
    const totalLines = Object.values(githubData).reduce((a, b) => a + b, 0);
    const languages = {}
    Object.keys(githubData).forEach((key) => {
      languages[ key ] = parseFloat(((githubData[ key ] / totalLines) * 100).toFixed(2));
    });
    console.log(languages);
    setLanguages(languages);
  }

  return (
    <Flex as="main" direction='column' align='center' justify='center' h='100vh' gap={4}>
      <Head>
        <title>Green IT</title>
      </Head>
      <Heading>
        Green IT
      </Heading>

      <Text>
        Current user: <Code>{auth.user ? auth.user.email : 'None'}</Code>
      </Text>
      {auth.user ? (
        <Button onClick={(e) => auth.signout()}>
          Sign Out
        </Button>
      ) : (
        <Button mt={4} size="sm" onClick={(e) => auth.signInWithGoogle()}>
          Sign In
        </Button>
      )}

      {auth.user && (
        <Box w='50%' as="form" onSubmit={handleSubmit(processProject)}>
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
              {...register('url', { required: true })}
            />
          </FormControl>

          <Button mt={4}
            backgroundColor="#99FFFE"
            color="#194D4C"
            fontWeight="medium"
            type="submit"
          >
            Analyse
          </Button>

          {githubData &&
            <Box>
              <Text>GitHub Data</Text>
              <Code>{JSON.stringify(githubData)}</Code><br />
              <Code>{JSON.stringify(languages)}</Code><br />
              <Code>{openaiData}</Code>
            </Box>
          }
        </Box>
      )}
    </Flex>
  )
}
