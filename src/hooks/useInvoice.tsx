import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addDoc, collection, doc, getDocs, setDoc } from "firebase/firestore";
import { firestore } from "../environments/firebase";
import { FirebaseCollections, Sales } from "../types"

export const useInvoice = () => {

    const queryClient = useQueryClient();
    const invoicesRef = collection(firestore, FirebaseCollections.Invoices);

    const invoiceQuery = useQuery([FirebaseCollections.Invoices], async () => {
        let invoices = [] as Sales[];
        const snapshot = await getDocs(invoicesRef);

        if(snapshot.empty) return invoices;

        snapshot.forEach((doc) => {
            invoices = [...invoices, { id: doc.id, ...doc.data() } as Sales]
        })
        return invoices;
    })

    const addInvoiceMutation = useMutation(["add-invoice"], async (newSales: Omit<Sales, "id">) => {
        const invoicesRef = doc(firestore, FirebaseCollections.Invoices, newSales.payment_reference);
        await setDoc(invoicesRef, {
            ...newSales,
        })
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries([FirebaseCollections.Invoices])
        }
    })

    return {
        invoiceQuery, 
        addInvoiceMutation
    }
}