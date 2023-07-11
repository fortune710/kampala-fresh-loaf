import { TableContainer, Table, Thead, Tr, Th, Button, Tbody, Td, Skeleton, Tfoot, useDisclosure, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, FormControl, FormLabel, Input, Stack, useToast, AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { useRef } from "react";
import { useState } from "react";
import { BiReset } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { QRCode } from "react-qrcode-logo";
import { firestore } from "../../environments/firebase";
import { useProducts } from "../../hooks/useProducts";
import { useStock } from "../../hooks/useStock";
import { FirebaseCollections, Product } from "../../types";

const Update: React.FC = () => {
    const { isLoading, products } = useProducts();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { 
        isOpen: updateisOpen, 
        onOpen: updateOnOpen, 
        onClose: updateOnClose
    } = useDisclosure();

    const { 
        isOpen: alertIsOpen,
        onOpen: alertOnOpen,
        onClose: alertOnClose 
    } = useDisclosure();

    const queryClient = useQueryClient();
    
    const [selectedProduct, setSelected] = useState<string>("");
    const [updateForm, setUpdateForm] = useState<any>(undefined);

    const [form, setForm] = useState<Product>({
        name: '',
        price: 0
    })
    const toast = useToast();

    const handleUpdateClick = (data:any) => {
        updateOnOpen();
        setUpdateForm(data);
    }

    const handleDeleteClick = (id:string) => {
        alertOnOpen();
        setSelected(id)
    }

    const addProduct = async () => {
        const ref = doc(firestore, FirebaseCollections.Products, form.name.replaceAll(' ', '-'))
        await setDoc(ref, {
            name: form.name,
            price: form.price,
        } as Product)
    }

    const addProductMutation = useMutation(["add-new-product"], addProduct, {
        onSuccess: () => {
            queryClient.invalidateQueries([FirebaseCollections.Products]);
            toast({
                title: "Added New Product Successfully",
                position: "top-right",
                status: "success",
                isClosable: true
            })
            onClose();
        },
        onError: (err: any) => {
            toast({
                title: err.code,
                position: "top-right",
                status: "success",
                isClosable: true
            })
        }
    })

    const updateProduct = async () => {
        const ref = doc(firestore, FirebaseCollections.Products, updateForm.id.replaceAll(' ', '-'))
        await updateDoc(ref, {
            ...form
        } as Partial<Product>)
    }

    const { mutate } = useMutation(["update-product"], updateProduct, {
        onSuccess: () => {
            queryClient.invalidateQueries([FirebaseCollections.Products]);
            toast({
                title: "Updated Class",
                position: "top-right",
                status: "success",
                isClosable: true
            })
            updateOnClose();
        },
        onError: (err: any) => {
            toast({
                title: err.code,
                position: "top-right",
                status: "success",
                isClosable: true
            })
        }
    })

    const deleteProduct = async (id:string) => {
        const ref = doc(firestore, FirebaseCollections.Products, id);
        await deleteDoc(ref)
    }

    const deleteProductMutation = useMutation(["delete-ticket-class"], (id:string) => deleteProduct(id), {
        onSuccess: () => {
            queryClient.invalidateQueries(["ticket-classes"]);
            toast({
                title: "Updated Class",
                position: "top-right",
                status: "success",
                isClosable: true
            })
            setSelected("")
            return alertOnClose();
        },
        onError: (err: any) => {
            toast({
                title: err.code,
                position: "top-right",
                status: "success",
                isClosable: true
            })
        }
    })

    const cancelRef = useRef<any>();
    
    return(
        <>
        
            <section className="staff-table">
                <TableContainer>
                    <Table colorScheme='teal'>
                        <Thead>
                            <Tr>
                                <Th>Product Name</Th>
                                <Th isNumeric>Product Price</Th>
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
                                products?.map((data:any) => (
                                    <Tr key={data.id}>
                                        <Td>{data.id}</Td>
                                        <Td isNumeric>{data.price}</Td>

                                        <Td>
                                            <Button
                                                onClick={() => handleUpdateClick(data)} 
                                                colorScheme="yellow">
                                                Update
                                            </Button>
                                        </Td>

                                        <Td>
                                            <Button
                                                colorScheme="red"
                                                onClick={() => handleDeleteClick(data.id)}
                                            >
                                                Delete
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))
                            }
                        </Tbody>
                        <Tfoot>
                            <Tr>
                                <Td>
                                    <Button onClick={onOpen}>
                                        Add New Product
                                    </Button>
                                </Td>
                            </Tr>
                        </Tfoot>
                    </Table>
                </TableContainer>
            </section>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody justifyContent={"center"}>
                        
                        <Stack spacing={4}>
                            <FormControl id="name">
                                <FormLabel>Product Name</FormLabel>
                                <Input  
                                    placeholder="eg. Jumbo Bread" 
                                    onChange={(e:any) => setForm({ ...form, name: e.target.value }) } 
                                    required
                                />
                            </FormControl>

                            <FormControl id="product_price">
                                <FormLabel>Product Price</FormLabel>
                                <Input 
                                    type="number" 
                                    onChange={(e:any) => setForm({ ...form, price: e.target.valueAsNumber })} 
                                    required
                                />
                            </FormControl>

                        </Stack>

                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            onClick={() =>  addProductMutation.mutate()} 
                            colorScheme='blue' 
                            mr={3} 
                        >
                            Add Product
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



            <Modal isOpen={updateisOpen} onClose={updateOnClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Update</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody justifyContent={"center"}>
                        
                        <Stack spacing={4}>
                            <FormControl id="name">
                                <FormLabel>Product Name</FormLabel>
                                <Input 
                                    value={updateForm?.id} 
                                    disabled
                                    placeholder="eg. Jumbo Bread" 
                                    required
                                />
                            </FormControl>

                            <FormControl id="price">
                                <FormLabel>Product Price</FormLabel>
                                <Input 
                                    defaultValue={updateForm?.price}
                                    type="number" 
                                    onChange={(e:any) => setForm({ ...form, price: e.target.valueAsNumber })} 
                                    required
                                />
                            </FormControl>

                        </Stack>

                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            onClick={() => mutate()} 
                            colorScheme='blue' 
                            mr={3} 
                        >
                            Update
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
            
            <AlertDialog
                motionPreset='slideInBottom'
                leastDestructiveRef={cancelRef}
                onClose={alertOnClose}
                isOpen={alertIsOpen}
                isCentered
            >
                <AlertDialogOverlay />

                <AlertDialogContent>
                <AlertDialogHeader>Delete Product?</AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>
                    Are you sure you want to delete this product?
                </AlertDialogBody>
                <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={alertOnClose}>
                        No
                    </Button>
                    <Button 
                        onClick={() => deleteProductMutation.mutate(selectedProduct)}
                        colorScheme='red' 
                        ml={3}>
                        Yes
                    </Button>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default Update;