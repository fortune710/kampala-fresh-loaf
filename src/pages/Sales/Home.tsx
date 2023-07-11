import {
    Button,
    FormControl,
    Flex,
    Heading,
    Input,
    Stack,
    Text,
    useColorModeValue,
    Grid,
    GridItem,
    Table,
    TableCaption,
    TableContainer,
    Tbody,
    Td,
    Tfoot,
    Th,
    Thead,
    Tr,
    Spacer,
    HStack,
    Skeleton,
    useDisclosure,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    VStack,
    useToast,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    NumberInput,
    NumberInputField,
    FormLabel,
    Select
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'firebase/auth';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import { useState, useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../../environments/firebase';
import { generate12CharId } from '../../helpers/generateId';
import { useInvoice } from '../../hooks/useInvoice';
import { usePayment } from '../../hooks/usePayment';
import { useProducts } from '../../hooks/useProducts';
import { useStaff } from '../../hooks/useStaffTransaction';
import { FirebaseCollections, Sales, SalesStatus } from '../../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';




export default function UserHome(): JSX.Element {
    const [paymentId, setPaymentId] = useState<string>("");
    const navigate = useNavigate();
    const  { transaction: data, isLoading } = useStaff(auth.currentUser?.uid!);
    const { 
        transaction: payment, 
        isLoading: paymentLoading, 
        updateStatus, 
        mutate: getPayment 
    } = usePayment(paymentId);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const cancelAlertRef = useRef(null);
    const queryClient = useQueryClient();

    const { 
        isOpen:signOutAlertIsOpen, 
        onOpen: SignOutAlertOnOpen, 
        onClose: signOutAlertOnClose 
    } = useDisclosure();

    const { 
        isOpen:newInvoiceIsOpen, 
        onOpen: newInvoiceOnOpen, 
        onClose: newInvoiceOnClose 
    } = useDisclosure();

    const { products } = useProducts();
    const invoiceRef = useRef<HTMLDivElement>(null);

    const generateInvoice = async () => {
        const element = invoiceRef?.current;
        const canvas = await html2canvas(element!);
        const data = canvas.toDataURL('image/png');
    
        const pdf = new jsPDF('portrait', 'pt', 'a4');
        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight =
          (imgProperties.height * pdfWidth) / imgProperties.width;
    
        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        const file = pdf.save(`Payment-${paymentId}.pdf`);
        file.save(`Payment-${paymentId}.pdf`)
  
    }


    const signOutUser = async () => {
        try {
            await signOut(auth);
            toast({
                title: "Sign Out Sucessful",
                position: "top-right",
                status: "success",
                isClosable: true
            })
            navigate('/login');
            signOutAlertOnClose();
        } catch (err) {
            toast({
                title: "Sign Out Failed",
                position: "top-right",
                status: "error",
                isClosable: true
            })
        }

    }

    const getPaymentRecord = (paymentReference: string) => {
        setPaymentId(paymentReference);
        getPayment();
        onOpen();
    }

    const [newInvoice, setNewInvoice] = useState<any>({
        jumbo: 0,
        medium: 0,
        round_coconut: 0,
        round_plain: 0,
        burger_coconut: 0,
    })

    const [newInvoiceStatus, setStatus] = useState<SalesStatus>("unpaid");
    const [invoiceRecipient, setRecipient] = useState("");

    const {
        invoiceQuery: { isLoading: invoicesLoading, data: invoices },
        addInvoiceMutation: { isLoading: addLoading, mutate: addInvoice }
    } = useInvoice();

    const handleAddInvoice = () => {

        try {
            const paymentReference = generate12CharId(6);
            const data = products?.map((product) => {
                const name = product.name.toLowerCase().replaceAll("-","_").replaceAll(" ", "_");
                return ({ ...product, quantity_sold: newInvoice[`${name}`] })
            });
            const revenueMade = data?.reduce((acc, product) => {
                return acc + (product.quantity_sold * product.price)
            }, 0)
            
            
            const newSales: Omit<Sales, "id"> = {
                payment_reference: paymentReference,
                data: data!,
                revenue_made: revenueMade! ?? 0,
                timestamp: Timestamp.now(),
                status: newInvoiceStatus,
                recipient: invoiceRecipient
            }
            addInvoice(newSales);
            
            toast({
                title: "Added new Invoice!",
                position: "top-right",
                status: "success",
                isClosable: true
            })
            queryClient.invalidateQueries([FirebaseCollections.Invoices]);
            generateInvoice();
            newInvoiceOnClose();

        } catch {
            toast({
                title: "Could not add invoice",
                position: "top-right",
                status: "error",
                isClosable: true
            })

        }

    }

    const handleUpdateInvoice = () => {
        try {
            updateStatus(newInvoiceStatus);
            toast({
                title: "Updated Status!",
                position: "top-right",
                status: "success",
                isClosable: true
            })
            onClose();

        } catch (e){

            toast({
                title: "Could not update status",
                position: "top-right",
                status: "error",
                isClosable: true
            })

        }
    }


    


    
    return (
    <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        direction="column"
        position={"relative"}
        padding={2}
        gap={30}
        bg={useColorModeValue('gray.50', 'gray.800')}>
        
        <Button
            position={"absolute"}
            top={10}
            right={50}
            colorScheme="red"
            onClick={SignOutAlertOnOpen}
        >
            Sign Out
        </Button>
        <Button onClick={newInvoiceOnOpen}>
            New Sales
        </Button>

        <HStack>
            <Input
                onChange={(e) => setPaymentId(e.target.value)}
                type="search"
                placeholder="Enter 6 character code eg.D001X5"
            />
            <Button onClick={() => getPaymentRecord(paymentId)}>
                Search
            </Button>
        </HStack>

        
        <Modal isOpen={newInvoiceIsOpen} onClose={newInvoiceOnClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>New Invoice Record</ModalHeader>
                <ModalCloseButton />
                <ModalBody ref={invoiceRef}>
                    <Stack spacing={4}>
                        {
                            products?.map((product) => (
                            <HStack key={product.id} alignItems="center" justifyContent="space-between">
                                <Text>{product.name.replaceAll("-", " ")}</Text>
                                <NumberInput width="30%" height={10}>
                                    <NumberInputField onChange={(e) => setNewInvoice((prevState:any) => ({ ...prevState, [product.name.replaceAll(" ","_").toLowerCase()]: Number(e.target.value) }))} /> 
                                </NumberInput>
                            </HStack>
                            ))
                        }

                        <FormControl>
                            <FormLabel>Status</FormLabel>
                            <Select onChange={(e) => setStatus(e.target.value as SalesStatus)}>
                                <option value=""></option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Not Paid</option>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Order Recipient</FormLabel>
                            <Input
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder="Who is placing the order?"
                            />
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
                        disabled={addLoading}
                        onClick={handleAddInvoice}
                    >
                        Add Invoice
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        
        {
            isLoading ? <Skeleton height={10} borderRadius={4} maxWidth="80%" minWidth="60%"/>
            : 
            <section className="staff-table">
                <TableContainer overflowY={"auto"} maxHeight="300px">
                    <Table variant='striped' colorScheme='teal'>
                        {!isLoading && invoices?.length === 0 && <TableCaption>Add a new record</TableCaption>}
                        <Thead zIndex={10} top={0} position={"sticky"}>
                            <Tr>
                                <Th>S/N</Th>
                                <Th>Payment ID</Th>
                                <Th>Recipient</Th>
                                <Th isNumeric>Amount</Th>
                                <Th>Status</Th>
                                <Th>Date</Th>
                            </Tr>
                        </Thead>
                        <Tbody zIndex={-1}>
                            {
                                invoices?.map(({ id, revenue_made, timestamp, payment_reference, recipient, status }, index) => {
                                    const datetime = new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
                                    const date = datetime.toDateString();
                                    const time = datetime.toTimeString();

                                    return (
                                    <Tr key={id}>
                                        <Td>{index}</Td>
                                        <Td>{payment_reference}</Td>
                                        <Td>{recipient ?? "N/A"}</Td>
                                        <Td isNumeric>{revenue_made}</Td>
                                        <Td>{status}</Td>
                                        <Td>{date}</Td>
                                    </Tr>
                                    )
                                })
                            }
                        </Tbody>
                        {
                            !isLoading && data.length > 6 ?
                            <Tfoot>
                                <Tr>
                                    <Th>S/N</Th>
                                    <Th>Payment ID</Th>
                                    <Th>Recipient</Th>
                                    <Th isNumeric>Amount</Th>
                                    <Th>Status</Th>
                                    <Th>Date</Th>
                                </Tr>
                            </Tfoot>
                            : null
                        }
                    </Table>
                </TableContainer>

            </section>
        }

        <AlertDialog
            isOpen={signOutAlertIsOpen}
            onClose={signOutAlertOnClose}
            leastDestructiveRef={cancelAlertRef}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader>Sign Out</AlertDialogHeader>
                    <AlertDialogBody>
                        Are you sure you want to sign out?
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelAlertRef} onClick={signOutAlertOnClose}>
                            Cancel
                        </Button>
                        <Button 
                            colorScheme="red" 
                            onClick={signOutUser} 
                            ml={3}
                        >
                            Sign Out
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>



        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Update Invoice</ModalHeader>
                <ModalCloseButton />
                <ModalBody justifyContent={"center"}>

                    <VStack>
                        <Heading>{paymentId}</Heading>
                        <section className="staff-table">
                            <TableContainer maxWidth="100%">
                                <Table variant='striped' colorScheme='teal'>
                                    <Thead position="sticky" top={0}>
                                        <Tr>
                                            <Th>Name</Th>
                                            <Th>Price</Th>
                                            <Th>Quanity</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {
                                            paymentLoading ? <p>Loading...</p> :
                                            payment?.data.map((item, index) => (
                                                <Tr key={index}>
                                                    <Td>{item.name}</Td>
                                                    <Td>{item.price}</Td>
                                                    <Td>{item.quantity_sold}</Td>
                                                </Tr>
                                            ))
                                        }
                                    </Tbody>
                                </Table>
                            </TableContainer>

                            <HStack alignItems="center" justifyContent="space-between" marginY={2}>
                                <Text>Status</Text>
                                <Text>{payment?.status}</Text>
                            </HStack>

                            <FormControl>
                                <FormLabel>New Status</FormLabel>
                                <Select onChange={(e) => setStatus(e.target.value as SalesStatus)}>
                                    <option value=""></option>
                                    <option value="paid">Paid</option>
                                </Select>
                            </FormControl>
                        </section>


                        <Text>
                            Amount to be Paid: &#8358; {payment?.revenue_made}
                        </Text>

                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button 
                        //Should generate invoice too
                        onClick={handleUpdateInvoice} 
                        colorScheme='blue' 
                        mr={3} 
                    >
                        Update Status
                    </Button>
                    <Button 
                        onClick={onClose} 
                        variant='ghost'
                    >
                        Close
                    </Button>
                </ModalFooter>
                </ModalContent>
        </Modal>


    </Flex>
    );
}