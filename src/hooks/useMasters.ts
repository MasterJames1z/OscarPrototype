import { useState, useCallback, useEffect } from 'react';
import type { Product, Vendor, Vehicle } from '../types';
import { API_BASE_URL } from '../config';

export function useMasters() {
    const [products, setProducts] = useState<Product[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMasters = useCallback(async () => {
        setLoading(true);
        try {
            const [prodRes, vendRes, vehRes] = await Promise.all([
                fetch(`${API_BASE_URL}/products`),
                fetch(`${API_BASE_URL}/vendors`),
                fetch(`${API_BASE_URL}/vehicles`)
            ]);

            if (prodRes.ok) setProducts(await prodRes.json());
            if (vendRes.ok) setVendors(await vendRes.json());
            if (vehRes.ok) setVehicles(await vehRes.json());
        } catch (err) {
            console.error('Failed to fetch master data', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMasters();
    }, [fetchMasters]);

    return {
        products,
        vendors,
        vehicles,
        loading,
        refresh: fetchMasters
    };
}
