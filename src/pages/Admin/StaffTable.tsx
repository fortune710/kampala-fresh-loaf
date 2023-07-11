import { 
    TableContainer, 
    Table, 
    TableCaption, 
    Thead, Tr, 
    Th, Tbody, 
    Td, Tfoot, 
    Flex, Button, 
    Spacer, 
    SkeletonText, 
    Skeleton, 
    useToast,
    useDisclosure,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Select} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { BiReset } from "react-icons/bi";
import { useStaff } from "../../hooks/useStaff";
import { createUserWithEmailAndPassword, deleteUser, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, firestore } from "../../environments/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FirebaseCollections } from "../../types";

interface FormFields {
    name: string;
    email: string;
    password: string;
    role: 'production-manager'|'sales-manager'|'user'
}



const StaffTable: React.FC = () => {
    const navigate = useNavigate();
    const { isLoading, staff } = useStaff();
    const queryClient = useQueryClient();
    const toast = useToast();

    const [form, setForm] = useState<FormFields>({
        email: '',
        password: '',
        name: '',
        role: 'user'
    });


    const {
        isOpen,
        onOpen,
        onClose
    } = useDisclosure();

    const addNewUser = async ({ email, password, name, role }: FormFields) => {

        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            const ref = doc(firestore, 'users', user.uid);
            
            await Promise.all([
                await setDoc(ref, {
                    name,
                    email,
                    id: user.uid,
                    last_login: null,
                    password: password,
                    role,
                    last_logout: null,
                }),
                await updateProfile(user, { displayName: name })
            ])
            queryClient.invalidateQueries([FirebaseCollections.Staff]);
            toast({
                title: "User created",
                position: "top-right",
                status: "success",
                isClosable: true
            })
            onClose()
            
        } catch (error:any) {
            //console.log(error);

            toast({
                title: error.code,
                position: "top-right",
                status: "error",
                isClosable: true
            })

        }
    }


    const deleteAccount = async (email: string, password: string) => {
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            const ref = doc(firestore, 'users', user.uid)
            await deleteUser(user!)
            await updateDoc(ref, { deleted: true });
            queryClient.invalidateQueries([FirebaseCollections.Staff]);
            toast({
                title: "Account Deleted",
                position: "top-right",
                status: "success",
                isClosable: true
            })

            onClose();
        } catch (err:any) {
            toast({
                title: err.code,
                position: "top-right",
                status: "error",
                isClosable: true
            })
        }
    
    }

    const resetPassword = async (email:string) => {
        try {
            await sendPasswordResetEmail(auth, email)
            toast({
                title: "Password Reset Link Sent",
                position: "top-right",
                status: "success",
                isClosable: true
            })
    
        } catch (err:any) {
            toast({
                title: err.code,
                position: "top-right",
                status: "error",
                isClosable: true
            })
        }
    }

    return(
        <section className="staff-table">
            <TableContainer>
                <Table colorScheme='teal'>
                    <Thead>
                        <Tr>
                            <Th colSpan={3}>All Users</Th>
                            <Th>
                                <Button onClick={onOpen}>
                                    Add User
                                </Button>
                            </Th>
                        </Tr>
                        <Tr>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th></Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            isLoading ? (
                                <Tr>
                                    <Td>
                                        <Skeleton/>
                                    </Td>
                                    <Td>
                                        <Skeleton/>
                                    </Td>
                                    <Td>
                                        <Skeleton/>
                                    </Td>
                                    <Td>
                                        <Skeleton/>
                                    </Td>
                                </Tr>
                            ) :
                            staff?.map((data) => (
                                <Tr key={data.id}>
                                    <Td>{data.name}</Td>
                                    <Td>{data.email}</Td>
                                    <Td>
                                        <Button 
                                            onClick={() => resetPassword(data.email)} 
                                            leftIcon={<BiReset/>} 
                                            variant="ghost"
                                        >
                                            Reset Password
                                        </Button>
                                    </Td>
                                    <Td>
                                        <Button 
                                            leftIcon={<MdDelete/>} 
                                            colorScheme="red" 
                                            variant="ghost"
                                            onClick={() => deleteAccount(data.email, data.password)}
                                        >
                                            Delete Account
                                        </Button>
                                    </Td>
                                </Tr>
                            ))
                        }
                    </Tbody>
                </Table>
            </TableContainer>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New User</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={4}>
                            <FormControl id="full_name">
                                <FormLabel>Full Name</FormLabel>
                                <Input 
                                    required 
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    type="text" 
                                />
                            </FormControl>

                            <FormControl id="email">
                                <FormLabel>Email address</FormLabel>
                                <Input 
                                    required
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    type="email"
                                />
                            </FormControl>

                            <FormControl id="password">
                                <FormLabel>Password</FormLabel>
                                <Input 
                                    type="password" 
                                    required
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </FormControl>

                            <FormControl id="role">
                                <FormLabel>Role</FormLabel>
                                <Select 
                                    required
                                    onChange={(e) => setForm({ ...form, role: e.target.value as "production-manager"|"sales-manager" })}
                                >
                                    <option value=""></option>
                                    <option value="production-manager">Production Manager</option>
                                    <option value="sales-manager">Sales Manager</option>
                                </Select>
                            </FormControl>

                        </Stack>
                    </ModalBody>

                    <ModalFooter width="100%">
                        <Button
                            bg={'blue.400'}
                            color={'white'}
                            _hover={{
                                bg: 'blue.500',
                            }}
                            width="100%"
                            onClick={() => addNewUser(form)}
                        >
                            Add User
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </section>
    )
}

export default StaffTable;