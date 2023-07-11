import { 
    Button, 
    Flex, 
    HStack, 
    Modal, 
    ModalBody, 
    ModalCloseButton, 
    ModalContent, 
    ModalFooter, 
    ModalHeader, 
    ModalOverlay, 
    NumberInput, 
    NumberInputField, 
    Skeleton, 
    Stack, 
    Table, 
    TableContainer, 
    Tbody, 
    Td, 
    Tfoot, 
    Th, 
    Thead, 
    Tr, 
    useColorModeValue, 
    useDisclosure,
    Text, 
    FormControl,
    FormLabel,
    Input
} from "@chakra-ui/react"
import { useState } from "react";
import { useStock } from "../../hooks/useStock";

const Inventory: React.FC = () => {

    const {
        isOpen: addStockIsOpen, 
        onOpen: addStockOnOpen,
        onClose: addStockOnClose,
    } = useDisclosure();

    const {
        isOpen: updateStockIsOpen,
        onOpen: updateStockOnOpen,
        onClose: updateStockOnClose,
    } = useDisclosure();

    const {
        getStockQuery: { isLoading, data: stock },
        addStockMutation: { mutate: addStock, isLoading: addStockLoading },
        updateStockMutation: { mutate: updateStock, isLoading: updateStockLoading },
    } = useStock();

    const [updatedInventory, setUpdatedInventory] = useState({})

    const [newInventoryMetric, setNewMetric] = useState({
        metric_name: "",
        value: 0,
    });

    const handleAddInventoryData = async (newValues:any) => {
        try {
            addStock({ ...newValues })
            addStockOnClose();
        } catch {

        }

    }

    const handleUpdateInventoryData = async (updatedValues: any) => {
        try {
            updateStock({ ...updatedValues })
            updateStockOnClose();
        } catch {

        }
    }

    return (
        <Flex
            minH={'100vh'}
            align={'center'}
            justify={'flex-start'}
            direction="column"
            position={"relative"}
            padding={2}
            gap={30}
            bg={useColorModeValue('gray.50', 'gray.800')}
        >
              <section className="staff-table">
                <TableContainer>
                    <Table colorScheme='teal'>
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th isNumeric>Quanity Left</Th>
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
                                    </Tr>
                                ) :
                                stock?.map((data, index) => (
                                    <Tr key={index}>
                                        <Td>{data.key}</Td>
                                        <Td isNumeric>{data.value}</Td>

                                        <Td>
                                            <Button onClick={updateStockOnOpen} colorScheme="yellow">
                                                Update
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))
                            }
                        </Tbody>
                        <Tfoot>
                            <Tr>
                                <Td>
                                    <Button onClick={addStockOnOpen}>
                                        Add New Inventory Data
                                    </Button>
                                </Td>
                            </Tr>
                        </Tfoot>
                    </Table>
                </TableContainer>
            </section>


                
            <Modal isOpen={addStockIsOpen} onClose={addStockOnClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New Inventory Stock</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack spacing={4}>
                                <FormControl>
                                    <FormLabel>Name of Data</FormLabel>
                                    <Input
                                        placeholder="eg. Bags of Flour Left"
                                        onChange={(e) => {
                                            setNewMetric((prevVal) => ({ ...prevVal, metric_name: e.target.value }))
                                        }}

                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Quantity at Hand</FormLabel>
                                    <Input
                                        placeholder="eg. 10"
                                        type="number"
                                        onChange={(e) => {
                                            setNewMetric((prevVal) => ({ ...prevVal, value: Number(e.target.value) }))
                                        }}

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
                                disabled={addStockLoading}
                                onClick={() => {
                                    const metric_name = newInventoryMetric.metric_name.toLowerCase().replaceAll(" ", "_");
                                    handleAddInventoryData({ [metric_name]: newInventoryMetric.value })
                                }}
                            >
                                Add Production
                            </Button>
                        </ModalFooter>
                    </ModalContent>
            </Modal>


                          
            {/* Update Stock Modal */}
            <Modal isOpen={updateStockIsOpen} onClose={updateStockOnClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Update Inventory</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack spacing={4}>
                                {
                                    stock?.map((stock, index) => (
                                    <HStack key={index} alignItems="center" justifyContent="space-between">
                                        <Text>{stock.key}</Text>
                                        <NumberInput width="30%" height={10}>
                                            <NumberInputField value={stock.value} onChange={(e) => setUpdatedInventory((prevState:any) => ({ ...prevState, [stock.key]: Number(e.target.value) }))} /> 
                                        </NumberInput>
                                    </HStack>
                                    ))
                                }
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
                                disabled={updateStockLoading}
                                onClick={() => handleUpdateInventoryData({...updatedInventory})}
                            >
                                Update Inventory
                            </Button>
                        </ModalFooter>
                    </ModalContent>
            </Modal>
        </Flex>

    )
}

export default Inventory