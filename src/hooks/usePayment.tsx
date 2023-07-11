import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useState, useEffect, useMemo } from "react";
import { firestore } from "../environments/firebase";
import { FirebaseCollections, Sales, SalesStatus } from "../types";


export const usePayment = (id:string) => {

    const ref = collection(firestore, FirebaseCollections.Invoices);
    const invoiceQuery = query(ref, where('payment_reference', "==", id));
    const queryClient = useQueryClient();

    const updateStatus = async (newStatus: SalesStatus) => {
        const ref = doc(firestore, FirebaseCollections.Invoices, id);
        await updateDoc(ref, {
            status: newStatus
        });
        queryClient.invalidateQueries([FirebaseCollections.Invoices])
    }
    

    const { mutate, isLoading, error, data: transaction } = useMutation(["get-payment"], async () => {
        let sales = [] as Sales[];
        const snapshot = await getDocs(invoiceQuery);

        if(snapshot.empty){
            return {} as Sales;
        } else {
            snapshot.forEach((doc) => {
                console.log(doc.data())
                sales = [...sales, doc.data() as Sales]
            })

            const payment = sales[0]! as Sales;
            return payment
        }

    })
        
    return { transaction, isLoading, error, updateStatus, mutate };
}