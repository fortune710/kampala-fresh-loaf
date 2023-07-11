import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import { firestore } from "../environments/firebase";
import { FirebaseCollections, Product } from "../types";

interface IProduct extends Product {
    id: string;
}

export const useProducts = () => {
    
    const getProducts = async () => {
        let products = [] as IProduct[];
        const ref = collection(firestore, FirebaseCollections.Products);
        const snapshot = await getDocs(ref);

        if(snapshot.empty){
            return products;
        }

        snapshot.forEach((doc) => {
            products = [...products, { id: doc.id, ...doc.data() as any }]
        });
        return products;
    };

    const { isLoading, data: products, error } = useQuery(["ticket-classes"], getProducts, {
        refetchInterval: false,
        refetchOnWindowFocus: false,
    })
        
    return { products, isLoading, error };
}