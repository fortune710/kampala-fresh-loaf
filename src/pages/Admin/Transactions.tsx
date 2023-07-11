import { 
    TableContainer, 
    Table, Thead, 
    Tr, Th, Tbody, 
    Td, 
    Spinner,
    Text, Tfoot, 
    Skeleton, 
    TableCaption, HStack, Button, Input, useDisclosure, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, VStack, Flex, FormControl, FormLabel, Select } from "@chakra-ui/react"
import { Timestamp } from "firebase/firestore";
import { useState } from "react";
import Loading from "../../components/Loading";
import { useBookingRefernce } from "../../hooks/useBookingReference";
import { useInvoice } from "../../hooks/useInvoice";
import { usePayment } from "../../hooks/usePayment";
import { useTransaction } from "../../hooks/useTransaction"
import { SalesStatus } from "../../types";

const PaymentsPage: React.FC = () => {
    const { 
        invoiceQuery: { data: invoices, isLoading, error } 
    } = useInvoice();
    const { onOpen, isOpen, onClose } = useDisclosure();
    const [paymentReferenceQuery, setPaymentRefrence] = useState<string>("")

    const { 
        transaction: payment, 
        isLoading: paymentLoading, 
        mutate: getPayment 
    } = usePayment(paymentReferenceQuery);



    const getPaymentRecord = (e:any) => {
        e.preventDefault()
        getPayment();
        onOpen();
    }

    const [newStatus, setStatus] = useState<SalesStatus>("unpaid")



    return (
        <>
            <HStack onSubmit={getPaymentRecord} as={"form"} gap="20px" marginY="1rem">
                <Input
                    onChange={(e) => setPaymentRefrence(e.target.value)}
                    type="search"
                    placeholder="Enter payment reference"
                    minWidth="40%"
                    maxWidth="50%"
                />
                <Button 
                    color="white"
                    bgColor="blue.500" 
                    type="submit"
                >
                    Search
                </Button>
            </HStack>

            <section className="staff-table">
                <TableContainer maxHeight="400px" overflowY="auto">
                    <Table variant='striped' colorScheme='teal'>
                        { error ? <TableCaption>Error While Loading Data</TableCaption> : null}
                        <Thead>
                            <Tr>
                                <Th>S/N</Th>
                                <Th>Payment ID</Th>
                                <Th isNumeric>Amount</Th>
                                <Th>Date</Th>
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
                                invoices?.map(({ id, revenue_made, timestamp, payment_reference }, index) => {
                                    return (
                                        <Tr key={index}>
                                            <Td>{index}</Td>
                                            <Td>{payment_reference}</Td>
                                            <Td isNumeric>{revenue_made}</Td>
                                            <Td>{new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate().toDateString()}</Td>
                                        </Tr>     
                                    )
                                })
                            }
                        </Tbody>
                        <Tfoot>
                            <Tr>
                                <Th>S/N</Th>
                                <Th>Payment ID</Th>
                                <Th isNumeric>Amount</Th>
                                <Th>Date</Th>
                            </Tr>
                        </Tfoot>
                    </Table>
                </TableContainer>
            </section>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Invoice</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody justifyContent={"center"}>
                        {
                            paymentLoading ? 
                            <Flex height="100%" align="center" justify="center">
                                <Spinner
                                    thickness='4px'
                                    speed='0.65s'
                                    emptyColor='gray.200'
                                    color='blue.500'
                                    size='xl'
                                />
                            </Flex>
                            :
                            <VStack>
                                <Heading>{payment?.payment_reference}</Heading>
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

                                </section>


                            <Text>
                                Amount to be Paid: &#8358; {payment?.revenue_made}
                            </Text>

                            </VStack>          
                        }

                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            onClick={onClose} 
                            variant='ghost'
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </>
    )
}

export default PaymentsPage;