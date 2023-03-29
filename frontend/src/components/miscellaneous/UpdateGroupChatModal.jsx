import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Button,
  useToast,
  Box,
  FormControl,
  Input,
  Spinner,
} from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons';
import { ChatState } from '../../Context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';

const UpdateGroupChatModal = ({fetchAgain, setFetchAgain , fetchMessages}) => {
    const { selectedChat, setSelectedChat, user } = ChatState();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState(selectedChat.chatName);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameLoading] = useState(false);
    const toast = useToast();

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            toast({
                title: "Only admins can remove someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/groupremove`,
                {
                chatId: selectedChat._id,
                userId: user1._id,
                },
                config
            );

            user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
        setGroupChatName("");
    }

    // here took user1 to differentiate it from logged in user
    const handleAddUser = async(user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: "User Already in group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/groupadd`,
                {
                chatId: selectedChat._id,
                userId: user1._id,
                },
                config
            );

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
        setGroupChatName("");
    }

    const handleRename = async () => {
            if (!groupChatName) return;

            try {
                setRenameLoading(true);

                const config = {
                    headers: {
                    Authorization: `Bearer ${user.token}`,
                    },
                };

                const { data } = await axios.put(
                    `/api/chat/rename`,
                    {
                    chatId: selectedChat._id,
                    chatName: groupChatName,
                    },
                    config
                );

                    console.log(data._id);
                    // setSelectedChat("");
                    setSelectedChat(data);
                    setRenameLoading(false);
                    setFetchAgain(!fetchAgain);
                    

            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
                setRenameLoading(false);
            }
            setGroupChatName("");
    };

    const handleSearch = async(query) => {
        setSearch(query);
        if(!query){
            return;
        }
        try{
            setLoading(true);
            const config = {
                headers: {
                Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            // console.log(data);
            setLoading(false);
            setSearchResult(data);
        }catch(error){
            toast({
                title:"Error Occured",
                description:"Failed to load the search results",
                status: "error",
                duration:5000,
                isClosable:true,
                position:"bottom-left",
            });
        }
    }

    

    return (
        <>
        <IconButton 
         display={{base:"flex"}}s
         icon={<ViewIcon/>}
         onClick={onOpen} />

        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
            <ModalHeader
                fontSize="35px"
                fontFamily="Work sans"
                display="flex"
                justifyContent="center"
            >
                {selectedChat.chatName}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Box w="100%" display={"flex"} flexWrap="wrap" pb={3}>
                    {selectedChat.users.map((user)=>(
                        <UserBadgeItem key={user._id} user={user}
                        handleFunction={()=> handleRemove(user)}/>
                    ))}
                </Box>
                <FormControl display={"flex"}>
                    <Input
                        placeholder='Chat Name'
                        mb={3}
                        value={groupChatName}
                        onChange={(e)=> setGroupChatName(e.target.value)}
                    />
                    <Button
                        variant={"solid"}
                        colorScheme="teal"
                        ml={1}
                        isLoading={renameloading}
                        onClick={handleRename}>
                        Update
                    </Button>
                </FormControl>
                <FormControl>
                    <Input
                        placeholder='Add user to group'
                        mb={1}
                        onChange={(e)=> handleSearch(e.target.value)}
                    />
                </FormControl>
                {loading ? (
                <Spinner size="lg"/>
                ): (
                    searchResult?.slice(0,4).map(user => (
                        <UserListItem 
                            key={user._id} 
                            user={user} 
                            handleFunction={()=> handleAddUser(user)} />
                    ))
                )}
            </ModalBody>

            <ModalFooter>
                <Button colorScheme='red' onClick={()=> handleRemove(user)}>
                Leave Group
                </Button>
            </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}

export default UpdateGroupChatModal