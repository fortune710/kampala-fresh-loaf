import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { firestore } from "../environments/firebase"
import { FirebaseCollections, Stock } from "../types"

export const useStock = () => {
    const stockDocumentRef = doc(firestore, FirebaseCollections.Stock, "Stock");
    const queryClient = useQueryClient();

    const getStockQuery = useQuery([FirebaseCollections.Stock], async () => {
        const snapshot = await getDoc(stockDocumentRef);
        const dataInObjectForm = { ...snapshot.data() } as Stock;

        const data = Object.entries(dataInObjectForm).map(([key, value]) => ({
            key,
            value,
        }));
        return data;
          
    })

    const addStockMutation = useMutation(["add-stock"], async (newStock: any) => {
        await setDoc(stockDocumentRef, {
            ...newStock
        } as Stock, { merge: true })
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries([FirebaseCollections.Stock])
        }
    })

    const updateStockMutation = useMutation(["update-stock"], async (updatedDetails:any) => {
        await updateDoc(stockDocumentRef, {
            ...updatedDetails
        })
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries([FirebaseCollections.Stock])
        }
    })

    return {
        getStockQuery,
        addStockMutation,
        updateStockMutation
    }

}
