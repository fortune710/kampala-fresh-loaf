import { Button, Flex, FormControl, FormLabel, Heading, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberInput, NumberInputField, Select, Skeleton, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr, useColorModeValue, useDisclosure } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, doc, getDocs, orderBy, query, increment, Timestamp, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { firestore } from "../../environments/firebase";
import { FirebaseCollections, Production } from "../../types";
import { useProducts } from "../../hooks/useProducts";

export default function ProductionsPage(): JSX.Element {
    
    const {
        isOpen,
        onOpen,
        onClose,
    } = useDisclosure();

    const { products } = useProducts();

    const [newProduction, setNewProduction] = useState<any>({
        jumbo: 0,
        medium: 0,
        round_coconut: 0,
        round_plain: 0,
        burger_coconut: 0,
        bags_used: 0
    })
    

    const navigate = useNavigate();
    const collectionRef = collection(firestore, FirebaseCollections.Productions);
    const queryRef = query(collectionRef, orderBy('timestamp', "desc"));
    const queryClient = useQueryClient();


    const { isLoading, data, error } = useQuery([FirebaseCollections.Productions], async () => {
        let productions = [] as Production[];
        const snapshot = await getDocs(queryRef);

        if(snapshot.empty) return productions;

        snapshot.forEach((document) => {
            productions = [...productions, { id: document.id, ...document.data() } as Production]
        })

        return productions;
    })

    const { mutate: addNewProduction, isLoading: newLoading } = useMutation(["add-production"], async () => {
        const { bags_used, ...rest } = newProduction;
        const data = Object.entries(rest).map(([key, value]) => ({
            key,
            value,
        }));

        await addDoc(collectionRef, {
            timestamp: Timestamp.now(),
            data: {
                ...rest
            },
            bags_used
        })
        console.log(newProduction)
    }, {
        
        onSuccess: async () => {
            const stockDocRef = doc(firestore, FirebaseCollections.Stock, "Stock")
            await updateDoc(stockDocRef, {
                bags_left: increment(-1 * newProduction.bags_used)
            })

            setNewProduction({
                jumbo: 0,
                medium: 0,
                round_coconut: 0,
                round_plain: 0,
                burger_coconut: 0,
                bags_used: 0        
            })
            queryClient.invalidateQueries([FirebaseCollections.Productions])
            onClose();
        }
    })

    return (
    <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        direction="column"
        position={"relative"}
        padding={2}
        gap={30}
        bg={useColorModeValue('gray.50', 'gray.800')}
    >

        <Button onClick={onOpen}>
            New Production
        </Button>

        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>New Production Record</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing={4}>
                        {
                            products?.map((product) => (
                            <HStack key={product.id} alignItems="center" justifyContent="space-between">
                                <Text>{product.name.replaceAll("-", " ")}</Text>
                                <NumberInput width="30%" height={10}>
                                    <NumberInputField onChange={(e) => setNewProduction((prevState:any) => ({ ...prevState, [product.name.replaceAll(" ","_").toLowerCase()]: Number(e.target.value) }))} /> 
                                </NumberInput>
                            </HStack>
                            ))
                        }

                        <HStack alignItems="center" justifyContent="space-between">
                            <Text color="red">Bags Used</Text>
                            <NumberInput width="30%" height={10}>
                                <NumberInputField onChange={(e) => setNewProduction((prevState:any) => ({ ...prevState, bags_used: Number(e.target.value) }))} /> 
                            </NumberInput>
                        </HStack>

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
                        disabled={newLoading}
                        onClick={() => addNewProduction()}
                    >
                        Add Production
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

        
        <section className="staff-table padding-5">
            <TableContainer overflowY={"auto"} maxHeight="300px">
                <Table variant='striped' colorScheme='teal'>
                    {!isLoading && data?.length === 0 && <TableCaption>Add a new record</TableCaption>}
                    <Thead zIndex={10} top={0} position={"sticky"}>
                        <Tr>
                            <Th isNumeric>S/N</Th>
                            <Th isNumeric>Jumbo</Th>
                            <Th isNumeric>Medium</Th>
                            <Th isNumeric>R.Coconut</Th>
                            <Th isNumeric>R.Plain</Th>
                            <Th isNumeric>Burger Coconut</Th>
                            <Th isNumeric>Bags Used</Th>
                            <Th>Time</Th>
                        </Tr>
                    </Thead>
                    <Tbody zIndex={-1}>
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
                            data?.map(({ id, data, bags_used, timestamp}, index) => {
                                
                                const datetime = new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
                                const date = datetime.toDateString();
                                const time = datetime.toTimeString();
                                
                                return (
                                <Tr key={id}>
                                    <Td>{index}</Td>
                                    <Td>{data['jumbo']}</Td>
                                    <Td>{data['medium']}</Td>
                                    <Td>{data['round_coconut']}</Td>
                                    <Td>{data['round_plain']}</Td>
                                    <Td>{data['burger_coconut']}</Td>
                                    <Td>{bags_used}</Td>
                                    <Td>{date}</Td>
                                </Tr>
                                )       
                            })
                        }
                    </Tbody>
                    {
                        !isLoading && data?.length! > 6 ?
                        <Tfoot>
                            <Tr>
                                <Th isNumeric>S/N</Th>
                                <Th isNumeric>Jumbo</Th>
                                <Th isNumeric>Medium</Th>
                                <Th isNumeric>R.Coconut</Th>
                                <Th isNumeric>R.Plain</Th>
                                <Th isNumeric>B.Coconut</Th>
                                <Th isNumeric>Bags Used</Th>
                                <Th>Time</Th>
                            </Tr>
                        </Tfoot>
                        : null
                    }
                </Table>
            </TableContainer>

        </section>


    </Flex>
    )
}