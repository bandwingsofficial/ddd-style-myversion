import { useState, useEffect } from "react";
import { getCategories } from "../api/get-categories";
import { Category } from "../types";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getCategories();
        if (mounted && response.success) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
        if (mounted) setError("Failed to load categories.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, []);

  return { categories, isLoading, error };
};